import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Im from "../../../controller/app/im/im.vue";
import {SessionStorage} from "../../../common/storage/session";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import i18n from "@/business/common/i18n/i18n";

const {t}=i18n.global
export const iconIM=new Icon(t("util.im"),iconGroupMap["im"],"im")
const func=item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error(t("tip.switchToSpecificOrganization"))
        return;
    }
    const win=new Window(t("util.im"),ETeamOS_Window_Type.SIMPLE, "im",false,[
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
    ],t("util.im"));
    windowManager.open(win);
}
iconIM.addEventListener("dbClick",item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconIM.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,(id, chatType) => {
    const win=new Window(t("util.im"),ETeamOS_Window_Type.SIMPLE, "im",false,[
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
    ],t("util.im"));
    windowManager.open(win);
})