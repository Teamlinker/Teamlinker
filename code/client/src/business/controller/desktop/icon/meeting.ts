import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import Setting from "../../app/setting/setting.vue";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import {SessionStorage} from "../../../common/storage/session";

export const iconMeeting=new Icon("meeting",iconGroupMap["meeting"])
iconMeeting.addEventListener("dbClick",item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("meeting",ETeamOS_Window_Type.SIMPLE, "meeting",true,[
        {
            id:v4(),
            meta:{
                title:"meeting"
            },
            components:{
                setting:markRaw(Setting)
            },
            default:{
                name:"setting"
            }
        }
    ],"meeting");
    windowManager.open(win);
})