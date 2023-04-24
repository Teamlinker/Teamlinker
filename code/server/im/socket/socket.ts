import {getSocketEmitterInstance, getSocketIOInstance, SocketIO} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";
import rpcUserApi from "../../user/rpc/user"
import {IMTeamMessageService, IMUnReadMessageService, IMUserMessageService} from "../service/im";
import {ECommon_IM_Message_ContentType} from "../../../common/model/im_user_message";
import {REDIS_AUTH} from "../../common/cache/keys/auth";
import {Err} from "../../../common/status/error";

export function handleImConnection() {
    let io=getSocketIOInstance().of("/"+ECommon_Socket_Type.IM)
    let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.IM);
    SocketIO.initSocket(io,async socket => {
        socket.on("im_unread_messages",async ( callback) => {
            try {
                let ret=await IMUnReadMessageService.list(socket.data.organizationUserId)
                callback(ret)
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_team_send_text_message",async (teamId, content, callback) => {
            try {
                let objTeamUsers=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
                let roleId=await objTeamUsers.getValue(socket.data.organizationUserId);
                if(!roleId) {
                    callback({
                        success:false,
                        ...Err.Team.teamMemberNotExists
                    })
                    return
                }
                let obj=new IMTeamMessageService()
                obj.assignItem({
                    team_id: teamId,
                    from_organization_user_id:socket.data.organizationUserId,
                    content:content,
                    content_type:ECommon_IM_Message_ContentType.TEXT
                })
                let item=await obj.create()
                callback({
                    success:true
                })
                emit.to(teamId).emit("im_team_relay_text_message",socket.data.organizationUserId,teamId,content,item.created_time)
                let arr:(typeof socket)[]=await io.adapter.fetchSockets({
                    rooms:new Set([teamId])
                })
                let ids=arr.map(item=>item.data.organizationUserId)
                await IMUnReadMessageService.addTeam(ids,teamId)
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_user_send_text_message", async ( toOrganizationUserId, content, callback) => {
            try {
                let obj=new IMUserMessageService()
                obj.assignItem({
                    from_organization_user_id: socket.data.organizationUserId,
                    content,
                    content_type:ECommon_IM_Message_ContentType.TEXT,
                    to_organization_user_id: toOrganizationUserId
                })
                let item=await obj.create()
                callback({
                    success:true
                })
                emit.to([socket.data.organizationUserId,toOrganizationUserId]).emit("im_user_relay_text_message",socket.data.organizationUserId,toOrganizationUserId,content,item.created_time)
                let arr:(typeof socket)[]=await io.adapter.fetchSockets({
                    rooms:new Set([toOrganizationUserId])
                })
                if(arr.length==0) {
                    await IMUnReadMessageService.addUser(socket.data.organizationUserId,toOrganizationUserId)
                }
            } catch (err) {
                console.log(err)
            }

        })
        socket.on("im_user_message_list",async ( toOrganizationUserId, size, lastTime,callback) => {
            try {
                let ret=await IMUserMessageService.list([socket.data.organizationUserId,toOrganizationUserId],size,lastTime)
                callback(ret)
            } catch (err) {
                console.log(err)
            }

        })
        socket.on("im_team_message_list",async (teamId, size, lastTime, callback) => {
            try {
                let ret=await IMTeamMessageService.list(teamId,size,lastTime)
                callback(ret)
            } catch (err) {
                console.log(err)
            }

        })
        socket.on("im_read_message",async ( entityId) => {
            try {
                let obj=await IMUnReadMessageService.getItemByExp({
                    organization_user_id: socket.data.organizationUserId,
                    entity_id:entityId
                })
                if(obj) {
                    await obj.delete()
                }
            } catch (err) {
                console.log(err)
            }

        })
        let teamList =await rpcUserApi.getTeamList(socket.data.organizationUserId)
        let teamIdList=[...teamList.join,...teamList.manage].map(item=>item.id)
        teamIdList.forEach(id=>{
            socket.join(id)
        })
    })
}