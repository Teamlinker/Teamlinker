import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Team from "../../app/team/team.vue";
import TeamProfile from "../../app/team/teamProfile.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SessionStorage} from "../../../common/storage/session";
import i18n from "@/business/common/i18n/i18n";

const {t}=i18n.global
export const iconTeam=new Icon(t("util.team"),iconGroupMap["team"],"team")
const func=item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error(t("tip.switchToSpecificOrganization"))
        return;
    }
    const win=new Window(t("util.team"),ETeamOS_Window_Type.TAB, "team",true,[
        {
            id:v4(),
            meta:{
                title:"team"
            },
            components:{
                team:markRaw(Team),
                profile:markRaw(TeamProfile)
            },
            default:{
                name:"team",
                title: t("util.team")
            }
        }
    ],t("util.team"));
    win.addEventListener("newTab", async item => {
        return {
            id:v4(),
            meta:{
                title:"team"
            },
            components:{
                team:markRaw(Team),
                profile:markRaw(TeamProfile)
            },
            default:{
                name:"team",
                title: t("util.team")
            }
        }
    })
    windowManager.open(win);
}
iconTeam.addEventListener("dbClick", item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconTeam.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_TEAM_PROFILE,teamId => {
    const win=new Window(t("util.team"),ETeamOS_Window_Type.TAB, "team",true,[
        {
            id:v4(),
            meta:{
                title:"team"
            },
            components:{
                team:markRaw(Team),
                profile:markRaw(TeamProfile)
            },
            default:{
                name:"profile",
                title:t("util.profile"),
                props:{
                    teamId:teamId
                }
            }
        }
    ],t("util.team"));
    win.addEventListener("newTab", async item => {
        return {
            id:v4(),
            meta:{
                title:"team"
            },
            components:{
                team:markRaw(Team),
                profile:markRaw(TeamProfile)
            },
            default:{
                name:"team",
                title: t("util.team")
            }
        }
    })
    windowManager.open(win);
})