import {getSocketEmitterInstance, getSocketIOInstance, SocketIO} from "../../common/socket/socket";
import {ECommon_Socket_Type, ICommon_Socket_IM_Search_Message} from "../../../common/socket/types";
import rpcUserApi from "../../user/rpc/user"
import {
    IMFavoriteMessageService,
    IMTeamMessageService,
    IMUnReadMessageService,
    IMUserMessageService
} from "../service/im";
import {ECommon_IM_Message_ContentType} from "../../../common/model/im_user_message";
import {REDIS_AUTH} from "../../common/cache/keys/auth";
import {Err} from "../../../common/status/error";
import {emitServiceEvent} from "../../common/event/event";
import {ECommon_User_Online_Status} from "../../../common/types";
import {REDIS_ORGANIZATION} from "../../common/cache/keys/organization";
import {ECommon_Content_Line_Config_Type, ICommon_Content_Line} from "../../../common/model/content";
import {ECommon_IM_Message_At, ECommon_IM_Message_EntityType} from "../../../common/model/im_unread_message";
import {REDIS_USER} from "../../common/cache/keys/user";

export async function handleImConnection() {
    let io=getSocketIOInstance().of("/"+ECommon_Socket_Type.IM)
    let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.IM);
    SocketIO.initSocket(io,async socket => {
        socket.on("disconnect",async (reason, description) => {
            emitServiceEvent("organizationUserStatusChange",socket.data.organizationId,socket.data.organizationUserId,ECommon_User_Online_Status.OFFLINE)
            let objPreStatus=REDIS_ORGANIZATION.preStatus(socket.data.organizationUserId)
            let objStatus=REDIS_ORGANIZATION.status(socket.data.organizationUserId)
            let valueStatus=await objStatus.get()
            if(valueStatus===ECommon_User_Online_Status.MEETING) {
                valueStatus=ECommon_User_Online_Status.ONLINE
            }
            objStatus.set(ECommon_User_Online_Status.OFFLINE)
            objPreStatus.set(valueStatus)
        })
        socket.on("error",async err => {
            emitServiceEvent("organizationUserStatusChange",socket.data.organizationId,socket.data.organizationUserId,ECommon_User_Online_Status.OFFLINE)
            let objPreStatus=REDIS_ORGANIZATION.preStatus(socket.data.organizationUserId)
            let objStatus=REDIS_ORGANIZATION.status(socket.data.organizationUserId)
            let valueStatus=await objStatus.get()
            if(valueStatus===ECommon_User_Online_Status.MEETING) {
                valueStatus=ECommon_User_Online_Status.ONLINE
            }
            objStatus.set(ECommon_User_Online_Status.OFFLINE)
            objPreStatus.set(valueStatus)
        })
        socket.on("im_unread_message_list",async (callback) => {
            try {
                let ret=await IMUnReadMessageService.list(socket.data.organizationUserId)
                callback(ret)
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_team_send_message",async (teamId, content,type, callback) => {
            try {
                let objTeamUsers=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
                let roleId=await objTeamUsers.getValue(socket.data.organizationUserId);
                if(!roleId) {
                    let objRedis=REDIS_USER.info(socket.data.userId)
                    let obj=await objRedis.get()
                    callback({
                        success:false,
                        msg:Err.Team.teamMemberNotExists[obj.lang]
                    })
                    return
                }
                let obj=new IMTeamMessageService()
                obj.assignItem({
                    team_id: teamId,
                    from_organization_user_id:socket.data.organizationUserId,
                    content:typeof content==="object"?JSON.stringify(content).replaceAll("\\","\\\\"):content,
                    content_type:type,
                    organization_id:socket.data.organizationId
                })
                let item=await obj.create()
                callback({
                    success:true
                })
                emit.to(teamId).emit("im_team_relay_message",socket.data.organizationUserId,teamId,content,type,item.created_time,obj.getItem().id)
                let objAt:{
                    all:boolean,
                    [param:string]:boolean
                }={
                    all:false
                }
                if(type===ECommon_IM_Message_ContentType.RICH_TEXT) {
                    for(let objLine of content) {
                        for(let objConfig of objLine.arr) {
                            if(objConfig.type===ECommon_Content_Line_Config_Type.FILE || objConfig.type===ECommon_Content_Line_Config_Type.IMAGE) {
                                emitServiceEvent("fileRef",objConfig.value)
                            } else if(objConfig.type===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
                                if(objConfig.value==="0") {
                                    objAt.all=true
                                } else {
                                    objAt[objConfig.value]=true
                                }
                            }
                        }
                    }
                }
                let arr:(typeof socket)[]=await io.adapter.fetchSockets({
                    rooms:new Set([teamId])
                })
                let ids=arr.map(item=>item.data.organizationUserId)
                await IMUnReadMessageService.addTeam(ids,teamId,objAt,socket.data.organizationId)
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_user_send_message", async ( toOrganizationUserId, content,type, callback) => {
            try {
                let obj=new IMUserMessageService()
                obj.assignItem({
                    from_organization_user_id: socket.data.organizationUserId,
                    content:typeof content==="object"?JSON.stringify(content).replaceAll("\\","\\\\"):content,
                    content_type:ECommon_IM_Message_ContentType.RICH_TEXT,
                    to_organization_user_id: toOrganizationUserId,
                    organization_id:socket.data.organizationId
                })
                let item=await obj.create()
                callback({
                    success:true
                })
                emit.to([socket.data.organizationUserId,toOrganizationUserId]).emit("im_user_relay_message",socket.data.organizationUserId,toOrganizationUserId,content,type,item.created_time,obj.getItem().id)
                if(type===ECommon_IM_Message_ContentType.RICH_TEXT) {
                    for(let objLine of content) {
                        for(let objConfig of objLine.arr) {
                            if(objConfig.type===ECommon_Content_Line_Config_Type.FILE || objConfig.type===ECommon_Content_Line_Config_Type.IMAGE) {
                                emitServiceEvent("fileRef",objConfig.value)
                            }
                        }
                    }
                }
                let arr:(typeof socket)[]=await io.adapter.fetchSockets({
                    rooms:new Set([toOrganizationUserId])
                })
                if(arr.length==0) {
                    await IMUnReadMessageService.addUser(socket.data.organizationUserId,toOrganizationUserId,socket.data.organizationId)
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
        socket.on("im_unread_message",async (entityId, entityType,objAt) => {
            try {
                let obj=await IMUnReadMessageService.getItemByExp({
                    unique_id:socket.data.organizationUserId+entityId
                })
                let at=ECommon_IM_Message_At.NONE
                if(objAt) {
                    if(objAt.all && objAt[socket.data.organizationUserId]) {
                        at=ECommon_IM_Message_At.ALL | ECommon_IM_Message_At.SPECIFIC
                    } else if(objAt.all) {
                        at=ECommon_IM_Message_At.ALL
                    } else if(objAt[socket.data.organizationUserId]) {
                        at=ECommon_IM_Message_At.SPECIFIC
                    }
                }
                if(obj) {
                    if(objAt && obj.getItem().at!==null) {
                        at=at | obj.getItem().at
                    }
                    obj.assignItem({
                        count:obj.getItem().count+1,
                        ...(objAt && {
                            at
                        })
                    })
                    await obj.update()
                } else {
                    obj=new IMUnReadMessageService()
                    obj.assignItem({
                        entity_id:entityId,
                        entity_type:entityType,
                        organization_user_id:socket.data.organizationUserId,
                        unique_id:socket.data.organizationUserId+entityId,
                        ...(objAt && {
                            at
                        }),
                        organization_id:socket.data.organizationId
                    },true)
                    await obj.create()
                }
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_favorite_message_list",async (organizationUserId, size, lastTime, callback) => {
            try {
                let ret=await IMFavoriteMessageService.list(organizationUserId,size,lastTime)
                callback(ret)
            } catch (err) {
                console.log(err)
            }

        })
        socket.on("im_favorite_message_add",async (organizationUserId, type, entityId) => {
            try {
                let conteType:ECommon_IM_Message_ContentType,content:string,name:string
                let obj=await IMFavoriteMessageService.getItemByExp({
                    organization_user_id:organizationUserId,
                    ref_id:entityId
                })
                if(obj) {
                    throw Err.IM.messageAlreadyFavorite
                }
                if(type===ECommon_IM_Message_EntityType.TEAM) {
                    let obj=await IMTeamMessageService.getItemById(entityId)
                    if(!obj) {
                        throw Err.IM.messageNotFound
                    }
                    content=obj.getItem().content
                    conteType=obj.getItem().content_type
                    let objTeam=await rpcUserApi.team(obj.getItem().team_id)
                    if(objTeam) {
                        name=objTeam.name
                    }
                } else if(type===ECommon_IM_Message_EntityType.USER) {
                    let obj=await IMUserMessageService.getItemById(entityId)
                    if(!obj) {
                        throw Err.IM.messageNotFound
                    }
                    content=obj.getItem().content
                    conteType=obj.getItem().content_type
                    let objOrganizationUser=await rpcUserApi.organizationUser(obj.getItem().from_organization_user_id)
                    if(objOrganizationUser) {
                        name=objOrganizationUser.nickname
                    }
                }
                if(content!=null && conteType!=null && name!=null) {
                    let obj=new IMFavoriteMessageService()
                    obj.assignItem({
                        organization_user_id:organizationUserId,
                        content,
                        content_type:conteType,
                        from_name:name,
                        organization_id:socket.data.organizationId,
                        ref_id:entityId
                    })
                    await obj.create()
                    if(conteType===ECommon_IM_Message_ContentType.RICH_TEXT) {
                        for(let objLine of JSON.parse(content) as ICommon_Content_Line[]) {
                            for(let objConfig of objLine.arr) {
                                if(objConfig.type===ECommon_Content_Line_Config_Type.FILE || objConfig.type===ECommon_Content_Line_Config_Type.IMAGE) {
                                    emitServiceEvent("fileRef",objConfig.value)
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_favorite_message_delete", async favoriteMessageId => {
            try {
                let obj=await IMFavoriteMessageService.getItemById(favoriteMessageId)
                if(obj) {
                    await obj.delete()
                    if(obj.getItem().content_type===ECommon_IM_Message_ContentType.RICH_TEXT) {
                        for(let objLine of JSON.parse(obj.getItem().content) as ICommon_Content_Line[]) {
                            for(let objConfig of objLine.arr) {
                                if(objConfig.type===ECommon_Content_Line_Config_Type.FILE || objConfig.type===ECommon_Content_Line_Config_Type.IMAGE) {
                                    emitServiceEvent("fileUnref",objConfig.value)
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_search_message",async (keyword, callback) => {
            try {
                let team=await rpcUserApi.getTeamList(socket.data.organizationUserId);
                let arr=await Promise.all([
                    IMUserMessageService.search(socket.data.organizationUserId,keyword),
                    IMTeamMessageService.search([...team.join.map(item=>{
                        return item.id
                    }),...team.manage.map(item=>{
                        return item.id
                    })],keyword)
                ])
                let ret:ICommon_Socket_IM_Search_Message={
                    teams:{},
                    users:{}
                }
                let userList=arr[0]
                for(let obj of userList) {
                    let fromOrganizationId=obj.from_organization_user_id
                    if(!ret.users[fromOrganizationId]) {
                        ret.users[fromOrganizationId]=[]
                    }
                    ret.users[fromOrganizationId].push({
                        messageId:obj.id,
                        fromOrganizationUserId:obj.from_organization_user_id,
                        toOrganizationUserId:obj.to_organization_user_id,
                        type:obj.content_type,
                        content:obj.content,
                        date:obj.created_time.getTime()
                    })
                }
                let teamList=arr[1]
                for(let obj of teamList) {
                    let teamId=obj.team_id
                    if(!ret.teams[teamId]) {
                        ret.teams[teamId]=[]
                    }
                    ret.teams[teamId].push({
                        messageId:obj.id,
                        fromOrganizationUserId:obj.from_organization_user_id,
                        type:obj.content_type,
                        content:obj.content,
                        date:obj.created_time.getTime(),
                        teamId:obj.team_id
                    })
                }
                callback(ret)
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_user_message_locate",async (toOrganizationUserId,messageId, callback) => {
            try {
                let ret=await IMUserMessageService.locate([socket.data.organizationUserId,toOrganizationUserId],messageId)
                callback(ret)
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("im_team_message_locate",async (teamId,messageId, callback) => {
            try {
                let ret=await IMTeamMessageService.locate(teamId,messageId)
                callback(ret)
            } catch (err) {
                console.log(err)
            }
        })
        let teamList =await rpcUserApi.getTeamList(socket.data.organizationUserId)
        let teamIdList=[...teamList.join,...teamList.manage].map(item=>item.id)
        teamIdList.forEach(id=>{
            socket.join(id)
        })
        let objPreStatus=REDIS_ORGANIZATION.preStatus(socket.data.organizationUserId)
        let objStatus=REDIS_ORGANIZATION.status(socket.data.organizationUserId)
        let valueStatus=await objStatus.get()
        let valuePreStatus=await objPreStatus.get()
        if(valueStatus===ECommon_User_Online_Status.OFFLINE && valuePreStatus!==ECommon_User_Online_Status.OFFLINE && valuePreStatus!==null) {
            emitServiceEvent("organizationUserStatusChange",socket.data.organizationId,socket.data.organizationUserId,valuePreStatus)
            objPreStatus.set(ECommon_User_Online_Status.OFFLINE)
            objStatus.set(valuePreStatus)
        } else {
            emitServiceEvent("organizationUserStatusChange",socket.data.organizationId,socket.data.organizationUserId,ECommon_User_Online_Status.ONLINE)
            objPreStatus.set(ECommon_User_Online_Status.OFFLINE)
            objStatus.set(ECommon_User_Online_Status.ONLINE)
        }
    })
}