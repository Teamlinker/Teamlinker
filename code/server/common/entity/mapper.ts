import {BaseModel} from "../../../common/model/base";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../db/mysql";
import {
    EXPREXTRAVALUE,
    EXPRVALUE,
    generateCreateSql,
    generateDeleteLeftJoinSql,
    generateDeleteSql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId,
    generateUpdateSql
} from "../util/sql";

export abstract class Mapper<T extends BaseModel> {
    private model:T
    constructor(model:T){
        this.model=model
    }
    getModel() {
        return this.model
    }
    async createConfig(info:T["model"]){}
    async create(info:T["model"]):Promise<void> {
        if(!info || info.id){
            throw  Err.Common.paramError
        }
        await this.createConfig(info);
        info.id=await generateSnowId();
        var mysql=getMysqlInstance() 
        await mysql.execute(generateCreateSql(this.model,info))
    }
 
    async getById(id:string):Promise<T["model"]> {
        if(!id) {
            throw  Err.Common.itemNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(this.model,[],{
            id
        } as any))
        return ret
    }
    async getByExp(exp:{
        [param in keyof T["model"]]:T["model"][param]
    }):Promise<T["model"]> {
        if(!exp) {
            throw  Err.Common.itemNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(this.model,[],exp,"and",{
            field:"id",
            type:"desc"
        }))
        return ret
    }

    async getItemsByExp(exp:{
        [param in keyof (T)["model"]]?:Extract<EXPRVALUE,T["model"][param]|EXPREXTRAVALUE>
    } | {
        [param in `${"$and"|"$or"}${number}`]:{
            [param in keyof (T)["model"]]?:Extract<EXPRVALUE,T["model"][param]|EXPREXTRAVALUE>
        }
    }):Promise<T["model"][]> {
        if(!exp) {
            throw  Err.Common.itemNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.execute(generateQuerySql(this.model,[],exp))
        return ret
    }
    async updateConfig(info:T["model"]){}
    async update(data:T["model"]):Promise<void> {
        let info:T["model"]={}
        Object.assign(info,data)
        if(!info.id) {
            throw  Err.Common.itemNotFound
        }
        var mysql=getMysqlInstance();
        await this.updateConfig(info)
        let id=info.id;
        delete info.id
        if(info.created_time) {
            delete info.created_time
        }
        if(info.modified_time) {
            delete info.modified_time
        }
        await mysql.execute(generateUpdateSql(this.model,info,{id}))
    }

    async delete(id):Promise<void> {
        if(!id) {
            throw Err.Common.itemNotFound
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateDeleteSql(this.model,{id}))
    }

    async copy(id:string,deletedFields?:string[],updatedFields?:{
        [name in keyof T["model"]]?:T["model"][name]
    },newName?:string):Promise<T["model"]> {
        if(!id) {
            throw Err.Common.itemNotFound
        }
        let mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(this.model,[],{id} as any))
        if(!ret) {
            throw Err.Common.itemNotFound
        }
        delete ret.created_time;
        delete ret.modified_time;
        delete ret.id
        delete ret.reserved
        if(deletedFields && deletedFields.length>0) {
            for(let obj of deletedFields) {
                delete ret[obj]
            }
        }
        if(updatedFields) {
            for(let name in updatedFields) {
                ret[name]=updatedFields[name];
            }
        }
        if(newName && ret.name) {
            (<any>ret).name=newName
        }
        await this.create(ret);
        let obj=await this.getById(ret.id)
        return obj;
    }

    async batchDelete(param:{
        [param in keyof T["model"]]?:Extract<EXPRVALUE,T["model"][param]|EXPREXTRAVALUE>
    } | {
        [param in `${"$and"|"$or"}${number}`]:{
            [param in keyof T["model"]]?:Extract<EXPRVALUE,T["model"][param]|EXPREXTRAVALUE>
        }
    }) :Promise<void>{
        let mysql=getMysqlInstance();
        if(param) {
            await mysql.execute(generateDeleteSql(this.model,param))
        }
    }

    async batchLeftJoinQuery<T1 extends BaseModel>(columns:(keyof T["model"])[],joinModel: {
        model: T1,
        columns:(keyof T1["model"])[]
        expression: {
            [key in keyof T1["model"]]?: {
                field: keyof T1["model"]
            }
        }
    }, objExpr: {
        [param in keyof (T & T1)["model"]]?: {
            value: Extract<EXPRVALUE,(T & T1)["model"][param]|EXPREXTRAVALUE>,
            model: T | T1
        }
    } | {
        [param in `${"$and" | "$or"}${number}`] :{
            [param in keyof (T & T1)["model"]]?: {
                value: Extract<EXPRVALUE,(T & T1)["model"][param]|EXPREXTRAVALUE>,
                model: T | T1
            }
        }
    }){
        let mysql=getMysqlInstance();
        let obj:{
            [key in keyof T1["model"]]?: {
                field: keyof T1["model"],
                model:T
            }
        }=joinModel.expression as any
        for(let key in obj) {
            obj[key].model=this.model
        }
        let sql=generateLeftJoinSql<T,T1,keyof T["model"],keyof T1["model"],"$0","$1">({
            model:this.model,
            columns:columns as any,
            aggregation:"$0"
        },{
            model:joinModel.model,
            columns:joinModel.columns as any,
            expression:obj,
            aggregation:"$1"
        },objExpr)
        let ret=await mysql.execute(sql)
        return ret;
    }

    async batchLeftJoinDelete<T1 extends BaseModel>(joinModel: {
        model: T1,
        expression: {
            [key in keyof T1["model"]]?: {
                field: keyof T["model"]
            }
        },
        isDelete:boolean
    }, objExpr?: {
        [param in keyof (T1 & T)["model"]]?: {
            value: Extract<EXPRVALUE,(T1 & T)["model"][param]|EXPREXTRAVALUE>,
            model: T1 | T
        }
    } | {
        [param in `${"$and" | "$or"}${number}`] :{
            [param in keyof (T1 & T)["model"]]?: {
                value: Extract<EXPRVALUE,(T1 & T)["model"][param]|EXPREXTRAVALUE>,
                model: T1 | T
            }
        }
    }){
        let mysql=getMysqlInstance();
        let obj:{
            [key in keyof T1["model"]]?: {
                field: keyof T["model"],
                model:T
            }
        }=joinModel.expression as any
        for(let key in obj) {
            obj[key].model=this.model
        }
        let sql=generateDeleteLeftJoinSql(this.model,{
            model:joinModel.model,
            expression:obj,
            isDelete:joinModel.isDelete
        },objExpr)
        let ret=await mysql.execute(sql)
        return ret;
    }
}










