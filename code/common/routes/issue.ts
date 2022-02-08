import { ICommon_Model_Comment } from "../model/comment";
import { ICommon_Model_Workflow_Action } from "../model/workflow_action";
import { ECommon_Services } from "../types";
import { ICommon_Model_Project_Issue } from './../model/project_issue';
import { ICommon_Model_Project_Lable } from './../model/project_label';
import { ICommon_Model_Project_Module } from './../model/project_module';
import { ICommon_Route_Req_ProjectIssue_Field, ICommon_Route_Res_FieldSolution_ListWorkflowNodeField, ICommon_Route_Res_ProjectIssue_BasicInfo, ICommon_Route_Res_ProjectIssue_fieldsInfo } from "./response";
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
            res:<ICommon_Route_Res_FieldSolution_ListWorkflowNodeField[]>{}
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
            res:<ICommon_Model_Project_Issue>{}
        },
        getNextNodeFields:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/next",
            req:<{
                projectIssueId :string,
                workflowActionId:string
            }>{},
            res:<ICommon_Route_Res_FieldSolution_ListWorkflowNodeField[]>{}
        },
        confirmNextNode:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/next",
            req:<{
                projectIssueId :string,
                workflowActionId:string,
                value?:ICommon_Route_Req_ProjectIssue_Field[]
            }>{},
            res:{}
        },
        editExtraField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/extrafield",
            req:<{
                projectIssueId :string,
                value:ICommon_Route_Req_ProjectIssue_Field
            }>{},
            res:{}
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
            res:<ICommon_Model_Project_Issue>{}
        },
        editDescription:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/description",
            req:<{
                projectIssueId :string,
                description:string
            }>{},
            res:{}
        },
        remove:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                projectIssueId :string
            }>{},
            res:{}
        },
        basicInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/basic",
            req:<{
                projectIssueId? :string,
                uniqueKey?:string
            }>{},
            res:<ICommon_Route_Res_ProjectIssue_BasicInfo>{}
        },
        descriptionInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/description",
            req:<{
                projectIssueId :string
            }>{},
            res:<string>{}
        },
        fieldsInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/fields",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Route_Res_ProjectIssue_fieldsInfo[]>{}
        },
        actionsInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/actions",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Model_Workflow_Action[]>{}
        },
        commentList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/comment/list",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Model_Comment[]>{}
        },
        commentCreate:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/comment",
            req:<{
                projectIssueId :string,
                content:string
            }>{},
            res:<ICommon_Model_Comment>{}
        },
        commentEdit:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/comment",
            req:<{
                commentId :string,
                content:string
            }>{},
            res:<ICommon_Model_Comment>{}
        },
        commentRemove:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/comment",
            req:<{
                commentId :string
            }>{},
            res:{}
        },
        copy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/copy",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Model_Project_Issue>{}
        },
        addChildIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/child",
            req:<{
                projectIssueId :string,
                projectIssueChildId:string
            }>{},
            res:{}
        },
        removeChildIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/child",
            req:<{
                projectIssueId :string,
                projectIssueChildId:string
            }>{},
            res:{}
        },
        addParentIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/parent",
            req:<{
                projectIssueId :string,
                projectIssueParentId:string
            }>{},
            res:{}
        },
        removeParentIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/parent",
            req:<{
                projectIssueId :string,
                projectIssueParentId:string
            }>{},
            res:{}
        },
        addRelatedIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/related",
            req:<{
                projectIssueId :string,
                projectIssueRelatedId:string
            }>{},
            res:{}
        },
        removeRelatedIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/related",
            req:<{
                projectIssueId :string,
                projectIssueRelatedId:string
            }>{},
            res:{}
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
            }>{}
        },
        bindTag:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/tag/bind",
            req:<{
                projectIssueId :string,
                tagId:string
            }>{},
            res:{}
        },
        unbindTag:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/tag/bind",
            req:<{
                projectIssueId :string,
                tagId:string
            }>{},
            res:{}
        },
        bindModule:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/module/bind",
            req:<{
                projectIssueId :string,
                moduleId:string
            }>{},
            res:{}
        },
        unbindModule:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/module/bind",
            req:<{
                projectIssueId :string,
                moduleId:string
            }>{},
            res:{}
        }
    }
}
export=api