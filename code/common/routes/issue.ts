import { ICommon_Model_Comment } from "../model/comment";
import { ICommon_Model_Workflow_Action } from "../model/workflow_action";
import { Permission_Types } from "../permission/permission";
import { ECommon_Services } from "../types";
import { ICommon_Model_Project_Issue } from './../model/project_issue';
import { ICommon_Model_Project_Lable } from './../model/project_label';
import { ICommon_Model_Project_Module } from './../model/project_module';
import { ICommon_Route_Req_ProjectIssue_Field, ICommon_Route_Res_FieldSolution_ListWorkflowNodeField, ICommon_Route_Res_ProjectIssue_BasicInfo, ICommon_Route_Res_ProjectIssue_fieldsInfo, ICommon_Route_Res_Project_filter } from "./response";
import { ECommon_HttpApi_Method } from "./types";

const api={
    baseUrl:"/issue",
    service:ECommon_Services.Cooperation,
    routes:{
        getFirstNodeFields:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/first",
            req:<{
                projectId :string,
                issueTypeId:string
            }>{},
            res:<ICommon_Route_Res_FieldSolution_ListWorkflowNodeField[]>{},
            permission:[Permission_Types.Project.READ]
        },
        create:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item",
            req:<{
                projectId :string ,
                issueTypeId :string ,
                name :string,
                priority :number,
                assignerId? :string ,
                reporterId? :string ,
                values?:ICommon_Route_Req_ProjectIssue_Field[]
            }>{},
            res:<ICommon_Model_Project_Issue>{},
            permission:[Permission_Types.Project.READ]
        },
        getNextNodeFields:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/next",
            req:<{
                projectIssueId :string,
                workflowActionId:string
            }>{},
            res:<ICommon_Route_Res_FieldSolution_ListWorkflowNodeField[]>{},
            permission:[Permission_Types.Project.READ]
        },
        confirmNextNode:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/next",
            req:<{
                projectIssueId :string,
                workflowActionId:string,
                value?:ICommon_Route_Req_ProjectIssue_Field[]
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        editExtraField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/extrafield",
            req:<{
                projectIssueId :string,
                value:ICommon_Route_Req_ProjectIssue_Field
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        editBasicField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/basicfield",
            req:<{
                projectIssueId :string,
                name? :string,
                priority? :number,
                assignerId? :string ,
                reporterId? :string 
            }>{},
            res:<ICommon_Model_Project_Issue>{},
            permission:[Permission_Types.Project.READ]
        },
        editDescription:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/description",
            req:<{
                projectIssueId :string,
                description:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        remove:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                projectIssueId :string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        basicInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/basic",
            req:<{
                projectIssueId? :string,
                uniqueKey?:string
            }>{},
            res:<ICommon_Route_Res_ProjectIssue_BasicInfo>{},
            permission:[Permission_Types.Project.READ]
        },
        descriptionInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/description",
            req:<{
                projectIssueId :string
            }>{},
            res:<string>{},
            permission:[Permission_Types.Project.READ]
        },
        fieldsInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/fields",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Route_Res_ProjectIssue_fieldsInfo[]>{},
            permission:[Permission_Types.Project.READ]
        },
        actionsInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/actions",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Model_Workflow_Action[]>{},
            permission:[Permission_Types.Project.READ]
        },
        commentList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/comment/list",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Model_Comment[]>{},
            permission:[Permission_Types.Project.READ]
        },
        commentCreate:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/comment",
            req:<{
                projectIssueId :string,
                content:string
            }>{},
            res:<ICommon_Model_Comment>{},
            permission:[Permission_Types.Project.READ]
        },
        commentEdit:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/comment",
            req:<{
                commentId :string,
                content:string
            }>{},
            res:<ICommon_Model_Comment>{},
            permission:[Permission_Types.Project.READ]
        },
        commentRemove:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/comment",
            req:<{
                commentId :string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        copy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/copy",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Model_Project_Issue>{},
            permission:[Permission_Types.Project.READ]
        },
        addChildIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/child",
            req:<{
                projectIssueId :string,
                projectIssueChildId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        removeChildIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/child",
            req:<{
                projectIssueId :string,
                projectIssueChildId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        addParentIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/parent",
            req:<{
                projectIssueId :string,
                projectIssueParentId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        removeParentIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/parent",
            req:<{
                projectIssueId :string,
                projectIssueParentId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        addRelatedIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/related",
            req:<{
                projectIssueId :string,
                projectIssueRelatedId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        removeRelatedIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/related",
            req:<{
                projectIssueId :string,
                projectIssueRelatedId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        otherInfoList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/list",
            req:<{
                projectIssueId :string
            }>{},
            res:<{
                parent:ICommon_Model_Project_Issue,
                children:ICommon_Model_Project_Issue[],
                relateds:ICommon_Model_Project_Issue[],
                labels:ICommon_Model_Project_Lable[],
                modules:ICommon_Model_Project_Module[]
            }>{},
            permission:[Permission_Types.Project.READ]
        },
        bindTag:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/tag/bind",
            req:<{
                projectIssueId :string,
                tagId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        unbindTag:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/tag/bind",
            req:<{
                projectIssueId :string,
                tagId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        bindModule:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/module/bind",
            req:<{
                projectIssueId :string,
                moduleId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        unbindModule:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/module/bind",
            req:<{
                projectIssueId :string,
                moduleId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.READ]
        },
        filter:{
            method:ECommon_HttpApi_Method.GET,
            path:"/filter",
            req:<{
                projectId :string,
                createdBy?:string,
                issueTypeId:string,
                name?:string,
                priority?:number,
                assignerId?:string,
                reporterId?:string
                status?:number,
                moduleId?:string,
                tagId?:string,
                page:number,
                size:number
            }>{},
            res:<ICommon_Route_Res_Project_filter[]>{},
            permission:[Permission_Types.Project.READ]
        }
    }
}
export=api