import {ECommon_Model_Meeting_Room_Type} from "../../../common/model/meeting_room";
import {MeetingRoomService} from "../service/room";
import {Err} from "../../../common/status/error";

class RpcMeetingApi {
    async addMeetingRoom(name:string,
                         type:ECommon_Model_Meeting_Room_Type,
                         related_id:string,
                         password:string,
                         created_by:string,
                         description?:string,
                         startTime?:number,
                         endTime?:number,) {
        let obj=new MeetingRoomService()
        obj.assignItem({
            name,type,related_id,password,
            description,created_by,
            ...(startTime && {
                start_time:new Date(startTime)
            }),
            ...(endTime && {
                end_time:new Date(endTime)
            })
        })
        let ret=await obj.create()
        return ret;
    }

    async removePersonalMeetingRoom(organizationUserId:string) {
        let obj=await MeetingRoomService.getItemByExp({
            type:ECommon_Model_Meeting_Room_Type.PRIVATE,
            created_by:organizationUserId,
            related_id:organizationUserId
        })
        if(!obj) {
            throw Err.Meeting.roomNotFound
        }
        await obj.delete()
    }

    async clearMeetingRoom(organizationUserId:string) {
        await MeetingRoomService.clear(organizationUserId)
    }

    async meetingRoom(meetingRoomId:string) {
        let obj=await MeetingRoomService.getItemById(meetingRoomId)
        if(!obj) {
            throw Err.Meeting.roomNotFound
        }
        return obj.getItem()
    }
}

export default new RpcMeetingApi()