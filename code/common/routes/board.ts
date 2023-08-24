import {Permission_Types} from "../permission/permission";
import {ECommon_Services} from "../types";
import {ECommon_HttpApi_Method} from "./types";
import {ICommon_Model_Board} from "../model/board";
import {ICommon_Model_Board_Column} from "../model/board_column";
import {ICommon_Model_Board_Column_Workflow_Node} from "../model/board_column_workflow_node";
import {ICommon_Model_Board_Sprint} from "../model/board_sprint";
import {
    ICommon_Route_Res_Board_Column_Workflow_Node_Item,
    ICommon_Route_Res_Board_List,
    ICommon_Route_Res_Board_Sprint_Info,
    ICommon_Route_Res_Board_Sprint_List
} from "./response";
import {ECommon_Model_Project_Issue_Priority} from "../model/project_issue";
import {ICommon_Model_Board_Sprint_SwimLane} from "../model/board_sprint_swimlane";
import {ICommon_Model_Board_Sprint_Issue} from "../model/board_sprint_issue";
import {ICommon_Model_Issue_Type} from "../model/issue_type";
import {ICommon_Model_Workflow_Node} from "../model/workflow_node";

const api= {
    baseUrl: "/board",
    service: ECommon_Services.Cooperation,
    routes: {
        listBoard:{
            method:ECommon_HttpApi_Method.GET,
            path:"/list",
            req:<{
                projectId :string,
                page:number,
                size:number,
                keyword?:string
            }>{},
            res:<ICommon_Route_Res_Board_List>{},
            permission:[Permission_Types.Project.READ]
        },
        createBoard:{
            method:ECommon_HttpApi_Method.POST,
            path:"/item",
            req:<{
                projectId :string,
                name:string,
                description?:string,
                issueTypeIds?:string[]
            }>{},
            res:<ICommon_Model_Board>{},
            permission:[Permission_Types.Project.EDIT]
        },
        editBoard:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/item",
            req:<{
                boardId :string,
                name?:string,
                description?:string,
            }>{},
            res:<ICommon_Model_Board>{},
            permission:[Permission_Types.Project.EDIT]
        },
        deleteBoard:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/item",
            req:<{
                boardId :string,
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        bindIssueType:{
            method:ECommon_HttpApi_Method.POST,
            path:"/issuetype/bind",
            req:<{
                boardId :string,
                issueTypeId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        unbindIssueType:{
            method:ECommon_HttpApi_Method.POST,
            path:"/issuetype/unbind",
            req:<{
                boardId :string,
                issueTypeId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        listIssueType:{
            method:ECommon_HttpApi_Method.GET,
            path:"/issuetype/list",
            req:<{
                boardId :string
            }>{},
            res:<ICommon_Model_Issue_Type[]>{},
            permission:[Permission_Types.Project.READ]
        },
        listColumn:{
            method:ECommon_HttpApi_Method.GET,
            path:"/column/list",
            req:<{
                boardId :string
            }>{},
            res:<ICommon_Model_Board_Column[]>{},
            permission:[Permission_Types.Project.READ]
        },
        addColumn:{
            method:ECommon_HttpApi_Method.POST,
            path:"/column",
            req:<{
                boardId :string,
                name:string
            }>{},
            res:<ICommon_Model_Board_Column>{},
            permission:[Permission_Types.Project.EDIT]
        },
        editColumn:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/column",
            req:<{
                boardColumnId :string,
                name:string
            }>{},
            res:<ICommon_Model_Board_Column>{},
            permission:[Permission_Types.Project.EDIT]
        },
        deleteColumn:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/column",
            req:<{
                boardColumnId :string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        moveColumn:{
            method:ECommon_HttpApi_Method.POST,
            path:"/column/move",
            req:<{
                boardColumnId :string,
                weight:number
            }>{},
            res:<ICommon_Model_Board_Column>{},
            permission:[Permission_Types.Project.EDIT]
        },
        listWorkflowNode:{
            method:ECommon_HttpApi_Method.GET,
            path:"/workflownode/list",
            req:<{
                boardColumnId :string
            }>{},
            res:<ICommon_Route_Res_Board_Column_Workflow_Node_Item[]>{},
            permission:[Permission_Types.Project.READ]
        },
        bindWorkflowNode:{
            method:ECommon_HttpApi_Method.POST,
            path:"/workflownode/bind",
            req:<{
                boardColumnId :string,
                workflowNodeId:string
            }>{},
            res:<ICommon_Model_Board_Column_Workflow_Node>{},
            permission:[Permission_Types.Project.EDIT]
        },
        unbindWorkflowNode:{
            method:ECommon_HttpApi_Method.POST,
            path:"/workflownode/unbind",
            req:<{
                boardColumnId :string,
                workflowNodeId:string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        listSprint:{
            method:ECommon_HttpApi_Method.GET,
            path:"/sprint/list",
            req:<{
                boardId :string,
                page:number,
                size:number,
                keyword?:string
            }>{},
            res:<ICommon_Route_Res_Board_Sprint_List>{},
            permission:[Permission_Types.Project.READ]
        },
        createSprint:{
            method:ECommon_HttpApi_Method.POST,
            path:"/sprint",
            req:<{
                boardId :string,
                name:string,
                startTime:number,
                endTime:number
            }>{},
            res:<ICommon_Model_Board_Sprint>{},
            permission:[Permission_Types.Project.EDIT]
        },
        editSprint:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/sprint",
            req:<{
                boardSprintId :string,
                name?:string,
                startTime?:number,
                endTime?:number
            }>{},
            res:<ICommon_Model_Board_Sprint>{},
            permission:[Permission_Types.Project.EDIT]
        },
        deleteSprint:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/sprint",
            req:<{
                boardSprintId :string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        sprintInfo:{
            method:ECommon_HttpApi_Method.GET,
            path:"/sprint/info",
            req:<{
                boardSprintId :string
            }>{},
            res:<ICommon_Route_Res_Board_Sprint_Info>{},
            permission:[Permission_Types.Project.READ]
        },
        createSwimLane:{
            method:ECommon_HttpApi_Method.POST,
            path:"/swimlane",
            req:<{
                boardSprintId :string,
                name:string,
                priority:ECommon_Model_Project_Issue_Priority
            }>{},
            res:<ICommon_Model_Board_Sprint_SwimLane>{},
            permission:[Permission_Types.Project.EDIT]
        },
        editSwimLane:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/swimlane",
            req:<{
                boardSprintSwimLaneId :string,
                name?:string,
                priority?:ECommon_Model_Project_Issue_Priority
            }>{},
            res:<ICommon_Model_Board_Sprint_SwimLane>{},
            permission:[Permission_Types.Project.EDIT]
        },
        deleteSwimLane:{
            method:ECommon_HttpApi_Method.DELETE,
            path:"/swimlane",
            req:<{
                boardSprintSwimLaneId :string
            }>{},
            res:{},
            permission:[Permission_Types.Project.EDIT]
        },
        putProjectIssue:{
            method:ECommon_HttpApi_Method.PUT,
            path:"/issue",
            req:<{
                projectIssueId:string,
                boardSprintId?:string,
                boardSprintSwimLaneId? :string
            }>{},
            res:<ICommon_Model_Board_Sprint_Issue>{},
            permission:[Permission_Types.Project.EDIT]
        },
        listUnSetWorkflowNode:{
            method:ECommon_HttpApi_Method.GET,
            path:"/issuetype/unset",
            req:<{
                boardId:string,
                issueTypeId:string
            }>{},
            res:<ICommon_Model_Workflow_Node[]>{},
            permission:[Permission_Types.Project.READ]
        }
    }
}
export default api