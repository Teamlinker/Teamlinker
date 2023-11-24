import {BaseModel} from '../../../common/model/base';
import {Err} from '../../../common/status/error';
import {Mapper} from './mapper';
import {emitServiceEvent} from "../event/event";
import {IServer_Common_Event_Types} from "../event/types";

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
        [param in keyof GET<Type>["model"]]?:GET<Type>["model"][param]
    }):Promise<Type[]>{
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
}

type GET<T>=T extends Entity<infer T1,Mapper<infer T1>>?T1:never
