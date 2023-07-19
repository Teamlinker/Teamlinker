import {ECommon_Services} from "../../../../common/types";
import {RedisStringKey} from "./base";
import StringUtil from "../../../../common/util/string";
import {cacheRedisType} from "../../types/cache";
import {ICommon_Model_Team} from "../../../../common/model/team";

export namespace REDIS_ORGANIZATION {
    let USER_STATUS_KEY=`${ECommon_Services.Cooperation}:user:{0}:status`
    let USER_PRE_STATUS_KEY=`${ECommon_Services.Cooperation}:user:{0}:pre_status`
    let USER_MEETING_KEY=`${ECommon_Services.Cooperation}:user:{0}:meeting`
    let USER_TEAM_LIST_KEY=`${ECommon_Services.Cooperation}:user:{0}:team_list`
    export function status(organizationUserId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_STATUS_KEY,organizationUserId),cacheRedisType<number>().Number,-1)
        return obj
    }
    export function preStatus(organizationUserId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_PRE_STATUS_KEY,organizationUserId),cacheRedisType<number>().Number,-1)
        return obj
    }

    export function meetingId(organizationUserId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_MEETING_KEY,organizationUserId),cacheRedisType<string>().String,-1)
        return obj
    }
    export function teamList(organizationUserId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_TEAM_LIST_KEY,organizationUserId),cacheRedisType<{
            manage:ICommon_Model_Team[],
            join:ICommon_Model_Team[]
        }>().Object,-1)
        return obj
    }
}