import { workflowModel } from "../../../common/model/workflow";
import { workflowActionModel } from "../../../common/model/workflow_action";
import { workflowSolutionModel } from "../../../common/model/workflow_solution";
import { ICommon_Route_Res_Workflow_Info, ICommon_Route_Res_Workflow_Info_Action, ICommon_Route_Res_Workflow_Info_Node } from "../../../common/routes/response";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from "../../common/event/types";
import { ECommon_Model_Workflow_Node_Status, ICommon_Model_Workflow_Node, workflowNodeModel } from './../../../common/model/workflow_node';
import { ICommon_Route_Res_WorkflowSolution_Info } from './../../../common/routes/response';
import { workflowActionMapper, workflowMapper, workflowNodeMapper, workflowSolutionMapper } from './../mapper/workflow';
export default class Workflow extends Entity<typeof workflowModel,typeof workflowMapper> {
    constructor(){
        super(workflowMapper)
    }
    static async list(){
        let ret=await workflowMapper.list()
        return ret;
    }
    static async getReservedItem () {
        let ret=await workflowMapper.getReservedItem()
        let workflow=new Workflow
        workflow.setItem(ret);
        return workflow;
    }
    async info():Promise<ICommon_Route_Res_Workflow_Info> {
        let nodeList=await workflowMapper.nodeList(this.getId());
        let actionList=await workflowMapper.actionList(this.getId());
        let obj:ICommon_Route_Res_Workflow_Info={
            ...this.getItem(),
            data: null
        };
        let arrNodeId:string[]=[];
        function _accessNodesAndActions(node:ICommon_Route_Res_Workflow_Info_Node):ICommon_Route_Res_Workflow_Info_Node {
            if(node==null) {
                let firstNode:ICommon_Model_Workflow_Node;
                for(let obj of nodeList) {
                    if(obj.status==ECommon_Model_Workflow_Node_Status.NOTSTART) {
                        firstNode=obj;
                        break
                    }
                }
                if(firstNode) {
                    let objNode:ICommon_Route_Res_Workflow_Info_Node={
                        node:firstNode,
                        actions:[]
                    }
                    arrNodeId.push(firstNode.id)
                    _accessNodesAndActions(objNode)
                    return objNode;
                }
            } else {
                if(!node.actions) {
                    node.actions=[]
                }
                for(let obj of actionList) {
                    if(obj.source_node_id==node.node.id) {
                        let objAction:ICommon_Route_Res_Workflow_Info_Action={
                            action:obj,
                            destNode:null
                        }
                        for(let obj1 of nodeList) {
                            if(obj1.id==obj.dest_node_id) {
                                objAction.destNode={
                                    node:obj1,
                                    actions:[]
                                }
                                if(!arrNodeId.includes(obj1.id)) {
                                    arrNodeId.push(obj1.id)
                                    _accessNodesAndActions(objAction.destNode)
                                }
                            }
                        }
                        node.actions.push(objAction)
                    }
                }
            }
        }
        obj.data=_accessNodesAndActions(null)
        return obj;
    }

    override async delete(eventPulish?: EServer_Common_Event_Types.Types): Promise<void> {
        await super.delete()
        await workflowMapper.revoke(this.getId())
    }
}

export class WorkflowSolutionService extends Entity<typeof workflowSolutionModel,typeof workflowSolutionMapper> {
    constructor(){
        super(workflowSolutionMapper)
    }
    static async list(){
        let ret=await workflowSolutionMapper.list()
        return ret;
    }
    static async getItemByIssueSolutionId(issueSolutionId:string) {
        let obj=await workflowSolutionMapper.getItemByIssueSolutionId(issueSolutionId)
        let objService=new WorkflowSolutionService()
        objService.setItem(obj)
        return objService;
    }
    static async getReservedItem () {
        let ret=await workflowSolutionMapper.getReservedItem()
        let obj=new WorkflowSolutionService()
        obj.setItem(ret)
        return obj;
    }
    async bindIssueTypeSolutions(issueTypeSolutionIds:string[]) {
        await workflowSolutionMapper.bindIssueTypeSolutionList(this.getId(),issueTypeSolutionIds)
    }
    async unbindIssueTypeSolutions(issueTypeSolutionIds:string[]=null) {
        await workflowSolutionMapper.unbindIssueTypeSolution(this.getId(),issueTypeSolutionIds)
    }
    async info():Promise<ICommon_Route_Res_WorkflowSolution_Info> {
        let info:ICommon_Route_Res_WorkflowSolution_Info={
            ...this.getItem(),
            data:[]
        }
        let objIssueTypeSolutionList=await workflowSolutionMapper.getIssueTypeSolutionList(this.getId())
        for(let obj of objIssueTypeSolutionList) {
            info.data.push({
                issueTypeSolution:obj,
                data:await workflowSolutionMapper.workflowIssueTypeList(this.getId(),obj.id)
            })
        }
        return info;
    }
    async assign(issueTypeId:string,workflowId:string,issueTypeSolutionId:string) {
        let workflow=await Workflow.getItemById(workflowId)
        if(!workflow) {
            throw Err.Project.Workflow.workflowNotFound
        }
        await workflowSolutionMapper.assign(this.getId(),workflowId,issueTypeId,issueTypeSolutionId);
    }

    override async copy(): Promise<this> {
        let obj=await super.copy()
        return obj;
    }

    override async delete() {
        await super.delete();
        await workflowSolutionMapper.deleteItemsByWorkflowSolutionId(this.getId());
        await workflowSolutionMapper.unbindIssueTypeSolution(this.getId())
    }

    async deleteIssueType(issueTypeId:string,issueTypeSolutionId:string) {
        await workflowSolutionMapper.deleteIssueType(this.getId(),issueTypeId,issueTypeSolutionId)
    }
    static async clearIssueType(issueTypeId:string) {
        await workflowSolutionMapper.clearIssueType(issueTypeId);
    }
}

export class WorkflowNodeService extends Entity<typeof workflowNodeModel,typeof workflowNodeMapper> {
    constructor() {
        super(workflowNodeMapper)
    }
    override async create(): Promise<ICommon_Model_Workflow_Node> {
        if(this.getItem().status==ECommon_Model_Workflow_Node_Status.NOTSTART) {
            let obj=await workflowNodeMapper.getOpenNode(this.getItem().workflow_id)
            if(obj) {
                throw Err.Project.Workflow.workflowOpenNodeDuplicate
            }
        }
        let ret=await super.create()
        return ret;
    }

    override async update(): Promise<ICommon_Model_Workflow_Node> {
        if(this.getItem().status==ECommon_Model_Workflow_Node_Status.NOTSTART) {
            let obj=await workflowNodeMapper.getOpenNode(this.getItem().workflow_id)
            if(obj && obj.id!=this.getId()) {
                throw Err.Project.Workflow.workflowOpenNodeDuplicate
            }
        }
        let ret=await super.update()
        return ret;
    }
}

export class WorkflowActionService extends Entity<typeof workflowActionModel,typeof workflowActionMapper> {
    constructor() {
        super(workflowActionMapper)
    }
}