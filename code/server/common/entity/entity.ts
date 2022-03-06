import { BaseModel } from '../../../common/model/base';
import { Err } from '../../../common/status/error';
import { EServer_Common_Event_Types } from '../event/types';
import { emitServiceEvent } from '../rpc/rpc';
import { Mapper } from './mapper';
let imagefields=[
    "photo",
    "image",
    "img",
    "icon"
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
        if(typeof(item)=="object") {
            if(!this.item || clear) {
                this.item=<T>{}
            }
            for(let key in item) {
                this.item[key]=item[key]
            }
        }
    }
    getItem():T["model"] {
        return this.item;
    }
    async create():Promise<T["model"]> {
        if(!this.item) {
            throw  Err.Common.itemNotFound;
        } else if(this.item.id) {
            throw  Err.Common.itemExists;
        }
        await this.mapper.create(this.item)
        await this.loadItem();
        imagefields.forEach(item=>{
            if(this.item[item]) {
                emitServiceEvent(EServer_Common_Event_Types.File.REF,this.item[item])
            }
        })
        return this.item;
    }
    async update():Promise<T["model"]>{
        if(!this.item || !this.item.id) {
            throw  Err.Common.itemNotFound;
        }
        let ret=await this.mapper.getById(this.item.id)
        await this.mapper.update(this.item)
        imagefields.forEach(item=>{
            if(!ret[item] && this.item[item]) {
                emitServiceEvent(EServer_Common_Event_Types.File.REF,this.item[item])
            } else if(ret[item] && ret[item]!=this.item[item]) {
                if(this.item[item]) {
                    emitServiceEvent(EServer_Common_Event_Types.File.REF,this.item[item])
                }
                emitServiceEvent(EServer_Common_Event_Types.File.UNREF,ret[item])
            }
        })
        await this.loadItem();
        return this.item;
    }
    async delete(eventPulish?:EServer_Common_Event_Types.Types){
        await this.mapper.delete(this.item.id);
        if(eventPulish) {
            emitServiceEvent(eventPulish,this.item.id);
        }
        imagefields.forEach(item=>{
            if(this.item[item]) {
                emitServiceEvent(EServer_Common_Event_Types.File.UNREF,this.item[item])
            }
        })
        
    }

    async copy(deletedFields?:(keyof T["model"])[]) {
        if(!this.item || !this.item.id) {
            throw  Err.Common.itemNotFound;
        }
        const Cls = this.constructor as new (value: M) => this;
        let obj=new Cls(this.mapper)
        let data=await this.mapper.copy(this.item.id,deletedFields as string[])
        obj.setItem(data)
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
}