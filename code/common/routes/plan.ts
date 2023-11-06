import {ECommon_Services} from "../types";
import {ECommon_HttpApi_Method} from "./types";
import {Permission_Types} from "../permission/permission";
import {ICommon_Model_Plan} from "../model/plan";
import {ICommon_Route_Res_Plan_Info, ICommon_Route_Res_Plan_Info_Item, ICommon_Route_Res_Plan_List} from "./response";

const api= {
    baseUrl: "/plan",
    service: ECommon_Services.Cooperation,
    routes: {
        listPlan: {
            method: ECommon_HttpApi_Method.GET,
            path: "/list",
            req: <{
                projectId: string,
                page: number,
                size: number,
                keyword?: string
            }>{},
            res: <ICommon_Route_Res_Plan_List>{},
            permission: [Permission_Types.Project.READ]
        },
        plan: {
            method: ECommon_HttpApi_Method.GET,
            path: "/item",
            req: <{
                planId:string
            }>{},
            res: <ICommon_Model_Plan>{},
            permission: [Permission_Types.Project.READ]
        },
        createPlan: {
            method: ECommon_HttpApi_Method.POST,
            path: "/item",
            req: <{
                projectId:string,
                name:string,
                startTime:number
            }>{},
            res: <ICommon_Model_Plan>{},
            permission: [Permission_Types.Project.EDIT]
        },
        editPlan:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/item",
            req: <{
                planId:string
                name?:string,
                startTime?:number
            }>{},
            res: <ICommon_Model_Plan>{},
            permission: [Permission_Types.Project.EDIT]
        },
        removePlan:{
            method: ECommon_HttpApi_Method.DELETE,
            path: "/item",
            req: <{
                planId:string
            }>{},
            res: {},
            permission: [Permission_Types.Project.DELETE,Permission_Types.Common.SELF],
            permissionOr:true
        },
        info:{
            method: ECommon_HttpApi_Method.GET,
            path: "/info",
            req: <{
                planId:string
            }>{},
            res: <ICommon_Route_Res_Plan_Info>{},
            permission: [Permission_Types.Project.READ]
        },
        createStage:{
            method: ECommon_HttpApi_Method.POST,
            path: "/stage",
            req: <{
                planId:string,
                name:string,
                parentId?:string,
                dependId?:string,
                delay?:number
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        editStage:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/stage",
            req: <{
                planItemId:string,
                name?:string,
                dependId?:string,
                delay?:number
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        createMileStone:{
            method: ECommon_HttpApi_Method.POST,
            path: "/milestone",
            req: <{
                planId:string,
                name:string,
                parentId?:string
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        editMileStone:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/milestone",
            req: <{
                planItemId:string,
                name?:string,
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        addIssue:{
            method: ECommon_HttpApi_Method.POST,
            path: "/issue",
            req: <{
                planId:string,
                parentId?:string,
                projectIssueId:string,
                dependId?:string,
                delay?:number
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        editIssue:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/issue",
            req: <{
                planItemId:string,
                dependId?:string,
                delay?:number,
                manDay?:number
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        removeItem:{
            method: ECommon_HttpApi_Method.DELETE,
            path: "/list/item",
            req: <{
                planItemId:string
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        editProgress:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/issue/progress",
            req: <{
                planItemId:string,
                progress:number
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        moveItem:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/move",
            req: <{
                planItemId:string,
                targetId:string,
                action:"in"|"top"|"bottom"
            }>{},
            res: <ICommon_Route_Res_Plan_Info_Item[]>{},
            permission: [Permission_Types.Project.EDIT]
        },
        issuePlanList:{
            method: ECommon_HttpApi_Method.GET,
            path: "/issueplan/list",
            req: <{
                projectIssueId:string
            }>{},
            res: <ICommon_Model_Plan[]>{},
            permission: [Permission_Types.Project.READ]
        },
        issuePlanEdit:{
            method: ECommon_HttpApi_Method.POST,
            path: "/issueplan",
            req: <{
                projectIssueId:string,
                planList:string[]
            }>{},
            res: <ICommon_Model_Plan[]>{},
            permission: [Permission_Types.Project.EDIT]
        }
    }
}

export default api