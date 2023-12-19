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
import i18n from "@/business/common/i18n/i18n";

const {t}=i18n.global
export const iconProject=new Icon(t("util.project"),iconGroupMap["project"],"project")
const func=item => {
    if(!SessionStorage.get("organizationId")) {
        Message.error(t("tip.switchToSpecificOrganization"))
        return;
    }
    const win=new Window(t("util.project"),ETeamOS_Window_Type.TAB, "project",true,[
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
                title:t("util.project")
            }
        }
    ],t("util.project"));
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
                title: t("util.project")
            }
        }
    })
    windowManager.open(win);
}
iconProject.addEventListener("dbClick",item => {
    if(!document.getElementById("application")) {
        func(item)
    }
})
iconProject.addEventListener("click",item => {
    if(document.getElementById("application")) {
        func(item)
    }
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_PROFILE,projectId => {
    const win=new Window(t("util.project"),ETeamOS_Window_Type.TAB, "project",true,[
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
                title: t("util.profile"),
                props:{
                    projectId:projectId
                }
            }
        }
    ],t("util.project"));
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
                title: t("util.project")
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,(projectId,projectIssueId) => {
    const win=new Window(t("util.project"),ETeamOS_Window_Type.TAB, "project",true,[
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
                title: t("util.profile"),
                props:{
                    projectId:projectId
                }
            }
        }
    ],t("util.project"));
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
                title: t("util.project")
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,(projectId,projectReleaseId) => {
    const win=new Window(t("util.project"),ETeamOS_Window_Type.TAB, "project",true,[
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
                title: t("util.profile"),
                props:{
                    projectId:projectId
                }
            }
        }
    ],t("util.project"));
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
                title: t("util.project")
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_SPRINT_KANBAN_PROFILE,(projectId,boardId, boardSprintId) => {
    const win=new Window(t("util.project"),ETeamOS_Window_Type.TAB, "project",true,[
        {
            id:v4(),
            meta:{
                title:"project",
                data:{
                    boardSprintId:boardSprintId,
                    boardId:boardId
                }
            },
            components:{
                project:markRaw(Project),
                profile:markRaw(ProjectProfile)
            },
            default:{
                name:"profile",
                title: t("util.profile"),
                props:{
                    projectId:projectId
                }
            }
        }
    ],t("util.project"));
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
                title: t("util.project")
            }
        }
    })
    windowManager.open(win);
})
eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_BOARD_PROFILE,(projectId, boardId) => {
    const win=new Window(t("util.project"),ETeamOS_Window_Type.TAB, "project",true,[
        {
            id:v4(),
            meta:{
                title:"project",
                data:{
                    boardId:boardId
                }
            },
            components:{
                project:markRaw(Project),
                profile:markRaw(ProjectProfile)
            },
            default:{
                name:"profile",
                title: t("util.profile"),
                props:{
                    projectId:projectId
                }
            }
        }
    ],t("util.project"));
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
                title: t("util.project")
            }
        }
    })
    windowManager.open(win);
})

eventBus.on(EClient_EVENTBUS_TYPE.OPEN_PROJECT_PLAN_PROFILE,(projectId, planId) => {
    const win=new Window(t("util.project"),ETeamOS_Window_Type.TAB, "project",true,[
        {
            id:v4(),
            meta:{
                title:"project",
                data:{
                    planId:planId
                }
            },
            components:{
                project:markRaw(Project),
                profile:markRaw(ProjectProfile)
            },
            default:{
                name:"profile",
                title: t("util.profile"),
                props:{
                    projectId:projectId
                }
            }
        }
    ],t("util.project"));
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
                title: t("util.project")
            }
        }
    })
    windowManager.open(win);
})