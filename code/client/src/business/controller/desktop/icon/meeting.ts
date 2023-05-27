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

export const iconMeeting=new Icon("meeting",iconGroupMap["meeting"])
iconMeeting.addEventListener("dbClick",item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("meeting",ETeamOS_Window_Type.SIMPLE, "meeting",false,[
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
    ],"meeting");
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_MEETING,(meetingId, password) => {
    const win=new Window("meeting",ETeamOS_Window_Type.SIMPLE, "meeting",false,[
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
                        password
                    }
                }
            }
        }
    ],"meeting");
    windowManager.open(win);
})