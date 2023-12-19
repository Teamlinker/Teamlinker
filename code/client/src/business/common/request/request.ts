import {ECommon_HttpApi_Method, ICommon_Http_Route_List} from "../../../../../common/routes/types";
import field from "../../../../../common/routes/field"
import file from "../../../../../common/routes/file"
import issue from "../../../../../common/routes/issue"
import issueType from "../../../../../common/routes/issueType"
import organization from "../../../../../common/routes/organization"
import project from "../../../../../common/routes/project"
import release from "../../../../../common/routes/release"
import team from "../../../../../common/routes/team"
import workflow from "../../../../../common/routes/workflow"
import user from "../../../../../common/routes/user"
import wiki from "../../../../../common/routes/wiki"
import calendar from "../../../../../common/routes/calendar"
import meeting from "../../../../../common/routes/meeting"
import gateway from "../../../../../common/routes/gateway"
import finder from "../../../../../common/routes/finder"
import notification from "../../../../../common/routes/notification"
import board from "../../../../../common/routes/board"
import tool from "../../../../../common/routes/tool"
import plan from "../../../../../common/routes/plan"
import {Ref} from "vue";
import {SessionStorage} from "../storage/session";
import {DCSType} from "../../../../../common/types";


let g_funcError:()=>void
let g_authError:()=>void
let g_responseError:(response:Response)=>void
export function onRequestError(func:()=>void) {
    if(func) {
        g_funcError=func
    }
}
export function onAuthError(func:()=>void) {
    if(func) {
        g_authError=func;
    }
}
export function onResponseError(func:()=>void) {
    if(func) {
        g_responseError=func;
    }
}
export function generatorApi<T extends ICommon_Http_Route_List>(api:{
    baseUrl:string,
    routes:T
}):{
    [name in keyof T]:keyof T[name]["req"] extends ""?(loading?:Ref<boolean>)=>Promise<{
        code:number,
        msg?:string,
        data:DCSType<T[name]["res"]>
    }>:(param:T[name]["req"],loading?:Ref<boolean>)=>Promise<{
        code:number,
        msg?:string,
        data:DCSType<T[name]["res"]>
    }>
} {
    let baseUrl=api.baseUrl

    let map:any={}
    for(let name in api.routes) {
        let route=api.routes[name];
        map[name]=async function(param?:any,loading?:Ref<boolean>):Promise<any> {
            if(loading) {
                loading.value=true;
            }
            let objBody:URLSearchParams|FormData
            let uri="/api"+baseUrl+route.path
            if(param) {
                for(let key in param) {
                    let obj=param[key]
                    if(obj===null || obj===undefined) {
                        delete param[key]
                    } else if(typeof(obj)=="object" && !(obj instanceof File)) {
                        param[key]=JSON.stringify(obj);
                    }
                }
                if(route.method==ECommon_HttpApi_Method.POST || route.method==ECommon_HttpApi_Method.PUT) {
                    let isFormData=false
                    for(let key in param) {
                        if(param[key] instanceof File) {
                            isFormData=true;
                            break;
                        }
                    }
                    if(isFormData) {
                        objBody=new FormData();
                        for(let key in param) {
                            let obj=param[key]
                            if(obj instanceof File) {
                                objBody.append(key,obj,obj.name)
                            } else {
                                objBody.append(key,obj);
                            }
                        }
                    } else {
                        objBody = new URLSearchParams(param)
                    }
                } else {
                    uri+="?"+new URLSearchParams(param)
                }
            }
            try {
                if(!route.ignoreValidate && !SessionStorage.get("userToken")) {
                    if(g_authError) {
                        g_authError();
                    }
                    if(loading) {
                        loading.value=false;
                    }
                    return ;
                }
                const response=await fetch(uri,{
                    method:route.method,
                    mode:"cors",
                    cache:"no-cache",
                    credentials:"include",
                    redirect:"follow",
                    headers:{
                        ...(!route.ignoreValidate && {
                            "Authorization":"Bearer "+SessionStorage.get("userToken")
                        }),
                        "Accept-Language":localStorage.getItem("lang")??(navigator.language || "en").toLowerCase().split("-")[0]
                    },
                    ...(objBody && {
                        body:objBody
                    })
                })
                if(response.headers.get("token")) {
                    SessionStorage.set("userToken",response.headers.get("token"))
                }
                if(!response.ok) {
                    if(g_responseError) {
                        g_responseError(response);
                        if(loading) {
                            loading.value=false
                        }
                        return
                    }
                }
                let ret=await response.json();
                if(loading) {
                    loading.value=false
                }
                return ret;
            } catch (e) {
                if(g_funcError) {
                    g_funcError()
                    return null;
                }
            }
        };
    }
    return map;
}

export const apiUser=generatorApi(user)
export const apiField=generatorApi(field)
export const apiFile=generatorApi(file)
export const apiTeam=generatorApi(team)
export const apiProject=generatorApi(project)
export const apiWorkflow=generatorApi(workflow)
export const apiOrganization=generatorApi(organization)
export const apiRelease=generatorApi(release)
export const apiIssue=generatorApi(issue)
export const apiIssueType=generatorApi(issueType)
export const apiWiki=generatorApi(wiki)
export const apiCalendar=generatorApi(calendar)
export const apiMeeting=generatorApi(meeting)
export const apiGateway=generatorApi(gateway)
export const apiFinder=generatorApi(finder)
export const apiNotification=generatorApi(notification)
export const apiBoard=generatorApi(board)
export const apiTool=generatorApi(tool)
export const apiPlan=generatorApi(plan)