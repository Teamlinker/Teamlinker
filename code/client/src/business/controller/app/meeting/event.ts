import {SocketIOClient} from "../../../common/socket/socket";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {apiMeeting} from "../../../common/request/request";
import {NotificationType, NotificationWrapper} from "../../../common/component/notification/notification";

export function handleMeetingEvent(socket:SocketIOClient["socket"]) {
    socket.on("meeting_invite",async (fromOrganizationUserId, fromOrganizationUserName, roomId, password) => {
        let res=await apiMeeting.getCurrentRoom()
        if(res?.code!==0 || (res?.code==0 && res.data.id!=roomId)) {
            let timeout=setTimeout(async ()=>{
                await apiMeeting.missCallAdd({
                    fromOrganizationUserId
                })
                eventBus.emit(EClient_EVENTBUS_TYPE.REFRESH_MISS_CALL_UNREAD)
            },30000)
            NotificationWrapper.confirm("Meeting Invite",`${fromOrganizationUserName} is inviting you`,NotificationType.MEETING,(type, data) => {
                clearTimeout(timeout)
                eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,roomId,password)
            },(type, data) => {
                clearTimeout(timeout)
                socket.emit("meeting_reject",fromOrganizationUserId,roomId)
            },null,30000)
        }
    })
    socket.on("meeting_rejected",(rejectOrganizationUserId, rejectOrganizationUsername, roomId) => {
        NotificationWrapper.show("Meeting Rejected",`${rejectOrganizationUsername} rejected your meeting invitation`,NotificationType.MEETING,null,null,10*1000,"warning")
    })
}