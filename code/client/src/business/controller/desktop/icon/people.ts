import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import People from "../../app/people/people.vue";
import PeopleProfile from "../../app/people/peopleProfile.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SessionStorage} from "../../../common/storage/session";

export const iconPeople=new Icon("people",iconGroupMap["people"])
iconPeople.addEventListener("dbClick", item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("people",ETeamOS_Window_Type.TAB, "people",true,[
        {
            id:v4(),
            meta:{
                title:"people"
            },
            components:{
                people:markRaw(People),
                profile:markRaw(PeopleProfile)
            },
            default:{
                name:"people",
                title: "people"
            }
        }
    ],"people");
    win.addEventListener("newTab", async item => {
        return {
            id:v4(),
            meta:{
                title:"people"
            },
            components:{
                people:markRaw(People),
                profile:markRaw(PeopleProfile)
            },
            default:{
                name:"people",
                title: "people"
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,organizationUserId => {
    const win=new Window("people",ETeamOS_Window_Type.TAB, "people",true,[
        {
            id:v4(),
            meta:{
                title:"people"
            },
            components:{
                people:markRaw(People),
                profile:markRaw(PeopleProfile)
            },
            default:{
                name:"profile",
                title: "profile",
                props:{
                    organizationUserId:organizationUserId
                }
            }
        }
    ],"people");
    windowManager.open(win);
})