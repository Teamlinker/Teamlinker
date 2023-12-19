import i18n from "@/business/common/i18n/i18n";
import {Icon, iconGroupMap} from "@/teamOS/icon/icon";
import {ETeamOS_Window_Type, Window} from "@/teamOS/window/window";
import {v4} from "uuid";
import {markRaw} from "vue";
import Help from "@/business/controller/app/help/help.vue";
import {windowManager} from "@/teamOS/window/windowManager";

const {t}=i18n.global
export const iconHelp=new Icon(t("util.help"),iconGroupMap["help"],"help")
const func=item => {
    const win=new Window(t("util.help"),ETeamOS_Window_Type.SIMPLE, "help",false,[
        {
            id:v4(),
            meta:{
                title:"help"
            },
            components:{
                help:markRaw(Help)
            },
            default:{
                name:"help"
            }
        }
    ],t("util.help"));
    windowManager.open(win,true);
}
iconHelp.addEventListener("dbClick",item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconHelp.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})