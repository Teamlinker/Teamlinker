import {getSocketEmitterInstance, getSocketIOInstance, SocketIO} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";
import {MeetingServer} from "../../common/meeting/server";
import {MeetingRoomService} from "../service/room";
import {ECommon_Meeting_Room_Permission} from "../../../common/model/meeting_room";
import rpcUserApi from "../../user/rpc/user";
import meetingConfig from "../meeting.config"
import Application from "../../common/app/app";

export async function handleMeetingConnection() {
    if(!Application.debug) {
        meetingConfig.webRtcTransport.listenIps=Application.extraConfig.listenIps
        meetingConfig.worker.rtcMinPort=Application.extraConfig.rtcMinPort
        meetingConfig.worker.rtcMaxPort=Application.extraConfig.rtcMaxPort
    }
    let io=getSocketIOInstance().of("/"+ECommon_Socket_Type.MEETING)
    let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.MEETING);
    SocketIO.initSocket(io,async socket => {
        socket.on("meeting_get_presenters",async (callback) => {
            try {
                let meetingId=await rpcUserApi.getMeetingId(socket.data.organizationUserId)
                if(meetingId) {
                    let objRoom=await MeetingRoomService.getItemById(meetingId)
                    if(objRoom) {
                        let obj=await objRoom.getPermissionList()
                        callback(obj)
                    }
                }
            } catch (err) {
                console.error(err)
                callback(null)
            }
        })
        socket.on("meeting_change_presenter",async (businessId, permission, callback) => {
            try {
                let meetingId=await rpcUserApi.getMeetingId(socket.data.organizationUserId)
                if(meetingId) {
                    let objRoom=await MeetingRoomService.getItemById(meetingId)
                    if(objRoom) {
                        let myPermission=await objRoom.getPermission(socket.data.organizationUserId)
                        if(myPermission===ECommon_Meeting_Room_Permission.PRESENTER) {
                            await objRoom.changePermission(businessId,permission)
                            callback(true)
                            emit.in(meetingId).emit("meeting_presenter_change",businessId,permission)
                        } else {
                            callback(false)
                        }
                    } else {
                        callback(false)
                    }
                } else {
                    callback(false)
                }
            } catch (err) {
                console.error(err)
                callback(false)
            }
        })
        socket.on("meeting_invite",async (inviteBusinessIds) => {
            let [name,meetingId]=await Promise.all([
                rpcUserApi.getOrganizationUserName(socket.data.organizationUserId),
                await rpcUserApi.getMeetingId(socket.data.organizationUserId)
            ])
            let objRoom=await MeetingRoomService.getItemById(meetingId)
            if(objRoom) {
                emit.in(inviteBusinessIds).emit("meeting_invite",socket.data.organizationUserId,name,meetingId,objRoom.getItem().password)
            }
        })
    })
    let objMeeting=new MeetingServer(io,meetingConfig as any)
    objMeeting.onJoinRoom=async (roomId,extraData, socketData, socketId) => {
        let objRoom=await MeetingRoomService.getItemById(roomId)
        if(!objRoom) {
            return {
                businessId:null,
                roomName:null,
                error:"room not found"
            }
        } else if(objRoom.getItem().password!==extraData){
            return {
                businessId:null,
                roomName:null,
                error:"password wrong"
            }
        } else {
            return {
                businessId:socketData.organizationUserId,
                roomName:objRoom.getItem().name
            }
        }

    }
    objMeeting.onJoinedRoom=async (roomId, businessId, socketId) => {
        try {
            let objRoom=await MeetingRoomService.getItemById(roomId)
            if(objRoom) {
                await objRoom.addMember(businessId)
                emit.in(businessId).socketsJoin(roomId)
            }
        } catch(err) {
            console.error(err)
        }
    }
    objMeeting.onLeavedRoom=async (type, roomId, businessId) => {
        try {
            let objRoom=await MeetingRoomService.getItemById(roomId)
            if(objRoom) {
                await objRoom.removeMember(businessId)
                emit.in(businessId).socketsLeave(roomId)
            }
        } catch(err) {
            console.error(err)
        }
    }
    objMeeting.onHandleOperation=async (type, roomId, fromBusinessId, toBusinessId, kind) => {
        try {
            let objRoom=await MeetingRoomService.getItemById(roomId)
            if(objRoom) {
                let ret=await objRoom.getPermission(fromBusinessId)
                if(ret===ECommon_Meeting_Room_Permission.PRESENTER) {
                    return true;
                }
            } else {
                return false
            }
        } catch(err) {
            console.error(err)
            return false
        }
    }
    await objMeeting.start()
}