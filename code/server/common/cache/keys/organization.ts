import {RedisStringKey} from "./base";
import StringUtil from "../../../../common/util/string";
import {cacheRedisType} from "../../types/cache";
import {ICommon_Model_Team} from "../../../../common/model/team";
import {ICommon_Route_Res_Organization_Statics} from "../../../../common/routes/response";

export namespace REDIS_ORGANIZATION {
    let USER_STATUS_KEY=`organization:user:{0}:status`
    let USER_PRE_STATUS_KEY=`organization:user:{0}:pre_status`
    let USER_MEETING_KEY=`organization:user:{0}:meeting`
    let USER_TEAM_LIST_KEY=`organization:user:{0}:team_list`
    let STATICS="organization:{0}:statics"
    export function status(organizationUserId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_STATUS_KEY,organizationUserId),cacheRedisType<number>().Number,300)
        return obj
    }
    export function preStatus(organizationUserId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(USER_PRE_STATUS_KEY,organizationUserId),cacheRedisType<number>().Number,300)
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

    export function statics(organizationId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(STATICS,organizationId),cacheRedisType<ICommon_Route_Res_Organization_Statics>().Object,60)
        return obj
    }

}