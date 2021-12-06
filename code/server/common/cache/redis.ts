import * as IORedis from "ioredis";
import { IServer_Common_Config_Redis } from './../types/config';
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
    async get<T>(key:string,type:T):Promise<T> {
        let ret=await this.redis.get(key)
        let value=this.parseType(ret,type);
        return value
    }
    async set(key:string,value:any,ttl?:number)
    {
        if(value===null || value===undefined)
        {
            return
        }
        if(typeof value=="object")
        {
            await this.redis.set(key,JSON.stringify(value),"EX",ttl)
        }
        else
        {
            await this.redis.set(key,String(value),"EX",ttl)
        }
    }
    async scan(key:string):Promise<string[]> {
        let index=0,values=<string[]>[]
        do {
            let ret=await this.redis.scan(index,"match",key);
            index=Number(ret[0])
            values=values.concat(ret[1]);
        } while(index!=0)
        return values;
    }
    async getTTL(key:string):Promise<number> {
        let ret=await this.redis.ttl(key);
        return ret;
    }
    async setTTL(key:string,seconds:number):Promise<void> {
        await this.redis.expire(key,seconds);
    }
    async del(key:string) {
        await this.redis.del(key);
    }
    async exists(key:string) {
        let ret=await this.redis.exists(key)
        return !!ret
    }
}