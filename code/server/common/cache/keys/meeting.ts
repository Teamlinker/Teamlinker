import {ECommon_Services} from "../../../../common/types";
import {RedisHashKey} from "./base";
import StringUtil from "../../../../common/util/string";

export namespace REDIS_MEETING {
    let ROOM_INFO_KEY=`${ECommon_Services.Meeting}:room:{0}:info`

    export function roomInfo(meetingRoomId:string)
    {
        let obj=new RedisHashKey(StringUtil.format(ROOM_INFO_KEY,meetingRoomId),-1)
        return obj
    }
}