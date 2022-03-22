import { ECommon_Model_Workflow_Node_Status } from '../model/workflow_node';
import { Permission_Types } from '../permission/permission';
import { ICommon_Model_Workflow } from './../model/workflow';
import { ICommon_Model_Workflow_Action } from './../model/workflow_action';
import { ICommon_Model_Workflow_Node } from './../model/workflow_node';
import { ICommon_Model_Workflow_Solution } from './../model/workflow_solution';
import { ECommon_Services } from './../types';
import { ICommon_Route_Res_WorkflowSolution_Info, ICommon_Route_Res_Workflow_Info } from './response';
import { ECommon_HttpApi_Method } from "./types";
const api={
    baseUrl:"/workflow",
    service:ECommon_Services.Cooperation,
    routes:{
        list:{
            method:ECommon_HttpApi_Method.GET,
            path:"/list",
            req:<{
                           
            }>{},
            res:<ICommon_Model_Workflow[]>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        info:{
            method:ECommon_HttpApi_Method.GET,
            path:"/info",
            req:<{
                workflowId:string          
            }>{},
            res:<ICommon_Route_Res_Workflow_Info>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        create:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item",
            req:<{
                name :string,
                description? :string,
            }>{},
            res:<ICommon_Model_Workflow>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        edit:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item",
            req:<{
                workflowId:string
                name :string,
                description? :string,
            }>{},
            res:<ICommon_Model_Workflow>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        delete:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                workflowId:string
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        addNode:{
            method:ECommon_HttpApi_Method.POST,
            path:"/node",
            req:<{
                name :string,
                description? :string,
                status? :ECommon_Model_Workflow_Node_Status,
                workflowId :string,
                x:number,
                y:number
            }>{},
            res:<ICommon_Model_Workflow_Node>{},
            permission:[Permission_Types.Admin.ADMIN]
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
            permission:[Permission_Types.Admin.ADMIN]
        },
        deleteNode:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/node",
            req:<{
                workflowNodeId:string
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        addAction:{
            method:ECommon_HttpApi_Method.POST,
            path:"/action",
            req:<{
                name :string,
                description? :string,
                workflowId :string,
                sourceNodeId:string,
                destNodeId:string,
            }>{},
            res:<ICommon_Model_Workflow_Action>{},
            permission:[Permission_Types.Admin.ADMIN]
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
            permission:[Permission_Types.Admin.ADMIN]
        },
        deleteAction:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/action",
            req:<{
                workflowActionId:string
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/list",
            req:<{
                           
            }>{},
            res:<ICommon_Model_Workflow_Solution[]>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/item",
            req:<{
                workflowSolutionId:string              
            }>{},
            res:<ICommon_Route_Res_WorkflowSolution_Info>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionAssign:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/assign",
            req:<{
                workflowSolutionId:string,
                issueTypeId:string,
                workflowId:string,
                issueTypeSolutionId:string         
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionCreate:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/item",
            req:<{
                 name:string,
                 description?:string        
            }>{},
            res:<ICommon_Model_Workflow_Solution>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionUpdate:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/item",
            req:<{
                workflowSolutionId:string,
                name?:string,
                description?:string         
            }>{},
            res:<ICommon_Model_Workflow_Solution>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionDelete:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/item",
            req:<{
                workflowSolutionId:string      
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionBind:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/bind",
            req:<{
                workflowSolutionId:string,
                issueTypeSolutionId:string         
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionReset:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/unbind",
            req:<{
                workflowSolutionId:string,
                issueTypeSolutionId:string         
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionCopy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/copy",
            req:<{
                workflowSolutionId:string 
            }>{},
            res:<ICommon_Model_Workflow_Solution>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionListWorkflow:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/workflow/list",
            req:<{
                workflowSolutionId:string,
            }>{},
            res:<ICommon_Model_Workflow[]>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionAddWorkflow:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/workflow/item",
            req:<{
                workflowSolutionId:string,
                workflowId:string
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        solutionRemoveWorkflow:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/workflow/item",
            req:<{
                workflowSolutionId:string,
                workflowId:string
            }>{},
            res:{},
            permission:[Permission_Types.Admin.ADMIN]
        },
        getBindWorkflowSolution:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/bind",
            req:<{
                issueTypeSolutionId:string,
            }>{},
            res:<ICommon_Model_Workflow_Solution>{},
            permission:[Permission_Types.Admin.ADMIN]
        },
    }
}
export=api