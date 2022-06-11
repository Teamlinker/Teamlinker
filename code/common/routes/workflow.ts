import { ECommon_Model_Workflow_Node_Status } from '../model/workflow_node';
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
            onlyAdmin:true
        },
        info:{
            method:ECommon_HttpApi_Method.GET,
            path:"/info",
            req:<{
                workflowId:string          
            }>{},
            res:<ICommon_Route_Res_Workflow_Info>{},
            onlyAdmin:true
        },
        create:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item",
            req:<{
                name :string,
                description? :string,
            }>{},
            res:<ICommon_Model_Workflow>{},
            onlyAdmin:true
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
            onlyAdmin:true
        },
        delete:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                workflowId:string
            }>{},
            res:{},
            onlyAdmin:true
        },
        copy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/copy",
            req:<{
                workflowId:string
            }>{},
            res:<ICommon_Model_Workflow>{},
            onlyAdmin:true
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
            onlyAdmin:true
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
            onlyAdmin:true
        },
        deleteNode:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/node",
            req:<{
                workflowNodeId:string
            }>{},
            res:{},
            onlyAdmin:true
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
            onlyAdmin:true
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
            onlyAdmin:true
        },
        deleteAction:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/action",
            req:<{
                workflowActionId:string
            }>{},
            res:{},
            onlyAdmin:true
        },
        solutionList:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/list",
            req:<{
                           
            }>{},
            res:<ICommon_Model_Workflow_Solution[]>{},
            onlyAdmin:true
        },
        solutionInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/item",
            req:<{
                workflowSolutionId:string              
            }>{},
            res:<ICommon_Route_Res_WorkflowSolution_Info>{},
            onlyAdmin:true
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
            onlyAdmin:true
        },
        solutionCreate:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/item",
            req:<{
                 name:string,
                 description?:string        
            }>{},
            res:<ICommon_Model_Workflow_Solution>{},
            onlyAdmin:true
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
            onlyAdmin:true
        },
        solutionDelete:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/item",
            req:<{
                workflowSolutionId:string      
            }>{},
            res:{},
            onlyAdmin:true
        },
        solutionBind:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/bind",
            req:<{
                workflowSolutionId:string,
                issueTypeSolutionId:string         
            }>{},
            res:{},
            onlyAdmin:true
        },
        solutionReset:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/solution/unbind",
            req:<{
                workflowSolutionId:string,
                issueTypeSolutionId:string         
            }>{},
            res:{},
            onlyAdmin:true
        },
        solutionCopy:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/copy",
            req:<{
                workflowSolutionId:string 
            }>{},
            res:<ICommon_Model_Workflow_Solution>{},
            onlyAdmin:true
        },
        solutionListWorkflow:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/workflow/list",
            req:<{
                workflowSolutionId:string,
            }>{},
            res:<ICommon_Model_Workflow[]>{},
            onlyAdmin:true
        },
        solutionAddWorkflow:{
            method:ECommon_HttpApi_Method.POST,
            path:"/solution/workflow/item",
            req:<{
                workflowSolutionId:string,
                workflowId:string
            }>{},
            res:{},
            onlyAdmin:true
        },
        solutionRemoveWorkflow:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/solution/workflow/item",
            req:<{
                workflowSolutionId:string,
                workflowId:string
            }>{},
            res:{},
            onlyAdmin:true
        },
        getBindWorkflowSolution:{
            method:ECommon_HttpApi_Method.GET,
            path:"/solution/bind",
            req:<{
                issueTypeSolutionId:string,
            }>{},
            res:<ICommon_Model_Workflow_Solution>{},
            onlyAdmin:true
        },
    }
}
export default api