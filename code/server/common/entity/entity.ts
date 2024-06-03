import {BaseModel} from '../../../common/model/base';
import {Err} from '../../../common/status/error';
import {Mapper} from './mapper';
import {emitServiceEvent} from "../event/event";
import {IServer_Common_Event_Types} from "../event/types";
import {EXPREXTRAVALUE, EXPRVALUE} from "../util/sql";
import {Options} from "amqplib";


let fileFields=[
    "photo",
    "image",
    "img",
    "icon",
    "file_id",
    "wallpaper",
    "meeting_background_img"
]
export abstract class Entity<T extends BaseModel,M extends Mapper<T>> {
    protected item:T["model"];
    protected _item:T["model"];
    protected mapper:M
    constructor(mapper:M) {
        this.mapper=mapper
    }
    getId():string{
        if(this.item) {
            return (<any>this.item).id
        } else {
            return null;
        }
    }
    setItem(item:T["model"]) {
        this.item=item
    }
    assignItem(item:Partial<T["model"]>,clear:boolean=false) {
        this._item={...this.item}
        if(typeof(item)=="object") {
            if(!this.item || clear) {
                this.item=<T>{}
            }
            for(let key in item) {
                this.item[key]=item[key]
            }
        }
    }
    getBackItem():T["model"] {
        return this._item
    }
    getItem():T["model"] {
        return this.item;
    }
    async create(...param:any):Promise<T["model"]> {
        if(!this.item) {
            throw  Err.Common.itemNotFound;
        } else if(this.item.id) {
            throw  Err.Common.itemExists;
        }
        await this.mapper.create(this.item)
        await this.loadItem();
        fileFields.forEach(item=>{
            if(this.item[item]) {
                emitServiceEvent("fileRef",this.item[item])
            }
        })
        return this.item;
    }
    async update(...param:any):Promise<T["model"]>{
        if(!this.item || !this.item.id) {
            throw  Err.Common.itemNotFound;
        }
        let ret=await this.mapper.getById(this.item.id)
        await this.mapper.update(this.item)
        fileFields.forEach(item=>{
            if(!ret[item] && this.item[item]) {
                emitServiceEvent("fileRef",this.item[item])
            } else if(ret[item] && ret[item]!=this.item[item]) {
                if(this.item[item]) {
                    emitServiceEvent("fileRef",this.item[item])
                }
                emitServiceEvent("fileUnref",ret[item])
            }
        })
        await this.loadItem();
        return this.item;
    }
    async delete(eventPublish?:keyof IServer_Common_Event_Types,...param:any){
        await this.mapper.delete(this.item.id);
        if(eventPublish) {
            emitServiceEvent(eventPublish,this.item.id);
        }
        fileFields.forEach(item=>{
            if(this.item[item]) {
                emitServiceEvent("fileUnref",this.item[item])
            }
        })
        
    }

    async copy(deletedFields?:(keyof T["model"])[],updatedFields?:{
        [name in keyof T["model"]]?:T["model"][name]
    }) {
        if(!this.item || !this.item.id) {
            throw  Err.Common.itemNotFound;
        }
        const Cls = this.constructor as new (value: M) => this;
        let obj=new Cls(this.mapper)
        let data=await this.mapper.copy(this.item.id,deletedFields as string[],updatedFields)
        obj.setItem(data)
        fileFields.forEach(item=>{
            if(this.item[item]) {
                emitServiceEvent("fileRef",this.item[item])
            }
        })
        return obj;
    }

    async loadItem():Promise<T["model"]>{
        if(!this.item || !this.item.id) {
            throw  Err.Common.itemNotFound;
        }
        let obj = await this.mapper.getById(this.item.id);
        this.item=obj;
        return this.item;
    } 
    static async getItemById<Type>(this:{new():Type},id:string):Promise<Type>{
        if(!id) {
            return null
        }
        let user = new this() as any;
        let obj = await user.mapper.getById(id);
        if(obj) {
            user.setItem(obj);
            return user;
        } else {
            return null;
        }
    }

    static async getItemByExp<Type>(this:{new():Type},exp:{
        [param in keyof GET<Type>["model"]]?:GET<Type>["model"][param]
    }):Promise<Type>{
        if(!exp) {
            return null
        }
        let user = new this() as any;
        let obj = await user.mapper.getByExp(exp);
        if(obj) {
            user.setItem(obj);
            return user;
        } else {
            return null;
        }
    }

    static async getItemsByExp<Type>(this:{new():Type},exp:{
        [param in ((keyof GET<Type>["model"])|`${"$and"|"$or"}${number}`)]?:EXPRVALUE|{
        [param in keyof GET<Type>["model"]]?:EXPRVALUE
    }}):Promise<Type[]>{
        if(!exp) {
            return null
        }
        let user = new this() as any;
        let arr = await user.mapper.getItemsByExp(exp);
        if(arr.length>0) {
            let ret=[]
            for(let obj of arr) {
                let objService=new this() as any
                objService.setItem(obj)
                ret.push(objService)
            }
            return ret;
        } else {
            return [];
        }
    }

    static async batchDelete<Type>(this:{new():Type},exp:{
        [param in keyof GET<Type>["model"]]?:Extract<EXPRVALUE,GET<Type>["model"][param]|EXPREXTRAVALUE>
    } | {
        [param in `${"$and"|"$or"}${number}`]:{
            [param in keyof GET<Type>["model"]]?:Extract<EXPRVALUE,GET<Type>["model"][param]|EXPREXTRAVALUE>
        }
    },isDirect:boolean=true,eventPublish?:keyof IServer_Common_Event_Types,...param:any):Promise<void>{
        if(!exp) {
            return null
        }
        if(isDirect) {
            let user = new this() as any;
            await user.mapper.batchDelete(exp)
        } else {
            let user = new this() as any;
            let arr = await user.mapper.getItemsByExp(exp);
            if(arr.length>0) {
                let ret:Entity<GET<Type>,typeof user.mapper>[]=[]
                for(let obj of arr) {
                    let objService=new this() as any
                    objService.setItem(obj)
                    ret.push(objService)
                }
                if(ret.length>0) {
                    let arrPromise=ret.map(value => {
                        return value.delete(eventPublish,param)
                    })
                    await Promise.all(arrPromise)
                }
            }
        }
    }

    static async batchLeftJoinDelete<Type extends Entity<T,M>,T2 extends Entity<T1,T3>,T1 extends BaseModel,T3 extends Mapper<T1>,T extends BaseModel,M extends Mapper<T>>(this:{new():Type},columns:(keyof GET<Type>["model"])[],joinEntity: {
        entity: T2,
        expression: {
            [key in keyof T1["model"]]?: {
                field: keyof T1["model"]
            }
        },
        columns:(keyof T1["model"])[],
        isDelete:boolean
    }, objExpr: {
        [param in keyof (GET<Type> & T1)["model"]]?: {
            value: Extract<EXPRVALUE,(GET<Type> & T1)["model"][param]|EXPREXTRAVALUE>,
            model: GET<Type> | T1
        }
    } | {
        [param in `${"$and" | "$or"}${number}`] :{
            [param in keyof (GET<Type> & T1)["model"]]?: {
                value: Extract<EXPRVALUE,(GET<Type> & T1)["model"][param]|EXPREXTRAVALUE>,
                model: GET<Type> | T1
            }
        }
    },isDirect:boolean,eventPublish?:keyof IServer_Common_Event_Types,...param:any):Promise<void>{
        if(isDirect) {
            let user:Entity<T, M> = new this();
            await user.mapper.batchLeftJoinDelete<T1>({
                ...joinEntity,
                model:joinEntity.entity.mapper.getModel()
            },objExpr)
        } else {
            let user:Entity<T, M> = new this();
            let arr = await user.mapper.batchLeftJoinQuery<T1>(columns,{
                ...joinEntity,
                model:joinEntity.entity.mapper.getModel(),
                columns:joinEntity.columns
            },objExpr);
            if(arr.length>0) {
                let ret:Entity<T, M>[]=[]
                let ret1:Entity<T1, T3>[]=[]
                for(let obj of arr) {
                    if(obj.$0?.id) {
                        let objService:Entity<T, M>=new this()
                        objService.setItem(obj.$0)
                        ret.push(objService)
                    }
                    if(obj.$1?.id && joinEntity.isDelete) {
                        let objService:Entity<T1, T3>=Object.create(joinEntity.entity)
                        objService.setItem(obj.$1)
                        ret1.push(objService)
                    }
                }
                if(ret.length>0) {
                    let arrPromise=[...ret,...ret1].map(value => {
                        return value.delete(eventPublish,param)
                    })
                    await Promise.all(arrPromise)
                }
            }
        }
    }
}

type GET<T>=T extends Entity<infer T1,Mapper<infer T1>>?T1:never
