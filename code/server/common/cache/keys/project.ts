import {ECommon_Services} from "../../../../common/types";
import {RedisStringKey} from "./base";
import StringUtil from "../../../../common/util/string";
import {cacheRedisType} from "../../types/cache";
import {ICommon_Route_Res_Project_Statics} from "../../../../common/routes/response";

export namespace REDIS_PROJECT{
    let PROJECT_STATICS_KEY=`${ECommon_Services.Cooperation}:project:{0}:statics`

    export function statics(projectId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(PROJECT_STATICS_KEY,projectId),cacheRedisType<ICommon_Route_Res_Project_Statics>().Object,60)
        return obj
    }
}