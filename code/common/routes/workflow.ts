import {ECommon_Model_Workflow_Node_Status} from '../model/workflow_node';
import {ICommon_Model_Workflow_Action} from './../model/workflow_action';
import {ICommon_Model_Workflow_Node} from './../model/workflow_node';
import {ECommon_Services} from './../types';
import {ECommon_HttpApi_Method} from "./types";
import {ICommon_Route_Res_Workflow_Info, ICommon_Route_Res_Workflow_Node_List_Item} from "./response";
import {Permission_Types} from "../permission/permission";
import {ECommon_Model_Workflow_Approval_Type, ICommon_Model_Workflow_Approval} from "../model/workflow_approval";

const api={
    baseUrl:"/workflow",
    service:ECommon_Services.Cooperation,
    routes:{
        info:{
            method:ECommon_HttpApi_Method.GET,
            path:"/info",
            req:<{
                issueTypeId:string
            }>{},
            res:<ICommon_Route_Res_Workflow_Info>{},
            permission:[Permission_Types.Organization.READ]
        },
        addNode:{
            method:ECommon_HttpApi_Method.POST,
            path:"/node",
            req:<{
                issueTypeId:string
                name :string,
                description? :string,
                status? :ECommon_Model_Workflow_Node_Status,
                x:number,
                y:number
            }>{},
            res:<ICommon_Model_Workflow_Node>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        editNode:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/node",
            req:<{
                workflowNodeId:string
                name? :string,
                description? :string,
                status? :ECommon_Model_Workflow_Node_Status,
                x?:number,
                y?:number,
                approval?:number,
                approvalType?:ECommon_Model_Workflow_Approval_Type,
                approvalValue?:string[],
                approvalExtra?:string,
                isAllComing?:number
            }>{},
            res:<ICommon_Model_Workflow_Node & {
                approval?:ICommon_Model_Workflow_Approval
            }>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        deleteNode:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/node",
            req:<{
                workflowNodeId:string
            }>{},
            res:{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        addAction:{
            method:ECommon_HttpApi_Method.POST,
            path:"/action",
            req:<{
                issueTypeId:string,
                name :string,
                description? :string,
                sourceNodeId:string,
                destNodeId:string,
                sourceAnchorPoint:string,
                endAnchorPoint:string
            }>{},
            res:<ICommon_Model_Workflow_Action>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        editAction:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/action",
            req:<{
                workflowActionId:string
                name? :string,
                description? :string,
                sourceNodeId?:string,
                destNodeId?:string,
                sourceAnchorPoint?:string,
                endAnchorPoint?:string
            }>{},
            res:<ICommon_Model_Workflow_Action>{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        deleteAction:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/action",
            req:<{
                workflowActionId:string
            }>{},
            res:{},
            permission:[Permission_Types.Organization.ADMIN]
        },
        listAllNode:{
            method:ECommon_HttpApi_Method.GET,
            path:"/node/listall",
            req:{},
            res:<ICommon_Route_Res_Workflow_Node_List_Item[]>{},
            permission:[Permission_Types.Organization.READ]
        },
        listApprovalField:{
            method:ECommon_HttpApi_Method.GET,
            path:"/approval/field",
            req:<{
                workflowNodeId:string
            }>{},
            res:<{
               id:string,
               name:string
            }[]>{},
            permission:[Permission_Types.Organization.READ]
        }
    }
}
export default api