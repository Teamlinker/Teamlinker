import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Calendar from "../../app/calendar/calendar.vue";
import {SessionStorage} from "../../../common/storage/session";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import i18n from "@/business/common/i18n/i18n";

const {t}=i18n.global
export const iconCalendar=new Icon(t("util.calendar"),iconGroupMap["calendar"],"calendar")
const func=item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error(t("tip.switchToSpecificOrganization"))
        return;
    }
    const win=new Window(t("util.calendar"),ETeamOS_Window_Type.SIMPLE, "calendar",false,[
        {
            id:v4(),
            meta:{
                title:"calendar"
            },
            components:{
                calendar:markRaw(Calendar)
            },
            default:{
                name:"calendar"
            }
        }
    ],t("util.calendar"));
    windowManager.open(win);
}
iconCalendar.addEventListener("dbClick",item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconCalendar.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,(calendarEventId) => {
    const win=new Window(t("util.calendar"),ETeamOS_Window_Type.SIMPLE, "calendar",false,[
        {
            id:v4(),
            meta:{
                title:"calendar"
            },
            components:{
                calendar:markRaw(Calendar)
            },
            default:{
                name:"calendar",
                props:{
                    calendarEventId:calendarEventId
                }
            }
        }
    ],t("util.calendar"));
    windowManager.open(win);
})