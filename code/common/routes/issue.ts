import {ICommon_Model_Content} from "../model/content";
import {ICommon_Model_Workflow_Action} from "../model/workflow_action";
import {Permission_Types} from "../permission/permission";
import {ECommon_Services} from "../types";
import {ICommon_Model_Project_Issue} from './../model/project_issue';
import {ICommon_Model_Project_Label} from './../model/project_label';
import {ICommon_Model_Project_Module} from './../model/project_module';
import {
    ICommon_Route_Req_ProjectIssue_Field,
    ICommon_Route_Req_ProjectIssue_Field_Value,
    ICommon_Route_Res_Global_Search_Project_Issue_Item,
    ICommon_Route_Res_Project_Issue_filter,
    ICommon_Route_Res_ProjectIssue_BasicInfo,
    ICommon_Route_Res_ProjectIssue_fieldsInfo,
    ICommon_Route_Res_RecentIssue_Item,
    ICommon_Route_Res_Workflow_Node_Field
} from "./response";
import {ECommon_HttpApi_Method} from "./types";
import {ICommon_Model_Project_Issue_Field_Value} from "../model/project_issue_field_value";
import {ICommon_Model_Project_Release} from "../model/project_release";
import {ICommon_Model_Project_Issue_History} from "../model/project_issue_history";
import {ECommon_Model_Project_Issue_Approval_Action} from "../model/project_issue_approval";

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
            res:<ICommon_Route_Res_Workflow_Node_Field[]>{},
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
                manDay:number,
                values?:ICommon_Route_Req_ProjectIssue_Field[]
            }>{},
            res:<ICommon_Model_Project_Issue>{},
            permission:[Permission_Types.Project.EDIT]
        },
        getNextNodeFields:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/next",
            req:<{
                projectIssueId :string,
                workflowActionId:string
            }>{},
            res:<ICommon_Route_Res_Workflow_Node_Field[]>{},
            permission:[Permission_Types.Project.READ]
        },
        confirmNextNode:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/next",
            req:<{
                projectIssueId :string,
                workflowActionId:string,
                values?:ICommon_Route_Req_ProjectIssue_Field[]
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        editExtraField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/extrafield",
            req:<{
                projectIssueId :string,
                value:ICommon_Route_Req_ProjectIssue_Field_Value
            }>{},
            res:<ICommon_Model_Project_Issue_Field_Value>{},
            permission:[Permission_Types.Project.EDIT]
        },
        editBasicField:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/basicfield",
            req:<{
                projectIssueId :string,
                name? :string,
                priority? :number,
                assignerId? :string ,
                reporterId? :string ,
                manDay?:number
            }>{},
            res:<ICommon_Model_Project_Issue>{},
            permission:[Permission_Types.Project.EDIT]
        },
        editDescription:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/description",
            req:<{
                projectIssueId :string,
                description?:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        remove:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                projectIssueId :string
            }>{},
            res:{},
            permission:[Permission_Types.Project.DELETE,Permission_Types.Common.SELF],
            permissionOr:true
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
            res:<ICommon_Model_Workflow_Action[] | {
                isApproval:true,
                type:ECommon_Model_Project_Issue_Approval_Action
            }[]>{},
            permission:[Permission_Types.Project.READ]
        },
        commentList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/item/comment/list",
            req:<{
                projectIssueId :string
            }>{},
            res:<ICommon_Model_Content[]>{},
            permission:[Permission_Types.Project.READ]
        },
        commentCreate:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/comment",
            req:<{
                projectIssueId :string,
                content:string
            }>{},
            res:<ICommon_Model_Content>{},
            permission:[Permission_Types.Project.EDIT]
        },
        commentEdit:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item/comment",
            req:<{
                contentId :string,
                content:string
            }>{},
            res:<ICommon_Model_Content>{},
            permission:[Permission_Types.Project.EDIT,Permission_Types.Common.SELF]
        },
        commentRemove:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/comment",
            req:<{
                contentId :string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT,Permission_Types.Common.SELF]
        },
        copy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/copy",
            req:<{
                projectIssueId :string,
                name:string
            }>{},
            res:<ICommon_Model_Project_Issue>{},
            permission:[Permission_Types.Project.EDIT]
        },
        addChildIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/child",
            req:<{
                projectIssueId :string,
                projectIssueChildId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        removeChildIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/child",
            req:<{
                projectIssueId :string,
                projectIssueChildId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        addParentIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/parent",
            req:<{
                projectIssueId :string,
                projectIssueParentId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        removeParentIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/parent",
            req:<{
                projectIssueId :string,
                projectIssueParentId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        addRelatedIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/related",
            req:<{
                projectIssueId :string,
                projectIssueRelatedId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        removeRelatedIssue:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item/related",
            req:<{
                projectIssueId :string,
                projectIssueRelatedId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
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
                labels:ICommon_Model_Project_Label[],
                modules:ICommon_Model_Project_Module[]
            }>{},
            permission:[Permission_Types.Project.READ]
        },
        bindLabel:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/tag/bind",
            req:<{
                projectIssueId :string,
                labelIds:string[]
            }>{},
            res:<ICommon_Model_Project_Label[]>{},
            permission:[Permission_Types.Project.EDIT]
        },
        bindModule:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/module/bind",
            req:<{
                projectIssueId :string,
                moduleId?:string
            }>{},
            res:<ICommon_Model_Project_Module[]>{},
            permission:[Permission_Types.Project.EDIT]
        },
        filter:{
            method:ECommon_HttpApi_Method.GET,
            path:"/filter",
            req:<{
                projectIssueIds?:string[],
                projectId? :string,
                createdBy?:string,
                issueTypeId?:string,
                name?:string,
                priority?:number,
                assignerId?:string,
                reporterId?:string
                status?:number,
                moduleId?:string,
                labelId?:string,
                page:number,
                size:number
            }>{},
            res:<ICommon_Route_Res_Project_Issue_filter>{},
            permission:[Permission_Types.Organization.READ]
        },
        releaseList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/release/list",
            req:<{
                projectIssueId:string
            }>{},
            res:<ICommon_Model_Project_Release[]>{},
            permission:[Permission_Types.Project.READ]
        },
        bindReleases:{
            method:ECommon_HttpApi_Method.POST,
            path:"/release",
            req:<{
                projectIssueId:string,
                projectReleaseIds:string[]
            }>{},
            res:<ICommon_Model_Project_Release[]>{},
            permission:[Permission_Types.Project.EDIT]
        },
        issueRelatedUsers:{
            method:ECommon_HttpApi_Method.GET,
            path:"/related/users",
            req:<{
                projectIssueId:string
            }>{},
            res:<{
                id:string,
                name:string,
                photo:string
            }[]>{},
            permission:[Permission_Types.Project.READ]
        },
        createChildIssue:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item/createchild",
            req:<{
                projectIssueId :string,
                name:string
            }>{},
            res:<ICommon_Model_Project_Issue>{},
            permission:[Permission_Types.Project.EDIT]
        },
        listHistory:{
            method:ECommon_HttpApi_Method.GET,
            path:"/history",
            req:<{
                projectIssueId :string,
            }>{},
            res:<ICommon_Model_Project_Issue_History[]>{},
            permission:[Permission_Types.Project.READ]
        },
        checkApproval:{
            method:ECommon_HttpApi_Method.GET,
            path:"/approval/check",
            req:<{
                projectIssueId :string,
            }>{},
            res:<{
                access:boolean
            }>{},
            permission:[Permission_Types.Project.READ]
        },
        revokeApproval:{
            method:ECommon_HttpApi_Method.POST,
            path:"/approval/revoke",
            req:<{
                projectIssueId :string,
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        resolveApproval:{
            method:ECommon_HttpApi_Method.POST,
            path:"/approval/resolve",
            req:<{
                projectIssueId :string,
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        rejectApproval:{
            method:ECommon_HttpApi_Method.POST,
            path:"/approval/reject",
            req:<{
                projectIssueId :string,
                reason:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        commitApproval:{
            method:ECommon_HttpApi_Method.POST,
            path:"/approval/commit",
            req:<{
                projectIssueId :string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        convert:{
            method:ECommon_HttpApi_Method.POST,
            path:"/convert",
            req:<{
                projectIssueId :string,
                issueTypeId:string
                values:ICommon_Route_Req_ProjectIssue_Field[]
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        listConvertField:{
            method:ECommon_HttpApi_Method.GET,
            path:"/convert/fields",
            req:<{
                projectId :string,
                issueTypeId:string
            }>{},
            res:<ICommon_Route_Res_Workflow_Node_Field[]>{},
            permission:[Permission_Types.Project.READ]
        },
        count:{
            method:ECommon_HttpApi_Method.GET,
            path:"/count",
            req:<{
                projectId :string
            }>{},
            res:<{
                count:number
            }>{},
            permission:[Permission_Types.Project.READ]
        },
        globalSearchIssue:{
            method:ECommon_HttpApi_Method.GET,
            path:"/global/issue",
            req:<{
                keyword:string,
                size:number
            }>{},
            res:<ICommon_Route_Res_Global_Search_Project_Issue_Item[]>{},
            permission:[Permission_Types.Organization.READ]
        },
        recentIssueList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/recent/list",
            req:<{
                size:number
            }>{},
            res:<ICommon_Route_Res_RecentIssue_Item[]>{},
            permission:[Permission_Types.Organization.READ]
        }
    }
}
export default api