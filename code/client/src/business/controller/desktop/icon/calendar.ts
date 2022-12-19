import {Icon} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import Setting from "../../app/setting/setting.vue";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";

export const iconCalendar=new Icon("calendar","calendar")
iconCalendar.addEventListener("dbClick",item => {
    if(!sessionStorage.getItem("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("setting",ETeamOS_Window_Type.SIMPLE, "calendar",true,[
        {
            id:v4(),
            meta:{
                title:"calendar"
            },
            components:{
                setting:markRaw(Setting)
            },
            default:{
                name:"setting"
            }
        }
    ],"calendar");
    windowManager.open(win);
})