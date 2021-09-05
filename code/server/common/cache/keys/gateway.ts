import { ECommon_Services } from '../../../../common/types';
import { IServer_Common_Nacos_Instance } from './../../types/nacos';
import { RedisStringKey } from './base';
import {cacheRedisType} from "../../types/cache"
import StringUtil from "../../util/string"
export namespace REDIS_GATEWAY {
    let INSTANCE_KEY=`${ECommon_Services.GateWay}:instance:{0}`
    let INSTANCES_KEY=`${ECommon_Services.GateWay}:instance:*`
    export function instances(key:string)
    {
        let obj=new RedisStringKey(StringUtil.format(INSTANCE_KEY,key),cacheRedisType<IServer_Common_Nacos_Instance[]>().Object)
        return obj
    }
    export function allInstances() {
        let obj=new RedisStringKey(INSTANCES_KEY,cacheRedisType<IServer_Common_Nacos_Instance[]>().Object);
        return obj;
    }
}