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

const {t}=i18n.global
export const iconMeeting=new Icon(t("util.meeting"),iconGroupMap["meeting"])
iconMeeting.addEventListener("dbClick",item => {
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
})