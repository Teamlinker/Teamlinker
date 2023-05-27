import IORedis from "ioredis";
import {IServer_Common_Config_Redis} from './../types/config';

var g_redis:InstanceType<typeof Redis>;
export function getRedisInstance(){
    return g_redis
}
export class Redis {
    private redis:InstanceType<typeof IORedis>
    private watchMap:Map<string,Function>=new Map
    private parseType(value:any,type:any){
        let t=typeof type;
        if(value==null)
        {
            return null
        }
        if(t=="boolean")
        {
            if(value=="true")
            {
                return true;
            }
            else
            {
                return false
            }
        }
        else if(t=="number")
        {
            return Number(value)
        }
        else if(t=="object")
        {
            try{
                return JSON.parse(value)
            }catch(err){
                return null
            }
        }
        else
        {
            return value
        }
    }
    constructor(info:IServer_Common_Config_Redis){
        this.redis=new IORedis({
            port:info.port,
            host:info.url,
            password:info.password,
            db:info.db
        })
        // @ts-ignore
        this.redis.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], ()=>{
            let sub=this.redis.duplicate()
            sub.subscribe(`__keyevent@${info.db}__:expired`,()=>{
                sub.on("message",(channel,key)=>{
                    if(this.watchMap.has(key)){
                        let func=this.watchMap.get(key)
                        this.watchMap.delete(key)
                        func(key)
                    }
                })
                sub.on("error",()=>{
                    this.watchMap.clear()
                })
            })
        })
        g_redis=this;
    }
    listenExpired(key:string,func:{(key:string):void}){
        this.watchMap.set(key,func)
    }
    getIORedis() {
        return this.redis;
    }
    async get<T>(key:string,type:T):Promise<T> {
        let ret=await this.redis.get(key)
        let value=this.parseType(ret,type);
        return value
    }
    async mget<T>(key:string[],type:T):Promise<T> {
        let ret=await this.redis.mget(key)
        ret=ret.map(item=>{
            return this.parseType(item,type)
        })
        return <T><unknown>ret
    }
    async mset(obj:{
        [param:string]:any
    }) {
        if(obj===null || obj===undefined)
        {
            return
        }
        await this.redis.mset(obj)
    }
    async set(key:string,value:any,ttl?:number)
    {
        if(value===null || value===undefined)
        {
            return
        }
        if(typeof value=="object")
        {
            if(ttl==-1) {
                await this.redis.set(key,JSON.stringify(value))
                await this.redis.persist(key);
            } else {
                await this.redis.set(key,JSON.stringify(value),"EX",ttl)
            }
        }
        else
        {
            if(ttl==-1) {
                await this.redis.set(key,String(value))
                await this.redis.persist(key);
            } else {
                await this.redis.set(key,String(value),"EX",ttl)
            }

        }
    }
    async scan(key:string):Promise<string[]> {
        let index=0,values=<string[]>[]
        do {
            let ret=await this.redis.scan(index,"MATCH",key);
            index=Number(ret[0])
            values=values.concat(ret[1]);
        } while(index!=0)
        return values;
    }
    async getTTL(key:string):Promise<number> {
        let ret=await this.redis.ttl(key);
        return ret;
    }
    async setTTL(key:string,seconds:number=-1):Promise<void> {
        if(seconds==-1) {
            await this.redis.persist(key)
        } else {
            await this.redis.expire(key,seconds);
        }
    }
    async del(key:string) {
        await this.redis.del(key);
    }
    async exists(key:string) {
        let ret=await this.redis.exists(key)
        return !!ret
    }
    async flush() {
        await this.redis.flushdb()
    }
    async sGet(key:string):Promise<string[]> {
        let exist=await this.exists(key)
        if(exist) {
            let ret=await this.redis.smembers(key)
            return ret;
        }
        return null;
    }
    async sSet(key:string,values:string[],ttl:number=-1) {
        if(values && values.length>0) {
            await this.redis.sadd(key,...values)
            await this.setTTL(key,ttl);
        }
        
    }
    async hGet(key:string,field:string):Promise<string> {
        let exist=await this.exists(key)
        if(exist) {
            let ret=await this.redis.hget(key,field);
            return ret
        }
        return null;
    }
    async hSet(key:string,obj:{
        [param:string]:any
    },ttl:number=-1){
        if(Object.keys(obj).length>0) {
            await this.redis.hset(key,obj)
            await this.setTTL(key,ttl);
        }
    }

    async hDel(key:string,...fields:string[]){
        await this.redis.hdel(key,...fields)
    }

    async hGetAll(key:string) :Promise<object>{
        let exist=await this.exists(key)
        if(exist) {
            let ret=await this.redis.hgetall(key);
            return ret;
        }
        return null;
    }
    async hGetAllKey(key:string) {
        let exist=await this.exists(key)
        if(exist) {
            let ret=await this.redis.hkeys(key)
            return ret;
        }
        return null;
    }
    async hExists(key:string,field:string):Promise<boolean> {
        let ret=await this.redis.hexists(key,field)
        return !!ret;
    }
    async sExists(key:string,field:string):Promise<boolean> {
        let ret=await this.redis.sismember(key,field)
        return !!ret;
    }
}