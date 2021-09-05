import { IServer_Common_Config_Redis } from './../types/config';
import * as IORedis from "ioredis"
var g_redis:InstanceType<typeof Redis>;
export function getRedisInstance(){
    return g_redis
}
export class Redis {
    private redis:InstanceType<typeof IORedis>
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
        g_redis=this;
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
    async scan<T>(key:string,type:T):Promise<T[]> {
        let index=0,values=<T[]><unknown>[]
        do {
            let ret=await this.redis.scan(index,"match",key);
            index=Number(ret[0])
            values=values.concat(ret[1].map(item=>{
                return this.parseType(item,type)
            }));
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
}