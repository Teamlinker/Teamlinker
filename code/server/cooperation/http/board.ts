import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import boardApi from "../../../common/routes/board";
import {ECommon_Model_Project_Issue_Priority} from "../../../common/model/project_issue";
import {
    BoardColumnService,
    BoardColumnWorkflowNodeService,
    BoardIssueTypeService,
    BoardService,
    BoardSprintIssueService,
    BoardSprintService,
    BoardSprintSwimLaneService
} from "../service/board";
import {Err} from "../../../common/status/error";
import {WorkflowNodeService} from "../service/workflow";
import {ProjectIssueHistoryService, ProjectIssueService} from "../service/issue";
import {IssueTypeService} from "../service/issueType";
import {IUserSession} from "../../user/types/config";
import rpcNotificationApi from "../../notification/rpc/notification";
import {ECommon_Model_Notification_Type} from "../../../common/model/notification";
import {ECommon_Model_Project_Issue_History_Type} from "../../../common/model/project_issue_history";
import {ECommon_Model_Board_Sprint_Status} from "../../../common/model/board_sprint";

@DComponent
@DHttpController(boardApi)
class BoardController {
    @DHttpApi(boardApi.routes.listBoard)
    async listBoard(@DHttpReqParamRequired("projectId") projectId: string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("keyword") keyword:string): Promise<typeof boardApi.routes.listBoard.res> {
        let ret=await BoardService.list(projectId,page,size,keyword)
        return ret;
    }

    @DHttpApi(boardApi.routes.board)
    async board(@DHttpReqParamRequired("boardId") boardId: string): Promise<typeof boardApi.routes.board.res> {
        let obj=await BoardService.getItemById(boardId)
        if(!obj) {
            throw Err.Project.Board.boardNotFound
        }
        return obj.getItem()

    }

    @DHttpApi(boardApi.routes.createBoard)
    async createBoard(@DHttpReqParamRequired("projectId") projectId: string,@DHttpReqParamRequired("name") name: string,@DHttpReqParam("description") description: string,@DHttpReqParam("issueTypeIds") issueTypeIds: string[],@DHttpUser user:IUserSession): Promise<typeof boardApi.routes.createBoard.res> {
        let obj=new BoardService()
        obj.assignItem({
            name,
            project_id:projectId,
            description
        })
        let objBoard=await obj.create(user.userId)
        if(issueTypeIds?.length>0) {
            await obj.bindIssueTypes(issueTypeIds)
        }
        return objBoard
    }

    @DHttpApi(boardApi.routes.editBoard)
    async editBoard(@DHttpReqParamRequired("boardId") boardId: string,@DHttpReqParam("name") name: string,@DHttpReqParam("description") description: string): Promise<typeof boardApi.routes.editBoard.res> {
        let obj=await BoardService.getItemById(boardId)
        if(!obj) {
            throw Err.Project.Board.boardNotFound
        }
        obj.assignItem({
            name,
            description
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(boardApi.routes.deleteBoard)
    async deleteBoard(@DHttpReqParamRequired("boardId") boardId: string): Promise<typeof boardApi.routes.deleteBoard.res> {
        let obj=await BoardService.getItemById(boardId)
        if(!obj) {
            throw Err.Project.Board.boardNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(boardApi.routes.bindIssueType)
    async bindIssueType(@DHttpReqParamRequired("boardId") boardId: string,@DHttpReqParamRequired("issueTypeId") issueTypeId: string): Promise<typeof boardApi.routes.bindIssueType.res> {
        let obj=await BoardService.getItemById(boardId)
        if(!obj) {
            throw Err.Project.Board.boardNotFound
        }
        await obj.bindIssueTypes([issueTypeId])
        return
    }

    @DHttpApi(boardApi.routes.unbindIssueType)
    async unbindIssueType(@DHttpReqParamRequired("boardId") boardId: string,@DHttpReqParamRequired("issueTypeId") issueTypeId: string): Promise<typeof boardApi.routes.unbindIssueType.res> {
        let obj=await BoardService.getItemById(boardId)
        if(!obj) {
            throw Err.Project.Board.boardNotFound
        }
        await obj.unBindIssueTypes([issueTypeId])
        return
    }

    @DHttpApi(boardApi.routes.listIssueType)
    async listIssueType(@DHttpReqParamRequired("boardId") boardId: string): Promise<typeof boardApi.routes.listIssueType.res> {
        let ret=await BoardIssueTypeService.list(boardId)
        return ret;
    }

    @DHttpApi(boardApi.routes.listUnBindIssueType)
    async listUnBindIssueType(@DHttpReqParamRequired("boardId") boardId: string): Promise<typeof boardApi.routes.listUnBindIssueType.res> {
        let obj=await BoardService.getItemById(boardId)
        if(!obj) {
            throw Err.Project.Board.boardNotFound
        }
        let ret=await obj.listUnBindIssueType()
        return ret;
    }

    @DHttpApi(boardApi.routes.listColumn)
    async listColumn(@DHttpReqParamRequired("boardId") boardId: string): Promise<typeof boardApi.routes.listColumn.res> {
        let ret=await BoardColumnService.list(boardId)
        return ret;
    }

    @DHttpApi(boardApi.routes.addColumn)
    async addColumn(@DHttpReqParamRequired("boardId") boardId: string,@DHttpReqParamRequired("name") name: string): Promise<typeof boardApi.routes.addColumn.res> {
        let obj=await BoardService.getItemById(boardId)
        if(!obj) {
            throw Err.Project.Board.boardNotFound
        }
        let value=await obj.getMaxColumnWeight()
        if(value===null) {
            value=0
        }
        let objColumn=new BoardColumnService()
        objColumn.assignItem({
            name,
            board_id:boardId,
            weight:value
        })
        let ret=await objColumn.create()
        return ret;
    }

    @DHttpApi(boardApi.routes.editColumn)
    async editColumn(@DHttpReqParamRequired("boardColumnId") boardColumnId: string,@DHttpReqParamRequired("name") name: string): Promise<typeof boardApi.routes.editColumn.res> {
        let obj=await BoardColumnService.getItemById(boardColumnId)
        if(!obj) {
            throw Err.Project.Board.boardColumnNotFound
        }
        obj.assignItem({
            name
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(boardApi.routes.deleteColumn)
    async deleteColumn(@DHttpReqParamRequired("boardColumnId") boardColumnId: string): Promise<typeof boardApi.routes.deleteColumn.res> {
        let obj=await BoardColumnService.getItemById(boardColumnId)
        if(!obj) {
            throw Err.Project.Board.boardColumnNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(boardApi.routes.moveColumn)
    async moveColumn(@DHttpReqParamRequired("boardColumnId") boardColumnId: string,@DHttpReqParamRequired("weight") weight: number): Promise<typeof boardApi.routes.moveColumn.res> {
        let obj=await BoardColumnService.getItemById(boardColumnId)
        if(!obj) {
            throw Err.Project.Board.boardColumnNotFound
        }
        await obj.move(weight)
        return obj.getItem()
    }

    @DHttpApi(boardApi.routes.listWorkflowNode)
    async listWorkflowNode(@DHttpReqParamRequired("boardColumnId") boardColumnId: string): Promise<typeof boardApi.routes.listWorkflowNode.res> {
        let ret=await BoardColumnWorkflowNodeService.list(boardColumnId)
        return ret;
    }

    @DHttpApi(boardApi.routes.bindWorkflowNode)
    async bindWorkflowNode(@DHttpReqParamRequired("boardColumnId") boardColumnId: string,@DHttpReqParamRequired("workflowNodeId") workflowNodeId: string): Promise<typeof boardApi.routes.bindWorkflowNode.res> {
        let [objBoardColumn,objWorkflowNode]=await Promise.all([
            BoardColumnService.getItemById(boardColumnId),
            WorkflowNodeService.getItemById(workflowNodeId)
        ])
        if(!objBoardColumn) {
            throw Err.Project.Board.boardColumnNotFound
        } else if(!objWorkflowNode) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let arrIssueType=await BoardIssueTypeService.list(objBoardColumn.getItem().board_id)
        let ids=arrIssueType.map(item=>item.id)
        if(!ids.includes(objWorkflowNode.getItem().issue_type_id)) {
            throw Err.Project.Board.boardNotIncludeIssueType
        }
        let obj=await BoardColumnWorkflowNodeService.getItemByExp({
            workflow_node_id:workflowNodeId,
            board_id:objBoardColumn.getItem().board_id
        })
        if(obj) {
            obj.assignItem({
                board_column_id:boardColumnId
            })
            let ret=await obj.update()
            return ret;
        } else {
            obj=new BoardColumnWorkflowNodeService()
            obj.assignItem({
                issue_type_id:objWorkflowNode.getItem().issue_type_id,
                workflow_node_id:workflowNodeId,
                board_column_id:boardColumnId,
                board_id:objBoardColumn.getItem().board_id
            })
            let ret=await obj.create()
            return ret;
        }
    }

    @DHttpApi(boardApi.routes.unbindWorkflowNode)
    async unbindWorkflowNode(@DHttpReqParamRequired("boardColumnId") boardColumnId: string,@DHttpReqParamRequired("workflowNodeId") workflowNodeId: string): Promise<typeof boardApi.routes.unbindWorkflowNode.res> {
        let obj=await BoardColumnWorkflowNodeService.getItemByExp({
            board_column_id:boardColumnId,
            workflow_node_id:workflowNodeId
        })
        await obj?.delete()
        return
    }

    @DHttpApi(boardApi.routes.listSprint)
    async listSprint(@DHttpReqParamRequired("boardId") boardId: string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("keyword") keyword:string,@DHttpReqParam("status") status:ECommon_Model_Board_Sprint_Status): Promise<typeof boardApi.routes.listSprint.res> {
        let ret=await BoardSprintService.list(boardId,page,size,keyword,status)
        return ret;
    }

    @DHttpApi(boardApi.routes.createSprint)
    async createSprint(@DHttpReqParamRequired("boardId") boardId: string,@DHttpReqParamRequired("name") name: string,@DHttpReqParamRequired("startTime") startTime: string,@DHttpReqParamRequired("endTime") endTime: string): Promise<typeof boardApi.routes.createSprint.res> {
        let objSprint=new BoardSprintService
        objSprint.assignItem({
            name,
            board_id:boardId,
            start_time:startTime,
            end_time:endTime
        })
        let ret=await objSprint.create()
        return ret;
    }

    @DHttpApi(boardApi.routes.editSprint)
    async editSprint(@DHttpReqParamRequired("boardSprintId") boardSprintId: string,@DHttpReqParam("name") name: string,@DHttpReqParam("startTime") startTime: string,@DHttpReqParam("endTime") endTime: string): Promise<typeof boardApi.routes.editSprint.res> {
        let objSprint=await BoardSprintService.getItemById(boardSprintId)
        if(!objSprint) {
            throw Err.Project.Board.boardSprintNotFound
        }
        objSprint.assignItem({
            name,
            start_time:startTime,
            end_time:endTime
        })
        let ret=await objSprint.update()
        return ret;
    }

    @DHttpApi(boardApi.routes.deleteSprint)
    async deleteSprint(@DHttpReqParamRequired("boardSprintId") boardSprintId: string): Promise<typeof boardApi.routes.deleteSprint.res> {
        let objSprint=await BoardSprintService.getItemById(boardSprintId)
        if(!objSprint) {
            throw Err.Project.Board.boardSprintNotFound
        }
        await objSprint.delete()
        return
    }

    @DHttpApi(boardApi.routes.sprintInfo)
    async sprintInfo(@DHttpReqParamRequired("boardSprintId") boardSprintId: string): Promise<typeof boardApi.routes.sprintInfo.res> {
        let objSprint=await BoardSprintService.getItemById(boardSprintId)
        if(!objSprint) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let ret=await objSprint.info()
        return ret;
    }

    @DHttpApi(boardApi.routes.listSwimLane)
    async listSwimLane(@DHttpReqParamRequired("boardSprintId") boardSprintId: string): Promise<typeof boardApi.routes.listSwimLane.res> {
        let objSprint=await BoardSprintService.getItemById(boardSprintId)
        if(!objSprint) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let ret=await objSprint.listSwimLane()
        return ret;
    }

    @DHttpApi(boardApi.routes.createSwimLane)
    async createSwimLane(@DHttpReqParamRequired("boardSprintId") boardSprintId: string,@DHttpReqParamRequired("name") name: string,@DHttpReqParamRequired("priority") priority: ECommon_Model_Project_Issue_Priority): Promise<typeof boardApi.routes.createSwimLane.res> {
        let objSprint=await BoardSprintService.getItemById(boardSprintId)
        if(!objSprint) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let obj=new BoardSprintSwimLaneService()
        obj.assignItem({
            name,
            board_id:objSprint.getItem().board_id,
            priority,
            board_sprint_id:boardSprintId
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(boardApi.routes.editSwimLane)
    async editSwimLane(@DHttpReqParamRequired("boardSprintSwimLaneId") boardSprintSwimLaneId: string,@DHttpReqParam("name") name: string,@DHttpReqParam("priority") priority: ECommon_Model_Project_Issue_Priority): Promise<typeof boardApi.routes.editSwimLane.res> {
        let obj=await BoardSprintSwimLaneService.getItemById(boardSprintSwimLaneId)
        if(!obj) {
            throw Err.Project.Board.boardSprintSwimLaneNotFound
        }
        obj.assignItem({
            name,
            priority
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(boardApi.routes.deleteSwimLane)
    async deleteSwimLane(@DHttpReqParamRequired("boardSprintSwimLaneId") boardSprintSwimLaneId: string): Promise<typeof boardApi.routes.deleteSwimLane.res> {
        let obj=await BoardSprintSwimLaneService.getItemById(boardSprintSwimLaneId)
        if(!obj) {
            throw Err.Project.Board.boardSprintSwimLaneNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(boardApi.routes.addProjectIssue)
    async addProjectIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,@DHttpReqParamRequired("boardSprintId") boardSprintId: string,@DHttpReqParam("boardSprintSwimLaneId") boardSprintSwimLaneId: string,@DHttpUser user:IUserSession): Promise<typeof boardApi.routes.addProjectIssue.res> {
        let [objProjectIssue,objBoardSprint,objBoardSprintSwimLane]=await Promise.all([
            ProjectIssueService.getItemById(projectIssueId),
            BoardSprintService.getItemById(boardSprintId),
            boardSprintSwimLaneId?BoardSprintSwimLaneService.getItemById(boardSprintSwimLaneId):null
        ])
        if(!objProjectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if(!objBoardSprint) {
            throw Err.Project.Board.boardSprintNotFound
        } else if(boardSprintSwimLaneId && !objBoardSprintSwimLane) {
            throw Err.Project.Board.boardSprintSwimLaneNotFound
        }
        let arrIssueType=await BoardIssueTypeService.list(objBoardSprint.getItem().board_id)
        let ids=arrIssueType.map(item=>item.id)
        if(!ids.includes(objProjectIssue.getItem().issue_type_id)) {
            throw Err.Project.Board.boardNotIncludeIssueType
        }
        let obj=await BoardSprintIssueService.getItemByExp({
            project_issue_id:projectIssueId,
        })
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGN_SPRINT,projectIssueId,null,user.organizationInfo.organizationUserId)
        let objHistory=new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id:objProjectIssue.getId(),
            type:ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id:user.organizationInfo.organizationUserId,
            project_id:objProjectIssue.getItem().project_id,
            name:"Sprint",
            value:objBoardSprint.getItem().name
        })
        objHistory.create()
        if(obj) {
            obj.assignItem({
                board_sprint_swimlane_id:boardSprintSwimLaneId??null,
                board_sprint_id:boardSprintId,
                board_id:objBoardSprint.getItem().board_id
            })
            let ret=await obj.update()
            return ret;
        } else {
            obj=new BoardSprintIssueService
            obj.assignItem({
                project_issue_id:projectIssueId,
                board_id:objBoardSprint.getItem().board_id,
                board_sprint_id:boardSprintId,
                board_sprint_swimlane_id:boardSprintSwimLaneId??null
            })
            let ret=await obj.create()
            return ret;
        }
    }

    @DHttpApi(boardApi.routes.removeProjectIssue)
    async removeProjectIssue(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,@DHttpUser user:IUserSession): Promise<typeof boardApi.routes.removeProjectIssue.res> {
        let objProjectIssue=await ProjectIssueService.getItemById(projectIssueId)
        if(!objProjectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let obj=await BoardSprintIssueService.getItemByExp({
            project_issue_id:projectIssueId,
        })
        await obj?.delete()
        let objHistory=new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id:objProjectIssue.getId(),
            type:ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id:user.organizationInfo.organizationUserId,
            project_id:objProjectIssue.getItem().project_id,
            name:"Sprint",
        })
        objHistory.create()
        return
    }

    @DHttpApi(boardApi.routes.addSprintIssues)
    async addSprintIssue(@DHttpReqParamRequired("boardSprintId") boardSprintId: string,@DHttpReqParamRequired("projectIssueIds") projectIssueIds: string[],@DHttpUser user:IUserSession): Promise<typeof boardApi.routes.addSprintIssues.res> {
        let [objBoardSprint,...objProjectIssueList]=await Promise.all([
            BoardSprintService.getItemById(boardSprintId),
            ...projectIssueIds.map(id=>{
                return ProjectIssueService.getItemById(id)
            })
        ])
        if(!objBoardSprint) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let arrIssueType=await BoardIssueTypeService.list(objBoardSprint.getItem().board_id)
        let ids=arrIssueType.map(item=>item.id)
        let arrPromise=[]
        for(let objProjectIssue of objProjectIssueList) {
            if(objProjectIssue===null) {
                continue
            } else if(!ids.includes(objProjectIssue.getItem().issue_type_id)) {
                continue
            } else {
                let obj=await BoardSprintIssueService.getItemByExp({
                    project_issue_id:objProjectIssue.getId(),
                    board_id:objBoardSprint.getItem().board_id
                })
                if(!obj) {
                    obj=new BoardSprintIssueService
                    obj.assignItem({
                        project_issue_id:objProjectIssue.getId(),
                        board_id:objBoardSprint.getItem().board_id,
                        board_sprint_id:boardSprintId,
                    })
                    arrPromise.push(obj.create())
                } else if(obj.getItem().board_sprint_id!==objBoardSprint.getId()) {
                    obj.assignItem({
                        board_sprint_id:objBoardSprint.getId(),
                        board_sprint_swimlane_id:null
                    })
                    arrPromise.push(obj.update())
                }
                let objHistory=new ProjectIssueHistoryService()
                objHistory.assignItem({
                    project_issue_id:objProjectIssue.getId(),
                    type:ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
                    organization_user_id:user.organizationInfo.organizationUserId,
                    project_id:objProjectIssue.getItem().project_id,
                    name:"Sprint",
                    value:objBoardSprint.getItem().name
                })
                objHistory.create()
            }
        }
        await Promise.all(arrPromise)
        projectIssueIds.forEach(issueId=>{
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ISSUE_ASSIGN_SPRINT,issueId,null,user.organizationInfo.organizationUserId)
        })
        return
    }

    @DHttpApi(boardApi.routes.listUnSetWorkflowNode)
    async listUnSetWorkflowNode(@DHttpReqParamRequired("boardId") boardId: string,@DHttpReqParamRequired("issueTypeId") issueTypeId: string): Promise<typeof boardApi.routes.listUnSetWorkflowNode.res> {
        let [objBoard,objIssueType]=await Promise.all([
            BoardService.getItemById(boardId),
            IssueTypeService.getItemById(issueTypeId)
        ])
        if(!objBoard) {
            throw Err.Project.Board.boardNotFound
        } else if(!objIssueType) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let arr=await objBoard.listUnSetWorkflowNode(issueTypeId)
        return arr;
    }

    @DHttpApi(boardApi.routes.listSprintIssue)
    async listSprintIssue(@DHttpReqParamRequired("boardSprintId") boardSprintId: string): Promise<typeof boardApi.routes.listSprintIssue.res> {
        let obj=await BoardSprintService.getItemById(boardSprintId)
        if(!obj) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let ret=await obj.listIssue()
        return ret;
    }

    @DHttpApi(boardApi.routes.checkIssueAction)
    async checkIssueAction(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,@DHttpReqParamRequired("boardSprintId") boardSprintId: string,@DHttpReqParamRequired("boardColumnId") boardColumnId: string,@DHttpUser user:IUserSession): Promise<typeof boardApi.routes.checkIssueAction.res> {
        let obj=await BoardSprintService.getItemById(boardSprintId)
        if(!obj) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let ret=await obj.checkIssueAction(projectIssueId,boardColumnId,user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(boardApi.routes.filterSprint)
    async filterSprint(@DHttpReqParam("projectId") projectId: string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpReqParam("keyword") keyword:string,@DHttpReqParam("boardSprintIds") boardSprintIds:string[],@DHttpUser user:IUserSession): Promise<typeof boardApi.routes.filterSprint.res> {
        let ret=await BoardSprintService.filter(user.organizationInfo.organizationId,projectId,page,size,keyword,boardSprintIds)
        return ret;
    }

    @DHttpApi(boardApi.routes.getIssueSprint)
    async getIssueSprint(@DHttpReqParamRequired("projectIssueId") projectIssueId: string): Promise<typeof boardApi.routes.getIssueSprint.res> {
        let obj=await BoardSprintIssueService.getItemByExp({
            project_issue_id:projectIssueId
        })
        if(!obj) {
            return null
        }
        let objSprint=await BoardSprintService.getItemById(obj.getItem().board_sprint_id)
        if(!objSprint) {
            throw Err.Project.Board.boardSprintNotFound
        }
        return objSprint.getItem()
    }

    @DHttpApi(boardApi.routes.startSprint)
    async startSprint(@DHttpReqParamRequired("boardSprintId") boardSprintId: string): Promise<typeof boardApi.routes.startSprint.res> {
        let obj=await BoardSprintService.getItemById(boardSprintId)
        if(!obj) {
            throw Err.Project.Board.boardSprintNotFound
        }
        obj.assignItem({
            status:ECommon_Model_Board_Sprint_Status.STARTING
        })
        let ret=await obj.update()
        return ret
    }

    @DHttpApi(boardApi.routes.completeSprint)
    async completeSprint(@DHttpReqParamRequired("boardSprintId") boardSprintId: string): Promise<typeof boardApi.routes.completeSprint.res> {
        let obj=await BoardSprintService.getItemById(boardSprintId)
        if(!obj) {
            throw Err.Project.Board.boardSprintNotFound
        }
        obj.assignItem({
            status:ECommon_Model_Board_Sprint_Status.COMPLETED
        })
        let ret=await obj.update()
        return ret
    }

    @DHttpApi(boardApi.routes.globalSearchBoard)
    async globalSearchBoard(@DHttpReqParamRequired("keyword") keyword: string,@DHttpReqParamRequired("size") size: number,@DHttpUser user:IUserSession): Promise<typeof boardApi.routes.globalSearchBoard.res> {
        let ret=await BoardService.globalSearch(keyword,size,user.organizationInfo.organizationUserId)
        return ret
    }

    @DHttpApi(boardApi.routes.globalSearchSprint)
    async globalSearchSprint(@DHttpReqParamRequired("keyword") keyword: string,@DHttpReqParamRequired("size") size: number,@DHttpUser user:IUserSession): Promise<typeof boardApi.routes.globalSearchSprint.res> {
        let ret=await BoardSprintService.globalSearch(keyword,size,user.organizationInfo.organizationUserId)
        return ret
    }

    @DHttpApi(boardApi.routes.count)
    async count(@DHttpReqParamRequired("projectId") projectId: string): Promise<typeof boardApi.routes.count.res> {
        let count=await BoardService.count(projectId)
        return {
            count
        }
    }

}