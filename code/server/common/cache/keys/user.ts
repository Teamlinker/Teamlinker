import { ECommon_Services } from '../../../../common/types';
import { IServer_Common_Nacos_Instance } from './../../types/nacos';
import { RedisStringKey } from './base';
import {cacheRedisType} from "../../types/cache"
import StringUtil from "../../util/string"
export namespace REDIS_USER {
    let USER_TOKEN_KEY=`${ECommon_Services.User}:user:{0}:token`
    export function token(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_TOKEN_KEY,userId),cacheRedisType<string>().String)
        return obj
    }
}