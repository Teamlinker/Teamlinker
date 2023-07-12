import {Icon, iconGroupMap} from "../../../../teamOS/icon/icon";
import {v4} from "uuid"
import {ETeamOS_Window_Type, Window} from "../../../../teamOS/window/window";
import {Message} from "@arco-design/web-vue";
import {windowManager} from "../../../../teamOS/window/windowManager";
import {markRaw} from "vue";
import Project from "../../app/project/project.vue";
import ProjectProfile from "../../app/project/projectProfile.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SessionStorage} from "../../../common/storage/session";

export const iconProject=new Icon("project",iconGroupMap["project"])
iconProject.addEventListener("dbClick",item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error("you must choose organization")
        return;
    }
    const win=new Window("project",ETeamOS_Window_Type.TAB, "project",true,[
        {
            id:v4(),
            meta:{
                title:"project"
            },
            components:{
                project:markRaw(Project),
                profile:markRaw(ProjectProfile)
            },
            default:{
                name:"project",
                title:"project"
            }
        }
    ],"project");
    win.addEventListener("newTab", async item => {
        return {
            id:v4(),
            meta:{
                title:"project"
            },
            components:{
                project:markRaw(Project),
                profile:markRaw(ProjectProfile)
            },
            default:{
                name:"project",
                title: "project"
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_PROFILE,projectId => {
    const win=new Window("project",ETeamOS_Window_Type.TAB, "project",true,[
        {
            id:v4(),
            meta:{
                title:"project"
            },
            components:{
                project:markRaw(Project),
                profile:markRaw(ProjectProfile)
            },
            default:{
                name:"profile",
                title: "profile",
                props:{
                    projectId:projectId
                }
            }
        }
    ],"project");
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,(projectId,projectIssueId) => {
    const win=new Window("project",ETeamOS_Window_Type.TAB, "project",true,[
        {
            id:v4(),
            meta:{
                title:"project",
                data:{
                    projectIssueId:projectIssueId
                }
            },
            components:{
                project:markRaw(Project),
                profile:markRaw(ProjectProfile)
            },
            default:{
                name:"profile",
                title: "profile",
                props:{
                    projectId:projectId
                }
            }
        }
    ],"project");
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,(projectId,projectReleaseId) => {
    const win=new Window("project",ETeamOS_Window_Type.TAB, "project",true,[
        {
            id:v4(),
            meta:{
                title:"project",
                data:{
                    projectReleaseId:projectReleaseId
                }
            },
            components:{
                project:markRaw(Project),
                profile:markRaw(ProjectProfile)
            },
            default:{
                name:"profile",
                title: "profile",
                props:{
                    projectId:projectId
                }
            }
        }
    ],"project");
    windowManager.open(win);
})