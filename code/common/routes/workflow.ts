import {ECommon_Model_Workflow_Node_Status} from '../model/workflow_node';
import {ICommon_Model_Workflow_Action} from './../model/workflow_action';
import {ICommon_Model_Workflow_Node} from './../model/workflow_node';
import {ECommon_Services} from './../types';
import {ECommon_HttpApi_Method} from "./types";
import {ICommon_Route_Res_Workflow_Info} from "./response";
import {Permission_Types} from "../permission/permission";

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
        copy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/copy",
            req:<{
                issueTypeId:string,
                newIssueTypeId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.ADMIN]
        },
        addNode:{
            method:ECommon_HttpApi_Method.POST,
            path:"/node",
            req:<{
                issueTypeId:string
                name :string,
                description? :string,
                status? :ECommon_Model_Workflow_Node_Status,
                workflowId :string,
                x:number,
                y:number
            }>{},
            res:<ICommon_Model_Workflow_Node>{},
            permission:[Permission_Types.Project.ADMIN]
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
                y:number
            }>{},
            res:<ICommon_Model_Workflow_Node>{},
            permission:[Permission_Types.Project.ADMIN]
        },
        deleteNode:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/node",
            req:<{
                workflowNodeId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.ADMIN]
        },
        addAction:{
            method:ECommon_HttpApi_Method.POST,
            path:"/action",
            req:<{
                issueTypeId:string,
                name :string,
                description? :string,
                workflowId :string,
                sourceNodeId:string,
                destNodeId:string,
            }>{},
            res:<ICommon_Model_Workflow_Action>{},
            permission:[Permission_Types.Project.ADMIN]
        },
        editAction:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/action",
            req:<{
                workflowActionId:string
                name? :string,
                description? :string,
                sourceNodeId:string,
                destNodeId:string,
            }>{},
            res:<ICommon_Model_Workflow_Action>{},
            permission:[Permission_Types.Project.ADMIN]
        },
        deleteAction:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/action",
            req:<{
                workflowActionId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.ADMIN]
        },
    }
}
export default api