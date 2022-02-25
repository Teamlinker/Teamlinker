
import IORedis = require("ioredis");
import { getRedisInstance, Redis } from "../redis";
abstract class RedisBaseKey<T> {
    protected redis:InstanceType<typeof Redis>=getRedisInstance()
    protected type:T
    protected name:string
    protected ttl:number
    constructor(name:string,type:T,ttl?:number){
        this.name=name
        this.type=type
        this.ttl=ttl
    }
    getKey() {
        return this.name
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
    async exists():Promise<boolean> {
        let ret=await this.redis.exists(this.name)
        return ret;
    }
    abstract  get(...argv:any):Promise<T>
    abstract set(value:any,ttl?:number)
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


export class RedisSetKey extends RedisBaseKey<string[]> {
    constructor(name:string,ttl?:number){
        super(name,[""],ttl)
    }
    async get():Promise<string[]>{
        let ret=await this.redis.sGet(this.name)
        return ret
    }
    async set(value:string[],ttl?:number){
        await this.redis.sSet(this.name,value,ttl??this.ttl);
    }
}

export class RedisHashKey extends RedisBaseKey<string> {
    constructor(name:string,ttl?:number){
        super(name,"",ttl)
    }
    async get(field:string):Promise<string>{
        let ret=await this.redis.hGet(this.name,field)
        return ret
    }
    async set(value:{
        [param:string]:IORedis.ValueType
    },ttl?:number){
        await this.redis.hSet(this.name,value,ttl??this.ttl);
    }
}