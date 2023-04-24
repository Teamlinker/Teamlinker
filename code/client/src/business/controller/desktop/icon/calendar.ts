import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Calendar from "../../app/calendar/calendar.vue";
import {SessionStorage} from "../../../common/storage/session";

export const iconCalendar=new Icon("calendar",iconGroupMap["calendar"])
iconCalendar.addEventListener("dbClick",item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("calendar",ETeamOS_Window_Type.SIMPLE, "calendar",false,[
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
    ],"calendar");
    windowManager.open(win);
})