import { BaseModel } from "../../../common/model/base";
import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../db/mysql";
import { generateCreateSql, generateDeleteSql, generateQuerySql, generateSnowId, generateUpdateSql } from "../util/sql";

export abstract class Mapper<T extends BaseModel> {
    private model:T
    constructor(model:T){
        this.model=model
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
        let ret=await mysql.executeOne(generateQuerySql(this.model,[],{id}))
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
    async copy(id:string,deletedFields?:string[]):Promise<T["model"]> {
        if(!id) {
            throw Err.Common.itemNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(this.model,[],{id}))
        if(!ret) {
            throw Err.Common.itemNotFound
        }
        delete ret.created_time;
        delete ret.modified_time;
        delete ret.id
        if(deletedFields && deletedFields.length>0) {
            for(let obj of deletedFields) {
                delete ret[obj]
            }
        }
        if(ret.name) {
            (ret as any).name+="(copy)"
        }
        await this.create(ret);
        let obj=this.getById(ret.id)
        return obj;
    }
}