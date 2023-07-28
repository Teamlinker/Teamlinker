import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Im from "../../../controller/app/im/im.vue";
import {SessionStorage} from "../../../common/storage/session";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";

export const iconIM=new Icon("IM",iconGroupMap["im"])
iconIM.addEventListener("dbClick",item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("im",ETeamOS_Window_Type.SIMPLE, "im",false,[
        {
            id:v4(),
            meta:{
                title:"im"
            },
            components:{
                im:markRaw(Im)
            },
            default:{
                name:"im"
            }
        }
    ],"IM");
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,(id, chatType) => {
    const win=new Window("im",ETeamOS_Window_Type.SIMPLE, "im",false,[
        {
            id:v4(),
            meta:{
                title:"im"
            },
            components:{
                im:markRaw(Im)
            },
            default:{
                name:"im",
                props:{
                    id:id,
                    chatType:chatType
                }
            }
        }
    ],"IM");
    windowManager.open(win);
})