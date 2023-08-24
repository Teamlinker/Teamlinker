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
import {boardSprintModel} from "../../../common/model/board_sprint";
import {boardSprintIssueModel} from "../../../common/model/board_sprint_issue";
import {boardSprintSwimLaneModel} from "../../../common/model/board_sprint_swimlane";
import {IServer_Common_Event_Types} from "../../common/event/types";
import {workflowMapper} from "../mapper/workflow";

export class BoardService extends Entity<typeof boardModel,typeof boardMapper> {
    constructor() {
        super(boardMapper)
    }

    static async list(projectId:string,page:number,size:number,keyword?:string) {
        let ret=await boardMapper.list(projectId,page,size,keyword)
        return ret;
    }

    override async create(...param): Promise<typeof boardModel["model"]> {
        let ret=await super.create(...param);
        await Promise.all(["To Do","In Progress","Done"].map((name,index)=>{
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
    static async list(boardId:string,page:number,size:number,keyword?:string) {
        let ret=await boardSprintMapper.list(boardId,page,size,keyword)
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        await BoardSprintIssueService.clear(this.getId())
        await BoardSprintSwimLaneService.clear(this.getId())
    }

    async info() {
        let [arrIssue,arrSwimLane]=await Promise.all([
            boardSprintIssueMapper.list(this.getId()),
            boardSprintSwimLaneMapper.list(this.getId())
        ])
        return {
            ...this.getItem(),
            swimLanes:arrSwimLane,
            issues:arrIssue
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
        await boardSprintSwimLaneMapper.clear(this.getItem().board_sprint_id,this.getId())
    }
}
