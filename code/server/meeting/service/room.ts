import {Entity} from "../../common/entity/entity";
import {
    ECommon_Meeting_Room_Permission,
    ECommon_Model_Meeting_Room_Type,
    meetingRoomModel
} from "../../../common/model/meeting_room";
import {meetingRoomMapper} from "../mapper/room";
import {IServer_Common_Event_Types} from "../../common/event/types";
import {REDIS_MEETING} from "../../common/cache/keys/meeting";
import {Err} from "../../../common/status/error";
import rpcUserApi from "../../user/rpc/user";
import rpcCalendarApi from "../../calendar/rpc/calendar"
import * as moment from "moment";

export class MeetingRoomService extends Entity<typeof meetingRoomModel,typeof meetingRoomMapper> {
    constructor() {
        super(meetingRoomMapper)
    }

    static async list(organizationUserId:string,page:number,size:number,keyword?:string) {
        let ret=await meetingRoomMapper.list(organizationUserId,page,size,keyword)
        let start=moment().subtract(6,"hour").toDate().getTime()
        let end=moment().add(1,"day").endOf("day").toDate().getTime()
        let eventList=await rpcCalendarApi.searchEvent(organizationUserId,null,start,end,null,null)
        if(eventList.length>0) {
            let eventIdList=eventList.map(item=>item.id)
            let roomList=await meetingRoomMapper.roomsByRelatedIds(eventIdList)
            let arr:typeof ret.data=[]
            for(let room of roomList) {
                let i=-1;
                while((i=eventIdList.indexOf(room.related_id,i+1))!=-1) {
                    let event=eventList[i]
                    arr.push({
                        ...room,
                        start_time:event.start_time,
                        end_time:event.end_time
                    })
                }
            }
            ret.data=ret.data.concat(arr)
            ret.data.sort((a, b) => {
                return a.start_time.getTime()-b.start_time.getTime()
            })
        }
        return ret;
    }

    static async clear(organizationUserId:string) {
        await meetingRoomMapper.clear(organizationUserId)
    }

    static async clearByRelatedId(relatedId:string) {
        await meetingRoomMapper.clearByRelatedId(relatedId)
    }


    static async clearByOrganizationId(organizationId:string) {
        await meetingRoomMapper.clearByOrganizationId(organizationId)
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        if(this.getItem().type===ECommon_Model_Meeting_Room_Type.SCHEDULE) {
            let objRedis=REDIS_MEETING.roomInfo(this.getId())
            let exists=await objRedis.exists()
            if(exists) {
                throw Err.Meeting.roomStillActive
            }
        }
        await super.delete(eventPublish);
    }

    async addMember(organizationUserId:string) {
        await rpcUserApi.startMeetingStatus(organizationUserId,this.getId())
        let objRedis=REDIS_MEETING.roomInfo(this.getId())
        await objRedis.set({
            [organizationUserId]:this.getItem().created_by===organizationUserId?ECommon_Meeting_Room_Permission.PRESENTER:ECommon_Meeting_Room_Permission.NORMAL
        })
    }

    async removeMember(organizationUserId:string) {
        await rpcUserApi.endMeetingStatus(organizationUserId)
        let objRedis=REDIS_MEETING.roomInfo(this.getId())
        await objRedis.delField(organizationUserId)
        let objAll=await objRedis.getAll()
        if(objAll && Object.keys(objAll).length>0) {
            await objRedis.set({
                [Object.keys(objAll)[0]]:ECommon_Meeting_Room_Permission.PRESENTER
            })
        }
    }

    async checkMember(organizationUserId:string) {
        let objRedis=REDIS_MEETING.roomInfo(this.getId())
        let objAll=await objRedis.getAll()
        if(objAll && Object.keys(objAll).includes(organizationUserId)) {
            return true
        } else {
            return false
        }
    }

    async changePermission(organizationUserId:string,permission:ECommon_Meeting_Room_Permission) {
        let objRedis=REDIS_MEETING.roomInfo(this.getId())
        await objRedis.set({
            [organizationUserId]:permission
        })
    }

    async getPermissionList():Promise<{
        [id:string]:ECommon_Meeting_Room_Permission
    }> {
        let objRedis=REDIS_MEETING.roomInfo(this.getId())
        let obj=await objRedis.getAll()
        return obj as any;
    }

    async getPermission(organizationUserId:string) {
        let objRedis=REDIS_MEETING.roomInfo(this.getId())
        let ret=await objRedis.get(organizationUserId)
        return ret;
    }

}