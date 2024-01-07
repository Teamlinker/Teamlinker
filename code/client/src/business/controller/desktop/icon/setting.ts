import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import Setting from "../../app/setting/setting.vue";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import {SessionStorage} from "../../../common/storage/session";
import i18n from "@/business/common/i18n/i18n";

const {t}=i18n.global
export const iconSetting=new Icon(t("util.setting"),iconGroupMap["setting"],"setting")
const func=item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error(t("tip.switchToSpecificOrganization"))
        return;
    }
    const win=new Window(t("util.setting"),ETeamOS_Window_Type.SIMPLE, "setting",true,[
        {
            id:v4(),
            meta:{
                title:"setting"
            },
            components:{
                setting:markRaw(Setting)
            },
            default:{
                name:"setting"
            }
        }
    ],t("util.setting"));
    windowManager.open(win);
}
iconSetting.addEventListener("dbClick",item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconSetting.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})