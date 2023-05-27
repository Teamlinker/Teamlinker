import {NotificationType, NotificationWrapper} from "../../../common/component/notification/notification";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {ECommon_IM_Message_ContentType} from "../../../../../../common/model/im_user_message";
import {SocketIOClient} from "../../../common/socket/socket";
import {SessionStorage} from "../../../common/storage/session";
import {ECommon_User_Online_Status} from "../../../../../../common/types";

export function handleIMEvent(socket:SocketIOClient["socket"],statue:ECommon_User_Online_Status) {
    let myOrganizationUserId=SessionStorage.get("organizationUserId")
    socket.on("im_user_relay_text_message",(fromOrganizationUserId, toOrganizationUserId, content,date) => {
        if(myOrganizationUserId!==fromOrganizationUserId && statue===ECommon_User_Online_Status.ONLINE) {
            NotificationWrapper.show("IM User Message",content.substring(0,20),NotificationType.IM,(type, data) => {
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,fromOrganizationUserId,ECommon_IM_Message_EntityType.USER)
            },null,3000)
        }
        eventBus.emit(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE,ECommon_IM_Message_EntityType.USER,fromOrganizationUserId,content,ECommon_IM_Message_ContentType.TEXT,date,toOrganizationUserId)
    })
    socket.on("im_team_relay_text_message",(organizationUserId, teamId, content,date) => {
        if(myOrganizationUserId!==organizationUserId && statue===ECommon_User_Online_Status.ONLINE) {
            NotificationWrapper.show("IM Team Message",content.substring(0,20),NotificationType.IM,(type, data) => {
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,teamId,ECommon_IM_Message_EntityType.TEAM)
            },null,3000)
        }
        eventBus.emit(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE,ECommon_IM_Message_EntityType.TEAM,organizationUserId,content,ECommon_IM_Message_ContentType.TEXT,date,null,teamId)
    })
    socket.on("im_user_relay_image_message",(fromOrganizationUserId, toOrganizationUserId, fileId,date) => {
        if(myOrganizationUserId!==fromOrganizationUserId && statue===ECommon_User_Online_Status.ONLINE) {
            NotificationWrapper.show("IM User Message","Image",NotificationType.IM,(type, data) => {
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,fromOrganizationUserId,ECommon_IM_Message_EntityType.USER)
            },null,3000)
        }
        eventBus.emit(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE,ECommon_IM_Message_EntityType.USER,fromOrganizationUserId,fileId,ECommon_IM_Message_ContentType.IMAGE,date,toOrganizationUserId)
    })
    socket.on("im_team_relay_image_message",(organizationUserId, teamId, fileId,date) => {
        if(myOrganizationUserId!==organizationUserId && statue===ECommon_User_Online_Status.ONLINE) {
            NotificationWrapper.show("IM Team Message","Image",NotificationType.IM,(type, data) => {
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,teamId,ECommon_IM_Message_EntityType.TEAM)
            },null,3000)
        }
        eventBus.emit(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE,ECommon_IM_Message_EntityType.TEAM,organizationUserId,fileId,ECommon_IM_Message_ContentType.IMAGE,date,null,teamId)
    })
    socket.on("im_organization_user_status_change",(organizationUserId, status) => {
        eventBus.emit(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS,organizationUserId,status)
    })
}