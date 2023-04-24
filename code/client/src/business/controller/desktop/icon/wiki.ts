import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Wiki from "../../app/wiki/wiki.vue";
import WikiProfile from "../../app/wiki/wikiProfile.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SessionStorage} from "../../../common/storage/session";

export const iconWiki=new Icon("wiki",iconGroupMap["wiki"])
iconWiki.addEventListener("dbClick",item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("wiki",ETeamOS_Window_Type.TAB, "wiki",true,[
        {
            id:v4(),
            meta:{
                title:"wiki"
            },
            components:{
                wiki:markRaw(Wiki),
                profile:markRaw(WikiProfile)
            },
            default:{
                name:"wiki",
                title:"wiki"
            }
        }
    ],"wiki");
    win.addEventListener("newTab", async item => {
        return {
            id:v4(),
            meta:{
                title:"wiki"
            },
            components:{
                wiki:markRaw(Wiki),
                profile:markRaw(WikiProfile)
            },
            default:{
                name:"wiki",
                title:"wiki"
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_WIKI_PROFILE,wikiId => {
    const win=new Window("wiki",ETeamOS_Window_Type.TAB, "wiki",true,[
        {
            id:v4(),
            meta:{
                title:"wiki"
            },
            components:{
                wiki:markRaw(Wiki),
                profile:markRaw(WikiProfile)
            },
            default:{
                name:"profile",
                title:"wiki",
                props:{
                    wikiId:wikiId
                }
            }
        }
    ],"wiki");
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM,(wikiId, wikiItemId) => {
    const win=new Window("wiki",ETeamOS_Window_Type.TAB, "wiki",true,[
        {
            id:v4(),
            meta:{
                title:"wiki",
                data:{
                    wikiItemId
                }
            },
            components:{
                wiki:markRaw(Wiki),
                profile:markRaw(WikiProfile)
            },
            default:{
                name:"profile",
                title:"wiki",
                props:{
                    wikiId:wikiId
                }
            }
        }
    ],"wiki");
    windowManager.open(win);
})