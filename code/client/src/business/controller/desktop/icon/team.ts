import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Team from "../../app/team/team.vue";
import TeamProfile from "../../app/team/teamProfile.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";

export const iconTeam=new Icon("team",iconGroupMap["team"])
iconTeam.addEventListener("dbClick", item => {
    if(!sessionStorage.getItem("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("team",ETeamOS_Window_Type.TAB, "team",true,[
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
                title: "team"
            }
        }
    ],"team");
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
                title: "team"
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_TEAM_PROFILE,teamId => {
    const win=new Window("team",ETeamOS_Window_Type.TAB, "team",true,[
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
                title: "profile",
                props:{
                    teamId:teamId
                }
            }
        }
    ],"team");
    windowManager.open(win);
})