import {SocketIOClient} from "../../../common/socket/socket";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {apiMeeting} from "../../../common/request/request";
import {NotificationType, NotificationWrapper} from "../../../common/component/notification/notification";

export function handleMeetingEvent(socket:SocketIOClient["socket"]) {
    socket.on("meeting_invite",async (fromOrganizationUserId, fromOrganizationUserName, roomId, password) => {
        let res=await apiMeeting.getCurrentRoom()
        if(res?.code!==0 || (res?.code==0 && res.data.id!=roomId)) {
            NotificationWrapper.show("Meeting Invite",`${fromOrganizationUserName} is inviting you`,NotificationType.MEETING,(type, data) => {
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,roomId,password)
            },null,30000)
        }
    })
}