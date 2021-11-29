
import { getRedisInstance, Redis } from "../redis";
class RedisBaseKey<T> {
    protected redis:InstanceType<typeof Redis>=getRedisInstance()
    protected type:T
    protected name:string
    protected ttl:number
    constructor(name:string,type:T,ttl?:number){
        this.name=name
        this.type=type
        this.ttl=ttl
    }
    async getTTL():Promise<number> {
        let ret=await this.redis.getTTL(this.name)
        return ret;
    }
    async setTTL(seconds:number):Promise<void> {
        await this.redis.setTTL(this.name,seconds)
    }
    async del() {
        await this.redis.del(this.name);
    }
}

export class RedisStringKey<T> extends RedisBaseKey<T> {
    constructor(name:string,type:T,ttl?:number){
        super(name,type,ttl)
    }
    async get():Promise<T>{
        let ret=await this.redis.get(this.name,this.type)
        return ret
    }
    async set(value:T,ttl?:number){
        await this.redis.set(this.name,value,ttl??this.ttl);
    }
    async scan():Promise<string[]>{
        let ret=await this.redis.scan(this.name);
        return ret
    }
}
