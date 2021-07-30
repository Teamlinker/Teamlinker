import { IServer_Common_Config_Redis } from './../types/config';
import * as IORedis from "ioredis"
var g_redis:InstanceType<typeof Redis>;
export function getRedisInstance(){
    return g_redis
}
export class Redis {
    private redis:InstanceType<typeof IORedis>
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
        let value:any=null;
        let t=typeof type;
        if(ret==null)
        {
            value=null
        }
        if(t=="boolean")
        {
            if(ret=="true")
            {
                value=true;
            }
            else
            {
                value=false
            }
        }
        else if(t=="number")
        {
            value=Number(ret)
        }
        else if(t=="object")
        {
            try{
                value=JSON.parse(ret)
            }catch(err){
                value=null
            }
        }
        else
        {
            value=ret
        }
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
}