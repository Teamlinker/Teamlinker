import { Redis } from "../redis";

class RedisBaseKey<T> {
    protected redis:InstanceType<typeof Redis>=(<any>global).redis
    protected type:T
    protected name:string
    constructor(name:string,type:T){
        this.name=name,
        this.type=type
    }
}

export class RedisStringKey<T> extends RedisBaseKey<T> {
    constructor(name:string,type:T){
        super(name,type)
    }
    async get():Promise<T>{
        let ret=await this.redis.get(this.name,this.type)
        return ret
    }
    async set(value:T,ttl?:number){
        await this.redis.set(this.name,value,ttl);
    }
}