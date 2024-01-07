import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Finder from "../../app/finder/finder.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import i18n from "@/business/common/i18n/i18n";

const {t}=i18n.global
export const iconFinder=new Icon(t("util.finder"),iconGroupMap["finder"],"finder")
const func=item => {
    const win=new Window(t("util.finder"),ETeamOS_Window_Type.SIMPLE, "finder",false,[
        {
            id:v4(),
            meta:{
                title:"finder"
            },
            components:{
                finder:markRaw(Finder)
            },
            default:{
                name:"finder"
            }
        }
    ],t("util.finder"));
    windowManager.open(win,true);
}
iconFinder.addEventListener("dbClick",item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconFinder.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})
eventBus.on(EClient_EVENTBUS_TYPE.FINDER_OPEN_WINDOW,(folderId) => {
    const win=new Window(t("util.finder"),ETeamOS_Window_Type.SIMPLE, "finder",false,[
        {
            id:v4(),
            meta:{
                title:"finder"
            },
            components:{
                finder:markRaw(Finder)
            },
            default:{
                name:"finder",
                props:{
                    folderId:folderId
                }
            }
        }
    ],t("util.finder"));
    windowManager.open(win,true);
})