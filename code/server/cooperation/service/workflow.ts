import {ICommon_Model_Workflow_Node_Field_Type} from "../../../common/model/workflow_node_field_type";
import {ICommon_Model_Workflow_Node_Field_Type_Config} from "../../../common/model/workflow_node_field_type_config";
import {workflowActionModel} from "../../../common/model/workflow_action";
import {
    ICommon_Route_Res_Workflow_Info,
    ICommon_Route_Res_Workflow_Info_Action,
    ICommon_Route_Res_Workflow_Info_Node,
    ICommon_Route_Res_Workflow_Node_List_Item
} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {Entity} from "../../common/entity/entity";
import {
    ECommon_Model_Workflow_Node_Status,
    ICommon_Model_Workflow_Node,
    workflowNodeModel
} from './../../../common/model/workflow_node';
import {workflowActionMapper, workflowMapper, workflowNodeMapper} from './../mapper/workflow';
import {WorkflowNodeFieldTypeService} from './field';
import {ICommon_Field_Type} from "../../../common/field/type";
import {IssueTypeSolutionService} from "./issueType";
import {IServer_Common_Event_Types} from "../../common/event/types";

export class WorkflowService  {

    static async accessNodesAndActions(issueTypeId:string,fieldsCallback:(nodeId:string)=>Promise<{
        field:ICommon_Model_Workflow_Node_Field_Type,
        fieldType:ICommon_Field_Type,
        values?:ICommon_Model_Workflow_Node_Field_Type_Config[]
    }[]>=null):Promise<ICommon_Route_Res_Workflow_Info_Node> {
        let nodeList=await workflowMapper.nodeList(issueTypeId);
        let actionList=await workflowMapper.actionList(issueTypeId);
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

    static async info(issueTypeId:string):Promise<ICommon_Route_Res_Workflow_Info> {
        let obj:ICommon_Route_Res_Workflow_Info={
            nodes:[],
            actions:[]
        };
        let [nodes,actions]=await Promise.all([workflowMapper.nodeList(issueTypeId),workflowMapper.actionList(issueTypeId)])
        obj.nodes=nodes;
        obj.actions=actions;
        return obj;
    }

    static async copy(issueTypeId:string,newIssueTypeId:string) {
        let {workflowNodes,newWorkflowNodes}=await workflowMapper.copyItem(issueTypeId,newIssueTypeId);
        let arr=[];
        for(let i=0;i<workflowNodes.length;i++) {
            arr.push(WorkflowNodeFieldTypeService.workflowFieldsCopy(workflowNodes[i],newWorkflowNodes[i]));
        }
        await Promise.all(arr);
    }

    static async checkNode(issueTypeId:string,workflowNodeId:string) {
        let ret=await workflowMapper.checkNode(issueTypeId,workflowNodeId)
        return ret;
    }

    static async checkAction(issueTypeId:string,workflowActionId:string) {
        let ret=await workflowMapper.checkAction(issueTypeId,workflowActionId)
        return ret;
    }

    static async getFirstNode(issueTypeId:string){
        let ret=await workflowNodeMapper.getOpenNode(issueTypeId)
        return ret;
    }

    static async init(issueTypeId:string) {
        let workflowId=await workflowMapper.init(issueTypeId);
        return workflowId;
    }

    static async delete(issueTypeId:string) {
        let objInfo=await this.info(issueTypeId);
        let arr=[];
        for(let obj of objInfo.actions) {
            let o=await WorkflowActionService.getItemById(obj.id);
            arr.push(o.delete())
        }
        for(let obj of objInfo.nodes) {
            let o=await WorkflowNodeService.getItemById(obj.id);
            arr.push(o.delete())
        }
        await Promise.all(arr);
    }
}



export class WorkflowNodeService extends Entity<typeof workflowNodeModel,typeof workflowNodeMapper> {
    constructor() {
        super(workflowNodeMapper)
    }
    override async create(): Promise<ICommon_Model_Workflow_Node> {
        if(this.getItem().status==ECommon_Model_Workflow_Node_Status.NOTSTART || this.getItem().status===undefined) {
            let obj=await workflowNodeMapper.getOpenNode(this.getItem().issue_type_id)
            if(obj) {
                throw Err.Project.Workflow.workflowOpenNodeDuplicate
            }
        }
        let ret=await super.create()
        return ret;
    }

    override async update(): Promise<ICommon_Model_Workflow_Node> {
        if(this.getItem().status==ECommon_Model_Workflow_Node_Status.NOTSTART) {
            let obj=await workflowNodeMapper.getOpenNode(this.getItem().issue_type_id)
            if(obj && obj.id!=this.getId()) {
                throw Err.Project.Workflow.workflowOpenNodeDuplicate
            }
        }
        let ret=await super.update()
        return ret;
    }

    override async delete(eventPulish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete()
        await WorkflowNodeFieldTypeService.clearItemsByWorkflowNodeId(this.getId())
    }

    async getActionList() {
        let ret=await workflowNodeMapper.getActionList(this.getId())
        return ret;
    }

    static async listAllNode(organizationId:string) {
        let arr=await IssueTypeSolutionService.list(organizationId)
        let ret:ICommon_Route_Res_Workflow_Node_List_Item[]=[]
        let arrPromise=[]
        for (let obj of arr) {
            let o={
                name:obj.name,
                id:obj.id,
                data:[]
            }
            ret.push(o);
            for(let obj1 of obj.issueTypeList) {
                let o1={
                    name:obj1.name,
                    id:obj1.id,
                    data:[]
                }
                o.data.push(o1)
                arrPromise.push(workflowMapper.nodeList(o1.id).then(list=>{
                    o1.data=list.map(item=>{
                        return {
                            id:item.id,
                            name:item.name
                        }
                    })
                }))
            }
        }
        await Promise.all(arrPromise);
        return ret;
    }
}

export class WorkflowActionService extends Entity<typeof workflowActionModel,typeof workflowActionMapper> {
    constructor() {
        super(workflowActionMapper)
    }
}