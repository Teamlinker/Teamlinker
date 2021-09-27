import { ICommon_Model_User } from './../../../../common/model/user';
import { ECommon_Services } from '../../../../common/types';
import { IServer_Common_Nacos_Instance } from './../../types/nacos';
import { RedisStringKey } from './base';
import {cacheRedisType} from "../../types/cache"
import StringUtil from "../../util/string"
export namespace REDIS_USER {
    let USER_TOKEN_KEY=`${ECommon_Services.User}:user:{0}:token`
    let USER_INFO_KEY=`${ECommon_Services.User}:user:{0}:info`
    export function token(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_TOKEN_KEY,userId),cacheRedisType<string>().String,3600)
        obj.setTTL
        return obj
    }
    export function info(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_INFO_KEY,userId),cacheRedisType<ICommon_Model_User>().Object,3600)
        return obj
    }
}