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
import i18n from "@/business/common/i18n/i18n";

const {t}=i18n.global
export const iconWiki=new Icon(t("util.wiki"),iconGroupMap["wiki"],"wiki")
const func=item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error(t("tip.switchToSpecificOrganization"))
        return;
    }
    const win=new Window(t("util.wiki"),ETeamOS_Window_Type.TAB, "wiki",true,[
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
                title:t("util.wiki")
            }
        }
    ],t("util.wiki"));
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
                title:t("util.wiki")
            }
        }
    })
    windowManager.open(win);
}
iconWiki.addEventListener("dbClick",item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconWiki.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_WIKI_PROFILE,wikiId => {
    const win=new Window(t("util.wiki"),ETeamOS_Window_Type.TAB, "wiki",true,[
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
                title:t("util.wiki"),
                props:{
                    wikiId:wikiId
                }
            }
        }
    ],t("util.wiki"));
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
                title:t("util.wiki")
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM,(wikiId, wikiItemId) => {
    const win=new Window(t("util.wiki"),ETeamOS_Window_Type.TAB, "wiki",true,[
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
                title:t("util.wiki"),
                props:{
                    wikiId:wikiId
                }
            }
        }
    ],t("util.wiki"));
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
                title:t("util.wiki")
            }
        }
    })
    windowManager.open(win);
})