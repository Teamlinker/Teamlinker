import {ECommon_Platform_Type, ECommon_Services} from '../../../../common/types';
import {cacheRedisType} from "../../types/cache";
import StringUtil from "../../../../common/util/string";
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
    let USER_TOKEN_KEY=`platform:{0}:${ECommon_Services.User}:user:{1}:token`
    let USER_INFO_KEY=`${ECommon_Services.User}:user:{0}:info`
    let ADMIN_INFO_KEY=`${ECommon_Services.User}:admin:{0}:info`
    let USER_ORGANIZATION_KEY=`platform:{0}:${ECommon_Services.User}:user:{1}:organization`
    let USER_REGISTER_KEY=`${ECommon_Services.User}:username:{0}:register`
    let USER_RESET_CODE_KEY=`${ECommon_Services.User}:user:{0}:reset`
    let WECHAT_OPEN_ID_KEY=`${ECommon_Services.User}:wechat:openid`
    let USER_PLATFORM_LIST=`${ECommon_Services.User}:user:{0}:platform:list`
    export function token(platform:ECommon_Platform_Type,userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_TOKEN_KEY,platform,userId),cacheRedisType<string>().String,300)
        return obj
    }
    export function info(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_INFO_KEY,userId),cacheRedisType<ICommon_Model_User & {
            lang?:string
        }>().Object,300)
        return obj
    }
    export function adminInfo(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(ADMIN_INFO_KEY,userId),cacheRedisType<ICommon_Model_User>().Object,300)
        return obj
    }
    export function organizationInfo(platform:ECommon_Platform_Type,userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_ORGANIZATION_KEY,platform,userId),cacheRedisType<IServer_Common_RPC_User_CheckSession_Organization>().Object,300)
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
    export function wechatOpenId(openId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(WECHAT_OPEN_ID_KEY,openId),cacheRedisType<{
            img:string
        }>().Object,600)
        return obj
    }
    export function userPlatformList(userId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_PLATFORM_LIST,userId),cacheRedisType<ECommon_Platform_Type[]>().Array,600)
        return obj
    }
}