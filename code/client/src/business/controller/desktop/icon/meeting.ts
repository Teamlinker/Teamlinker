import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import {SessionStorage} from "../../../common/storage/session";
import Meeting from "../../app/meeting/meeting.vue";
import MeetingProfile from "../../app/meeting/meetingProfile.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import i18n from "@/business/common/i18n/i18n";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";
import {ECommon_User_Online_Status} from "../../../../../../common/types";
import {Dialog} from "@/business/common/component/dialog/dialog";

const {t}=i18n.global
export const iconMeeting=new Icon(t("util.meeting"),iconGroupMap["meeting"],"meeting")
const closeFunc=async item1 => {
    const store=useDesktopStore()
    if(store.status===ECommon_User_Online_Status.MEETING) {
        let ret=await Dialog.confirm(document.body,store.appContext,t("tip.leaveMeeting"))
        if(ret) {
            return true
        } else {
            return false
        }
    }
    return true
}
const func=item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error(t("tip.switchToSpecificOrganization"))
        return;
    }
    const win=new Window(t("util.meeting"),ETeamOS_Window_Type.SIMPLE, "meeting",false,[
        {
            id:v4(),
            meta:{
                title:"meeting"
            },
            components:{
                meeting:markRaw(Meeting),
                meetingProfile:markRaw(MeetingProfile)
            },
            default:{
                name:"meeting"
            }
        }
    ],t("util.meeting"));
    windowManager.open(win);
    win.addEventListener("close",closeFunc)
}
iconMeeting.addEventListener("dbClick",item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconMeeting.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_MEETING,(meetingId, password,inviteBusinessIds) => {
    const win=new Window(t("util.meeting"),ETeamOS_Window_Type.SIMPLE, "meeting",false,[
        {
            id:v4(),
            meta:{
                title:"meeting"
            },
            components:{
                meeting:markRaw(Meeting),
                meetingProfile:markRaw(MeetingProfile)
            },
            default:{
                name:"meeting",
                props:{
                    meetingInitInfo:{
                        id:meetingId,
                        password,
                        inviteBusinessIds
                    }
                }
            }
        }
    ],t("util.meeting"));
    windowManager.open(win);
    win.addEventListener("close",closeFunc)
})