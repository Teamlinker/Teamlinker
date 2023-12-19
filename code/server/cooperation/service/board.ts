import {Entity} from "../../common/entity/entity";
import {boardModel} from "../../../common/model/board";
import {
    boardColumnMapper,
    boardColumnWorkflowNodeMapper,
    boardIssueTypeMapper,
    boardMapper,
    boardSprintIssueMapper,
    boardSprintMapper,
    boardSprintSwimLaneMapper
} from "../mapper/board";
import {boardColumnModel} from "../../../common/model/board_column";
import {boardColumnWorkflowNodeModel} from "../../../common/model/board_column_workflow_node";
import {boardIssueTypeModel} from "../../../common/model/board_issue_type";
import {boardSprintModel, ECommon_Model_Board_Sprint_Status} from "../../../common/model/board_sprint";
import {boardSprintIssueModel} from "../../../common/model/board_sprint_issue";
import {boardSprintSwimLaneModel} from "../../../common/model/board_sprint_swimlane";
import {IServer_Common_Event_Types} from "../../common/event/types";
import {workflowMapper} from "../mapper/workflow";
import {ProjectService} from "./project";
import {ProjectIssueService} from "./issue";
import {Err} from "../../../common/status/error";
import {ICommon_Model_Workflow_Action} from "../../../common/model/workflow_action";
import {REDIS_USER} from "../../common/cache/keys/user";
import * as i18next from "i18next";

export class BoardService extends Entity<typeof boardModel,typeof boardMapper> {
    constructor() {
        super(boardMapper)
    }

    static async count(projectId:string) {
        let ret=await boardMapper.count(projectId)
        return ret;
    }

    static async list(projectId:string,page:number,size:number,keyword?:string) {
        let ret=await boardMapper.list(projectId,page,size,keyword)
        return ret;
    }

    static async globalSearch(keyword:string,size:number,organizationUserId:string) {
        let ret=await boardMapper.globalSearch(keyword, size, organizationUserId)
        return ret;
    }

    override async create(userId:string): Promise<typeof boardModel["model"]> {
        let ret=await super.create();
        let objRedis=REDIS_USER.info(userId)
        let value=await objRedis.get()
        let lang=value.lang??"en"
        let t=i18next.getFixedT(lang)
        await Promise.all([t("util.todo"),t("util.inProgress"),t("util.done")].map((name,index)=>{
            let obj=new BoardColumnService()
            obj.assignItem({
                board_id:ret.id,
                name,
                weight:index
            })
            return obj.create()
        }))
        return ret;
    }

    async bindIssueTypes(issueTypeIds:string[]) {
        let arrPromise=[]
        for(let id of issueTypeIds) {
            arrPromise.push((async ()=>{
                let objRelation=await BoardIssueTypeService.getItemByExp({
                    board_id:this.getId(),
                    issue_type_id:id
                })
                if(!objRelation) {
                    let obj=new BoardIssueTypeService()
                    obj.assignItem({
                        issue_type_id:id,
                        board_id:this.getId()
                    })
                    await obj.create()
                }
            })())
        }
        await Promise.all(arrPromise)
    }

    async unBindIssueTypes(issueTypeIds:string[]) {
        let arrPromise=[]
        for(let id of issueTypeIds) {
            arrPromise.push((async ()=>{
                let objRelation=await BoardIssueTypeService.getItemByExp({
                    board_id:this.getId(),
                    issue_type_id:id
                })
                if(objRelation) {
                    await objRelation.delete()
                }
            })())
        }
        await Promise.all(arrPromise)
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        await BoardIssueTypeService.clear(this.getId())
        let arrColumn=await BoardColumnService.getItemsByExp({
            board_id:this.getId()
        })
        for (let obj of arrColumn) {
            await obj.delete()
        }
        let arrSprint=await BoardSprintService.getItemsByExp({
            board_id:this.getId()
        })
        for(let obj of arrSprint) {
            await obj.delete()
        }
    }

    async getMaxColumnWeight() {
        let arr=await BoardColumnService.list(this.getId())
        if(arr.length==0) {
            return null
        } else {
            return arr.at(-1).weight
        }
    }

    async listUnSetWorkflowNode(issueTypeId:string) {
        let nodeList=await workflowMapper.nodeList(issueTypeId)
        let setNodeList=await BoardColumnWorkflowNodeService.listAllWorkflowNode(this.getId(),issueTypeId)
        let unSetNodeList=nodeList.filter(item=>!setNodeList.find(item1=>item.id===item1.id))
        return unSetNodeList
    }

    async listUnBindIssueType() {
        let setIssueTypeList=await BoardIssueTypeService.list(this.getId())
        let ids=setIssueTypeList.map(item=>item.id)
        let objProject=await ProjectService.getItemById(this.getItem().project_id)
        let allIssueTypeList=await objProject.issueTypeList()
        let unSetIssueTypeList=allIssueTypeList.filter(item=>!ids.includes(item.id))
        return unSetIssueTypeList
    }

    static async clearByProjectId(projectId:string) {
        let arr=await BoardService.getItemsByExp({
            project_id:projectId
        })
        await Promise.all(arr.map(item=>{
            return item.delete()
        }))
    }

    static async clearByProjectIds(projectIds:string[]) {
        await boardMapper.clearByProjects(projectIds)
    }
}


export class BoardColumnService extends Entity<typeof boardColumnModel,typeof boardColumnMapper> {
    constructor() {
        super(boardColumnMapper)
    }
    static async list(boardId:string) {
        let ret=await boardColumnMapper.list(boardId)
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        await BoardColumnWorkflowNodeService.clear(this.getId())
        await boardColumnMapper.shrink(this.getItem().board_id,this.getItem().weight)
    }

    async move(weight:number) {
        await boardColumnMapper.move(this.getId(),weight)
        await this.loadItem()
    }
}

export class BoardColumnWorkflowNodeService extends Entity<typeof boardColumnWorkflowNodeModel,typeof boardColumnWorkflowNodeMapper> {
    constructor() {
        super(boardColumnWorkflowNodeMapper)
    }
    static async list(boardColumnId:string) {
        let ret=await boardColumnWorkflowNodeMapper.list(boardColumnId)
        return ret;
    }
    static async clear(boardColumnId:string) {
        await boardColumnWorkflowNodeMapper.clear(boardColumnId)
    }
    static async clearByIssueTypeId(issueTypeId:string) {
        await boardColumnWorkflowNodeMapper.clear(issueTypeId)
    }
    static async listAllWorkflowNode(boardId:string,issuerTypeId:string) {
        let ret=await boardColumnWorkflowNodeMapper.listAllWorkflowNode(boardId,issuerTypeId)
        return ret;
    }
}

export class BoardIssueTypeService extends Entity<typeof boardIssueTypeModel,typeof boardIssueTypeMapper> {
    constructor() {
        super(boardIssueTypeMapper)
    }
    static async list(boardId:string) {
        let ret=await boardIssueTypeMapper.list(boardId)
        return ret;
    }
    static async clear(boardId:string) {
        await boardIssueTypeMapper.clear(boardId)
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        await BoardColumnWorkflowNodeService.clearByIssueTypeId(this.getItem().issue_type_id)
        await BoardSprintIssueService.clearByIssueTypeIds([this.getItem().issue_type_id])
    }
}

export class BoardSprintService extends Entity<typeof boardSprintModel,typeof boardSprintMapper> {
    constructor() {
        super(boardSprintMapper)
    }

    static async boardAndProject(boardSprintId:string) {
        let ret=await boardSprintMapper.boardAndProject(boardSprintId)
        return ret;
    }

    static async globalSearch(keyword:string,size:number,organizationUserId:string) {
        let ret=await boardSprintMapper.globalSearch(keyword, size, organizationUserId)
        return ret;
    }

    static async list(boardId:string,page:number,size:number,keyword?:string,status?:ECommon_Model_Board_Sprint_Status) {
        let ret=await boardSprintMapper.list(boardId,page,size,keyword,status)
        return ret;
    }

    static async filter(organizationId:string,projectId:string,page:number,size:number,keyword?:string,boardSprintIds?:string[]) {
        let ret=await boardSprintMapper.filter(organizationId,projectId,page,size,keyword,boardSprintIds)
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        await BoardSprintIssueService.clear(this.getId())
        await BoardSprintSwimLaneService.clear(this.getId())
    }

    async info() {
        let [arrIssue,arrSwimLane,objBoard]=await Promise.all([
            boardSprintIssueMapper.list(this.getId()),
            boardSprintSwimLaneMapper.list(this.getId()),
            BoardService.getItemById(this.getItem().board_id)
        ])
        let arrApproval=await Promise.all(arrIssue.map(item=>{
            return ProjectIssueService.getItemById(item.id).then(obj=>{
                return obj.getApprovalInfo()
            })
        }))
        let objProject=await ProjectService.getItemById(objBoard.getItem().project_id)
        return {
            ...this.getItem(),
            swimLanes:arrSwimLane,
            issues:arrIssue.map((item,index)=>{
                return {
                    ...item,
                    approval:arrApproval[index]
                }
            }),
            board:objBoard.getItem(),
            project:objProject.getItem()
        }
    }

    async listIssue() {
        let arrIssue=await boardSprintIssueMapper.listWithSwimLane(this.getId())
        let arrApproval=await Promise.all(arrIssue.map(item=>{
            return ProjectIssueService.getItemById(item.id).then(obj=>{
                return obj.getApprovalInfo()
            })
        }))
        return arrIssue.map((item,index)=>{
            return {
                ...item,
                approval:arrApproval[index]
            }
        })
    }

    async listSwimLane() {
        let arrSwimLane=await boardSprintSwimLaneMapper.list(this.getId())
        return arrSwimLane
    }

    async checkIssueAction(projectIssueId:string,boardColumnId:string,organizationUserId:string) {
        let objProjectIssue=await ProjectIssueService.getItemById(projectIssueId)
        if(!objProjectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let actionsInfo=await objProjectIssue.actionsInfo(organizationUserId)
        let actionList:ICommon_Model_Workflow_Action[]=[]
        for(let obj of actionsInfo) {
            if(!("isApproval" in obj)) {
                actionList.push(obj)
            }
        }
        let nodeIdList=actionList.map(item=>item.dest_node_id)
        let columnWorkflowNodeList=await BoardColumnWorkflowNodeService.list(boardColumnId)
        let columnWorkflowNodeIdList=columnWorkflowNodeList.map(item=>item.workflowNode.id)
        let availableNodeIdList=nodeIdList.filter(id=>columnWorkflowNodeIdList.includes(id))
        let availableActionList=actionList.filter(item=>availableNodeIdList.includes(item.dest_node_id))
        if(availableActionList.length==1) {
            let actionId=availableActionList[0].id
            let fields=await objProjectIssue.getNextNodeFields(actionId)
            if(fields.length==0) {
                return {
                    nextActionList:availableActionList,
                    isDirect:true
                }
            }
        }
        return {
            nextActionList:availableActionList,
            isDirect:false
        }
    }
}

export class BoardSprintIssueService extends Entity<typeof boardSprintIssueModel,typeof boardSprintIssueMapper> {
    constructor() {
        super(boardSprintIssueMapper)
    }
    static async clear(boardSprintId:string) {
        await boardSprintIssueMapper.clear(boardSprintId)
    }
    static async clearByIssueTypeIds(issueTypeIds:string[]) {
        await boardSprintIssueMapper.clearByIssueTypeIds(issueTypeIds)
    }
}

export class BoardSprintSwimLaneService extends Entity<typeof boardSprintSwimLaneModel,typeof boardSprintSwimLaneMapper> {
    constructor() {
        super(boardSprintSwimLaneMapper)
    }
    static async clear(boardSprintId:string) {
        await boardSprintSwimLaneMapper.clear(boardSprintId)
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        await boardSprintSwimLaneMapper.clearIssue(this.getId())
    }
}
