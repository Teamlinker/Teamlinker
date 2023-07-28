import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Finder from "../../app/finder/finder.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";

export const iconFinder=new Icon("Finder",iconGroupMap["finder"])
iconFinder.addEventListener("dbClick",item => {
    const win=new Window("finder",ETeamOS_Window_Type.SIMPLE, "finder",false,[
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
    ],"Finder");
    windowManager.open(win,true);
})
eventBus.on(EClient_EVENTBUS_TYPE.FINDER_OPEN_WINDOW,(folderId) => {
    const win=new Window("finder",ETeamOS_Window_Type.SIMPLE, "finder",false,[
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
    ],"Finder");
    windowManager.open(win,true);
})