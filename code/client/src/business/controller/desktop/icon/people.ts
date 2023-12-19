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
import i18n from "@/business/common/i18n/i18n";

const {t}=i18n.global
export const iconPeople=new Icon(t("util.people"),iconGroupMap["people"],"people")
const func=item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error(t("tip.switchToSpecificOrganization"))
        return;
    }
    const win=new Window(t("util.people"),ETeamOS_Window_Type.TAB, "people",true,[
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
                title: t("util.people")
            }
        }
    ],t("util.people"));
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
                title: t("util.people")
            }
        }
    })
    windowManager.open(win);
}
iconPeople.addEventListener("dbClick", item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconPeople.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,organizationUserId => {
    const win=new Window(t("util.people"),ETeamOS_Window_Type.TAB, "people",true,[
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
                title: t("util.profile"),
                props:{
                    organizationUserId:organizationUserId
                }
            }
        }
    ],t("util.people"));
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
                title: t("util.people")
            }
        }
    })
    windowManager.open(win);
})