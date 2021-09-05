
import { getRedisInstance, Redis } from "../redis";
class RedisBaseKey<T> {
    protected redis:InstanceType<typeof Redis>=getRedisInstance()
    protected type:T
    protected name:string
    constructor(name:string,type:T){
        this.name=name,
        this.type=type
    }
    async getTTL():Promise<number> {
        let ret=await this.redis.getTTL(this.name)
        return ret;
    }
    async setTTL(seconds:number):Promise<void> {
        await this.redis.setTTL(this.name,seconds)
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
    async scan():Promise<T[]>{
        let ret=await this.redis.scan<T>(this.name,this.type);
        return ret
    }
}
