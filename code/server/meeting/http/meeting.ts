import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import meetingApi from "../../../common/routes/meeting";
import {IUserSession} from "../../user/types/config";
import {ECommon_Model_Meeting_Room_Type} from "../../../common/model/meeting_room";
import {MeetingRoomService} from "../service/room";
import {Err} from "../../../common/status/error";
import rpcUserApi from "../../user/rpc/user";
import {MeetingMissCallService} from "../service/missCall";
import moment = require("moment");

@DComponent
@DHttpController(meetingApi)
class MeetingController {
    @DHttpApi(meetingApi.routes.listRoom)
    async listRoom(@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("keyword") keyword:string,@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.listRoom.res> {
        let ret=await MeetingRoomService.list(user.organizationInfo.organizationUserId,page,size,keyword)
        return ret;
    }

    @DHttpApi(meetingApi.routes.createRoom)
    async createRoom(@DHttpReqParamRequired("name") name:string,
        @DHttpReqParam("description") description:string,
        @DHttpReqParamRequired("related_id") related_id:string,
        @DHttpReqParamRequired("startTime") startTime:number,
        @DHttpReqParamRequired("endTime") endTime:number,
        @DHttpReqParamRequired("password") password:string, @DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.createRoom.res> {
        if(startTime>endTime) {
            throw Err.Meeting.endTimeLarger
        } else if(startTime<moment().subtract(1,"hour").toDate().getTime()) {
            throw Err.Meeting.startTimeLess
        }
        let obj=new MeetingRoomService()
        obj.assignItem({
            name,
            description,
            type:ECommon_Model_Meeting_Room_Type.SCHEDULE,
            related_id,
            start_time:new Date(startTime),
            end_time:new Date(endTime),
            password,
            created_by:user.organizationInfo.organizationUserId,
            organization_id:user.organizationInfo.organizationId
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(meetingApi.routes.editRoom)
    async editRoom(@DHttpReqParamRequired("meetingRoomId") meetingRoomId:string,
                   @DHttpReqParam("name") name:string,
                   @DHttpReqParam("description") description:string,
                   @DHttpReqParam("startTime") startTime:number,
                   @DHttpReqParam("endTime") endTime:number,
                   @DHttpReqParam("password") password:string, @DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.editRoom.res> {
        let obj=await MeetingRoomService.getItemById(meetingRoomId)
        if(!obj) {
            throw Err.Meeting.roomNotFound
        }
        if(obj.getItem().type===ECommon_Model_Meeting_Room_Type.SCHEDULE) {
            let start=startTime || obj.getItem().start_time
            let end=endTime || obj.getItem().end_time
            if(start>end) {
                throw Err.Meeting.endTimeLarger
            } else if(start<moment().subtract(1,"hour").toDate().getTime()) {
                throw Err.Meeting.startTimeLess
            }
        }
        obj.assignItem({
            name,description,
            ...(startTime && {
                start_time:new Date(startTime)
            }),
            ...(endTime && {
                end_time:new Date(endTime)
            }),
            password
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(meetingApi.routes.deleteRoom)
    async deleteRoom(@DHttpReqParamRequired("meetingRoomId") meetingRoomId:string,@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.deleteRoom.res> {
        let obj=await MeetingRoomService.getItemById(meetingRoomId)
        if(!obj) {
            throw Err.Meeting.roomNotFound
        }
        if(obj.getItem().type===ECommon_Model_Meeting_Room_Type.PRIVATE) {
            throw Err.Meeting.privateRoomDeleteForbidden
        }
        await obj.delete()
        return
    }

    @DHttpApi(meetingApi.routes.getPersonalRoom)
    async getPersonalRoom(@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.getPersonalRoom.res> {
        let obj=await MeetingRoomService.getItemByExp({
            created_by:user.organizationInfo.organizationUserId,
            type:ECommon_Model_Meeting_Room_Type.PRIVATE,
            related_id:user.organizationInfo.organizationUserId
        })
        if(!obj) {
            throw Err.Meeting.roomNotFound
        }
        return obj.getItem();
    }

    @DHttpApi(meetingApi.routes.validateRoom)
    async validateRoom(@DHttpReqParamRequired("meetingRoomId") meetingRoomId:string,@DHttpReqParamRequired("password") password:string,@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.validateRoom.res> {
        let obj=await MeetingRoomService.getItemById(meetingRoomId)
        if(!obj) {
            throw Err.Meeting.roomNotFound
        } else if(obj.getItem().password!==password) {
            throw Err.Meeting.passwordWrong
        }
        return {
            meetingRoomId,
            password
        }
    }

    @DHttpApi(meetingApi.routes.getCurrentRoom)
    async getCurrentRoom(@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.getCurrentRoom.res> {
        let meetingId=await rpcUserApi.getMeetingId(user.organizationInfo.organizationUserId)
        if(meetingId) {
            let obj=await MeetingRoomService.getItemById(meetingId)
            if(obj) {
                return obj.getItem()
            } else {
                throw Err.Meeting.roomNotFound
            }
        } else {
            throw Err.Meeting.notInMeeting
        }
    }

    @DHttpApi(meetingApi.routes.getRoom)
    async getRoom(@DHttpReqParamRequired("meetingRoomId") meetingRoomId:string,@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.getRoom.res> {
        let obj=await MeetingRoomService.getItemById(meetingRoomId)
        if(!obj) {
            throw Err.Meeting.roomNotFound
        }
        let ret=obj.getItem()
        if(user.organizationInfo?.fake) {
            delete ret.password
        }
        return ret
    }

    @DHttpApi(meetingApi.routes.listMissCall)
    async listMissCall(@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.listMissCall.res> {
        let ret=await MeetingMissCallService.list(user.organizationInfo.organizationUserId)
        return ret
    }

    @DHttpApi(meetingApi.routes.missCallRead)
    async missCallRead(@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.missCallRead.res> {
        await MeetingMissCallService.readAll(user.organizationInfo.organizationUserId)
        return
    }

    @DHttpApi(meetingApi.routes.missCallCount)
    async missCallCount(@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.missCallCount.res> {
        let ret=await MeetingMissCallService.unReadCount(user.organizationInfo.organizationUserId)
        return {
            count:ret
        }
    }

    @DHttpApi(meetingApi.routes.missCallAdd)
    async missCallAdd(@DHttpReqParamRequired("fromOrganizationUserId") fromOrganizationUserId:string,@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.missCallAdd.res> {
        let obj=new MeetingMissCallService()
        obj.assignItem({
            from_organization_user_id:fromOrganizationUserId,
            to_organization_user_id:user.organizationInfo.organizationUserId
        })
        await obj.create()
        return
    }

    @DHttpApi(meetingApi.routes.checkOwner)
    async checkOwner(@DHttpReqParamRequired("meetingRoomId") meetingRoomId:string,@DHttpUser user:IUserSession): Promise<typeof meetingApi.routes.checkOwner.res> {
        let obj=await MeetingRoomService.getItemById(meetingRoomId)
        if(!obj) {
            throw Err.Meeting.roomNotFound
        }
        if(obj.getItem().created_by===user.organizationInfo.organizationUserId) {
            return {
                owner:true,
                password:obj.getItem().password
            }
        }
        return {
            owner:false
        }
    }
}