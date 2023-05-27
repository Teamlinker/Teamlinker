import {getRedisInstance, Redis} from "../redis";

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

export class RedisBatchStringKey<T> extends RedisBaseKey<T> {
    protected names:string[];
    constructor(names:string[],type:T){
        super(null,type,-1)
        this.names=this.names
    }
    async get():Promise<T>{
        let ret=await this.redis.mget(this.names,this.type)
        return ret
    }
    async set(values:T){
        if(!values) {
            return;
        }
        let obj={}
        for(let i=0;i<this.names.length;i++) {
            obj[this.names[i]]=values[i];
        }
        await this.redis.mset(obj);
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
    async check(field:string):Promise<boolean> {
        let ret=await this.redis.sExists(this.name,field);
        return ret;
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
        [param:string]:any
    },ttl?:number){
        await this.redis.hSet(this.name,value,ttl??this.ttl);
    }
    async delField(...fields:string[]) {
        await this.redis.hDel(this.name,...fields)
    }
    async getAll():Promise<object> {
        let ret=await this.redis.hGetAll(this.name)
        return ret;
    }
    async check(field:string):Promise<boolean> {
        let ret=await this.redis.hExists(this.name,field);
        return ret;
    }
    async getKeys() {
        let ret=await this.redis.hGetAllKey(this.name)
        return ret;
    }
}

export abstract class BaseRedisCache<T> {
    abstract key:string
    abstract objRedis;
    getKey() {
        return this.objRedis.getKey();
    }
    abstract getValue(...argv:any):Promise<T>
    async del() {
        await this.objRedis.del();
    }
}

export abstract class BaseRedisStringCache<T> extends BaseRedisCache<T> {
    objRedis:RedisStringKey<T>;
}

export abstract class BaseRedisHashCache<T> extends BaseRedisCache<T> {
    objRedis:RedisHashKey;
    async check(id:string) {
        let ret=await this.objRedis.check(id);
        return ret;
    }
    async keys() {
        let ret=await this.objRedis.getKeys()
        return ret;
    }
}

export abstract class BaseRedisSetCache<T> extends BaseRedisCache<T> {
    objRedis:RedisSetKey;
    async check(id:string) {
        let ret=await this.objRedis.check(id);
        return ret;
    }
}