import { IServer_Common_Nacos_Instance } from './../../types/nacos';
import { RedisStringKey } from './base';
import {cacheRedisType} from "../../types/cache"
export namespace REDIS_GATEWAY {
    export function instance(key:string)
    {
        let obj=new RedisStringKey(`instance:${key}`,cacheRedisType<IServer_Common_Nacos_Instance[]>().Object)
        return obj
    }
}