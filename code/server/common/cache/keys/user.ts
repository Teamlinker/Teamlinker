import { ECommon_Services } from '../../../../common/types';
import { cacheRedisType } from "../../types/cache";
import StringUtil from "../../util/string";
import { ICommon_Model_Admin } from './../../../../common/model/admin';
import { ICommon_Model_User } from './../../../../common/model/user';
import { RedisStringKey } from './base';
export namespace REDIS_USER {
    let USER_TOKEN_KEY=`${ECommon_Services.User}:user:{0}:token`
    let USER_INFO_KEY=`${ECommon_Services.User}:user:{0}:info`
    let ADMIN_INFO_KEY=`${ECommon_Services.User}:admin:{0}:info`
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
    export function adminInfo(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(ADMIN_INFO_KEY,userId),cacheRedisType<ICommon_Model_Admin>().Object,3600)
        return obj
    }
}