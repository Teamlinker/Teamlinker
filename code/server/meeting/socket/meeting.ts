import {getSocketEmitterInstance, getSocketIOInstance, SocketIO} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";
import {MeetingServer} from "../../common/meeting/server";
import {MeetingRoomService} from "../service/room";
import {ECommon_Meeting_Room_Permission} from "../../../common/model/meeting_room";
import rpcUserApi from "../../user/rpc/user";
import meetingConfig from "../meeting.config"
import Application from "../../common/app/app";
import rpcContentApi from "../../content/rpc/content"
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {handleImageFields} from "../../gateway/util/util";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {MeetingMissCallService} from "../service/missCall";
import {REDIS_ORGANIZATION} from "../../common/cache/keys/organization";


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
            try {
                let [name,meetingId]=await Promise.all([
                    rpcUserApi.getOrganizationUserName(socket.data.organizationUserId),
                    await rpcUserApi.getMeetingId(socket.data.organizationUserId)
                ])
                let set=new Set<string>()
                await Promise.allSettled(inviteBusinessIds.map(async item=>{
                    if(item.type===ECommon_Model_Organization_Member_Type.USER) {
                        set.add(item.id)
                    } else if(item.type===ECommon_Model_Organization_Member_Type.TEAM) {
                        return rpcUserApi.getTeamAllMember(item.id).then(value => {
                            for(let obj of value.data) {
                                set.add(obj.organizationUser.id)
                            }
                        })
                    }
                }))
                let objRoom=await MeetingRoomService.getItemById(meetingId)
                if(objRoom) {
                    let arrOffline=[]
                    let arrOnline=[]
                    for(let id of set) {
                        if(io.adapter.rooms.get(id)) {
                            arrOnline.push(id)
                        } else {
                            arrOffline.push(id)
                        }
                    }
                    if(arrOnline.length>0) {
                        emit.in(arrOnline).emit("meeting_invite",socket.data.organizationUserId,name,meetingId,objRoom.getItem().password)
                    }
                    arrOffline.forEach(id=>{
                        let obj=new MeetingMissCallService()
                        obj.assignItem({
                            to_organization_user_id:id,
                            from_organization_user_id:socket.data.organizationUserId,
                        })
                        obj.create()
                    })
                }
            } catch (err) {
                console.error(err)
            }

        })
        socket.on("meeting_message_list",async (lastMessageId,callback) => {
            try {
                let meetingId=await rpcUserApi.getMeetingId(socket.data.organizationUserId)
                if(meetingId) {
                    let ret=await rpcContentApi.list(meetingId,ECommon_Model_Content_Type.MEETING_CHAT, true,lastMessageId)
                    await handleImageFields(ret, socket.data.organizationUserId)
                    callback(ret as any)
                }
            } catch (err) {
                console.error(err)
                callback(null)
            }
        })
        socket.on("meeting_reject",async (fromOrganizationUserId, roomId) => {
            try {
                let objRoom=await MeetingRoomService.getItemById(roomId)
                if(objRoom) {
                    let exist=await objRoom.checkMember(socket.data.organizationUserId)
                    if(exist) {
                        return
                    }
                }
                let name=await rpcUserApi.getOrganizationUserName(socket.data.organizationUserId)
                emit.in(fromOrganizationUserId).emit("meeting_rejected",socket.data.organizationUserId,name,roomId)
            } catch (err) {
                console.error(err)
            }
        })
    })
    let objMeeting=new MeetingServer(io,meetingConfig as any)
    objMeeting.onJoinRoom=async (roomId,extraData, socketData, socketId) => {
        try {
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
            } else if(objRoom.getItem().organization_id!==socketData.organizationId) {
                return {
                    businessId:null,
                    roomName:null,
                    error:"access forbidden"
                }
            } else {
                return {
                    businessId:socketData.organizationUserId,
                    roomName:objRoom.getItem().name
                }
            }
        } catch (err) {
            console.error(err)
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
    objMeeting.onDeleteRoom=async roomId => {
        try {
            await rpcContentApi.clearByRefId(roomId)
        } catch (err) {
            console.error(err)
        }

    }
    objMeeting.onMessageSend=async (roomId, fromBusinessId, message) => {
        try {
            await rpcContentApi.add(roomId,ECommon_Model_Content_Type.MEETING_CHAT, fromBusinessId,message as string)
        } catch (err) {
            console.error(err)
        }

    }
    await objMeeting.start()
}