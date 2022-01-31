import { ICommon_Model_Field_Solution_Workflow_Node_Field_Type } from "../../../common/model/field_solution_workflow_node_field_type";
import { ICommon_Model_Field_Type } from "../../../common/model/field_type";
import { ICommon_Model_Field_Type_Config_Value } from "../../../common/model/field_type_config_value";
import { workflowModel } from "../../../common/model/workflow";
import { workflowActionModel } from "../../../common/model/workflow_action";
import { ICommon_Model_Workflow_Solution, workflowSolutionModel } from "../../../common/model/workflow_solution";
import { ICommon_Route_Res_Workflow_Info, ICommon_Route_Res_Workflow_Info_Action, ICommon_Route_Res_Workflow_Info_Node } from "../../../common/routes/response";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from "../../common/event/types";
import { ECommon_Model_Workflow_Node_Status, ICommon_Model_Workflow_Node, workflowNodeModel } from './../../../common/model/workflow_node';
import { ICommon_Route_Res_WorkflowSolution_Info } from './../../../common/routes/response';
import { workflowActionMapper, workflowMapper, workflowNodeMapper, workflowSolutionMapper } from './../mapper/workflow';
import { FieldSolutionService } from './field';
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

    async accessNodesAndActions(fieldsCallback:(nodeId:string)=>Promise<{
        field:ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
        fieldType:ICommon_Model_Field_Type,
        values?:ICommon_Model_Field_Type_Config_Value[]
    }[]>=null):Promise<ICommon_Route_Res_Workflow_Info_Node> {
        let nodeList=await workflowMapper.nodeList(this.getId());
        let actionList=await workflowMapper.actionList(this.getId());
        let arrNodeId:string[]=[];
        async function _exec(node:ICommon_Route_Res_Workflow_Info_Node):Promise<ICommon_Route_Res_Workflow_Info_Node> {
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
                    if(fieldsCallback) {
                        objNode.fields=await fieldsCallback(firstNode.id);
                    }
                    arrNodeId.push(firstNode.id)
                    await _exec(objNode)
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
                                if(fieldsCallback) {
                                    objAction.destNode.fields=await fieldsCallback(obj1.id);
                                }
                                if(!arrNodeId.includes(obj1.id)) {
                                    arrNodeId.push(obj1.id)
                                    await _exec(objAction.destNode)
                                }
                            }
                        }
                        node.actions.push(objAction)
                    }
                }
            }
        }
        let ret=await _exec(null)
        return ret;
    }

    async info():Promise<ICommon_Route_Res_Workflow_Info> {
        let obj:ICommon_Route_Res_Workflow_Info={
            ...this.getItem(),
            data: null
        };
        obj.data=await this.accessNodesAndActions()
        return obj;
    }

    override async delete(eventPulish?: EServer_Common_Event_Types.Types): Promise<void> {
        await super.delete()
        await workflowMapper.revoke(this.getId())
        await FieldSolutionService.clearItemsByWorkflowId(this.getId())
    }

    async checkNode(workflowNodeId:string) {
        let ret=await workflowMapper.checkNode(this.getId(),workflowNodeId)
        return ret;
    }

    async checkAction(workflowActionId:string) {
        let ret=await workflowMapper.checkAction(this.getId(),workflowActionId)
        return ret;
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
        for(let issueTypeSolutionId of issueTypeSolutionIds) {
            let arr=await workflowSolutionMapper.getItemsByIssueTypeSolutionId(issueTypeSolutionId)
            if(arr && arr.length>0) {
                throw Err.Project.Workflow.issueTypeSolutionDuplicate
            }
        }
        await workflowSolutionMapper.bindIssueTypeSolutionList(this.getId(),issueTypeSolutionIds)
    }
    async unbindIssueTypeSolutions(issueTypeSolutionIds:string[]=null) {
        await workflowSolutionMapper.unbindIssueTypeSolution(this.getId(),issueTypeSolutionIds)
    }
    async getIssueTypeAndWorkflowList() {
        let arr:ICommon_Route_Res_WorkflowSolution_Info["data"]=[]
        let objIssueTypeSolutionList=await workflowSolutionMapper.getIssueTypeSolutionList(this.getId())
        for(let obj of objIssueTypeSolutionList) {
            arr.push({
                issueTypeSolution:obj,
                data:await workflowSolutionMapper.workflowIssueTypeList(this.getId(),obj.id)
            })
        }
        return arr;
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
        let isIn=await this.checkWorkflow(workflowId)
        if(!isIn) {
            throw Err.Project.Workflow.workflowNotInWorkflowSolution
        }
        await workflowSolutionMapper.assign(this.getId(),workflowId,issueTypeId,issueTypeSolutionId);
    }

    override async create(): Promise<ICommon_Model_Workflow_Solution> {
        let ret=await super.create()
        let obj=await workflowMapper.getReservedItem()
        await workflowSolutionMapper.addWorkflow(this.getId(),obj.id)
        return ret
    }

    override async copy(): Promise<this> {
        let workflowList=await this.listWorkflow()
        let obj=await super.copy()
        for(let o of workflowList) {
            await workflowSolutionMapper.addWorkflow(obj.getId(),o.id);
        }
        return obj;
    }

    async listWorkflow() {
        let ret=await workflowSolutionMapper.listWorkflow(this.getId())
        return ret;
    }

    async checkWorkflow(workflowId:string) {
        let isIn=await workflowSolutionMapper.checkWorkflow(this.getId(),workflowId)
        return isIn
    }

    async addWorkflow(workflowId:string) {
        let isIn=await this.checkWorkflow(workflowId)
        if(isIn) {
            throw Err.Project.Workflow.workflowAlreadyInWorkflowSolution
        }
        await workflowSolutionMapper.addWorkflow(this.getId(),workflowId)
    }

    async removeWorkflow(workflowId:string) {
        await workflowSolutionMapper.removeWorkflow(this.getId(),workflowId)
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

    async checkWorkFlowAndNodeRelation(workflowId:string,workflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let workflowNode=await WorkflowNodeService.getItemById(workflowNodeId)
        if(!workflowNode) {
            return false
        }
        let workflow=await Workflow.getItemById(workflowId)
        if(!workflow) {
            return false
        }
        let isIn=await workflow.checkNode(workflowNodeId)
        if(!isIn) {
            return false
        }
        isIn=await this.checkWorkflow(workflowId)
        if(!isIn) {
            return false
        }
        return true
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