import {ECommon_Services} from '../../../../common/types';
import {cacheRedisType} from "../../types/cache";
import StringUtil from "../../util/string";
import {ICommon_Model_User} from './../../../../common/model/user';
import {RedisStringKey} from './base';
import {IServer_Common_RPC_User_CheckSession_Organization} from "../../../user/types/config";

export interface ICommon_Register_Cache_Info {
    username?:string,
    password?:string,
    userId?:string
    sendTime:number,
    code:string
}
export namespace REDIS_USER {
    let USER_TOKEN_KEY=`${ECommon_Services.User}:user:{0}:token`
    let USER_INFO_KEY=`${ECommon_Services.User}:user:{0}:info`
    let ADMIN_INFO_KEY=`${ECommon_Services.User}:admin:{0}:info`
    let USER_ORGANIZATION_KEY=`${ECommon_Services.User}:user:{0}:organization`
    let USER_REGISTER_KEY=`${ECommon_Services.User}:username:{0}:register`
    let USER_RESET_CODE_KEY=`${ECommon_Services.User}:user:{0}:reset`
    export function token(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_TOKEN_KEY,userId),cacheRedisType<string>().String,3600)
        return obj
    }
    export function info(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_INFO_KEY,userId),cacheRedisType<ICommon_Model_User>().Object,3600)
        return obj
    }
    export function adminInfo(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(ADMIN_INFO_KEY,userId),cacheRedisType<ICommon_Model_User>().Object,3600)
        return obj
    }
    export function organizationInfo(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_ORGANIZATION_KEY,userId),cacheRedisType<IServer_Common_RPC_User_CheckSession_Organization>().Object,-1)
        return obj
    }
    export function registerCacheInfo(username:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_REGISTER_KEY,username),cacheRedisType<ICommon_Register_Cache_Info>().Object,600)
        return obj
    }
    export function resetCode(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_RESET_CODE_KEY,userId),cacheRedisType<ICommon_Register_Cache_Info>().Object,600)
        return obj
    }

}