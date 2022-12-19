import {Icon} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import Setting from "../../app/setting/setting.vue";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";

export const iconProject=new Icon("project","project")
iconProject.addEventListener("dbClick",item => {
    if(!sessionStorage.getItem("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("project",ETeamOS_Window_Type.TAB, "project",true,[
        {
            id:v4(),
            meta:{
                title:"project"
            },
            components:{
                setting:markRaw(Setting)
            },
            default:{
                name:"setting"
            }
        }
    ],"project");
    windowManager.open(win);
})