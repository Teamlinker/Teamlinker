import { BaseModel } from '../../../common/model/base';
import { Err } from '../../../common/status/error';
import { EServer_Common_Event_Types } from '../event/types';
import { emitServiceEvent } from '../rpc/rpc';
import { Mapper } from './mapper';
export abstract class Entity<T extends BaseModel,M extends Mapper<T>> {
    protected item:T["model"];
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
    assignItem(item:Partial<T["model"]>) {
        if(typeof(item)=="object") {
            if(!this.item) {
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
        return this.item;
    }
    async update():Promise<T["model"]>{
        if(!this.item || !this.item.id) {
            throw  Err.Common.itemNotFound;
        }
        await this.mapper.update(this.item)
        return this.item;
    }
    async delete(eventPulish?:EServer_Common_Event_Types.Types){
        await this.mapper.delete(this.item.id);
        if(eventPulish) {
            emitServiceEvent(eventPulish,this.item.id);
        }
        
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