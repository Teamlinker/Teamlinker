import {NotificationType, NotificationWrapper} from "../../../common/component/notification/notification";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {ECommon_IM_Message_ContentType} from "../../../../../../common/model/im_user_message";
import {SocketIOClient} from "../../../common/socket/socket";
import {SessionStorage} from "../../../common/storage/session";
import {ECommon_User_Online_Status} from "../../../../../../common/types";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {getIMAtInfo} from "../../../common/util/helper";

export function handleIMEvent(socket:SocketIOClient["socket"],statue:ECommon_User_Online_Status) {
    let myOrganizationUserId=SessionStorage.get("organizationUserId")
    socket.on("im_user_relay_message",(fromOrganizationUserId, toOrganizationUserId, content,type,date,messageId) => {
        if(myOrganizationUserId!==fromOrganizationUserId && statue===ECommon_User_Online_Status.ONLINE) {
            NotificationWrapper.show("IM User Message","a message from user",NotificationType.IM,(type, data) => {
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,fromOrganizationUserId,ECommon_IM_Message_EntityType.USER)
            },null,3000)
        }
        let windowList=windowManager.getWindowsByGroup("im")
        if(windowList.length==0) {
            socket.emit("im_unread_message",fromOrganizationUserId,ECommon_IM_Message_EntityType.USER)
        } else {
            eventBus.emit(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE,messageId,ECommon_IM_Message_EntityType.USER,fromOrganizationUserId,content,ECommon_IM_Message_ContentType.RICH_TEXT,date,toOrganizationUserId)
        }
    })
    socket.on("im_team_relay_message",(organizationUserId, teamId, content,type,date,messageId) => {
        if(myOrganizationUserId!==organizationUserId && statue===ECommon_User_Online_Status.ONLINE) {
            NotificationWrapper.show("IM Team Message","a message from team",NotificationType.IM,(type, data) => {
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,teamId,ECommon_IM_Message_EntityType.TEAM)
            },null,3000)
        }
        let windowList=windowManager.getWindowsByGroup("im")
        if(windowList.length==0) {
            let objAt=getIMAtInfo(content,type)
            socket.emit("im_unread_message",teamId,ECommon_IM_Message_EntityType.TEAM,objAt)
        } else {
            eventBus.emit(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE,messageId,ECommon_IM_Message_EntityType.TEAM,organizationUserId,content,ECommon_IM_Message_ContentType.RICH_TEXT,date,null,teamId)
        }
    })
    socket.on("im_organization_user_status_change",(organizationUserId, status) => {
        eventBus.emit(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS,organizationUserId,status)
    })
    socket.on("im_organization_quit", organizationId => {
        eventBus.emit(EClient_EVENTBUS_TYPE.ORGANIZATION_REMOVE,organizationId)
    })
}