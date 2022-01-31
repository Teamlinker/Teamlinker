import { fieldSolutionModel } from "../../../common/model/field_solution";
import { ICommon_Model_Field_Solution_Workflow_Node_Field_Type } from "../../../common/model/field_solution_workflow_node_field_type";
import { ICommon_Model_Field_Type_Config_Value } from "../../../common/model/field_type_config_value";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from "../../common/event/types";
import { ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type } from './../../../common/model/field_solution_workflow_node_field_type';
import { fieldTypeModel, ICommon_Model_Field_Type } from './../../../common/model/field_type';
import { ICommon_Route_Res_FieldSolution_Info } from './../../../common/routes/response';
import { fieldSolutionMapper, fieldTypeMapper } from './../mapper/field';
import WorkflowService, { WorkflowSolutionService } from './workflow';

export default class FieldType extends Entity<typeof fieldTypeModel,typeof fieldTypeMapper> {
    constructor(){
        super(fieldTypeMapper)
    }
    static async list(){
        let ret=await fieldTypeMapper.list()
        return ret;
    }

}

export class FieldSolutionService extends Entity<typeof fieldSolutionModel,typeof fieldSolutionMapper> {
    constructor(){
        super(fieldSolutionMapper)
    }
    static async list(){
        let ret=await fieldSolutionMapper.list()
        return ret;
    }

    async info() :Promise<ICommon_Route_Res_FieldSolution_Info>{
        let ret:ICommon_Route_Res_FieldSolution_Info={
            data:[],
            ...this.getItem()
        }
        let workflowSolutionList=await fieldSolutionMapper.getBindWorkflowSolutionList(this.getId())
        for(let objWorkflowSolution of workflowSolutionList) {
            let workflowSolution=await WorkflowSolutionService.getItemById(objWorkflowSolution.id)
            let workflowList=await workflowSolution.listWorkflow()
            let arr:ICommon_Route_Res_FieldSolution_Info["data"][0]["data"]=[]
            for (let obj of workflowList) {
                let workflowService = await WorkflowService.getItemById(obj.id)
                let node = await workflowService.accessNodesAndActions(async (nodeId: string): Promise<{
                    field: ICommon_Model_Field_Solution_Workflow_Node_Field_Type,
                    fieldType: ICommon_Model_Field_Type,
                    values?: ICommon_Model_Field_Type_Config_Value[]
                }[]> => {
                    let ret = await fieldSolutionMapper.getWorkflowNodeFieldList(this.getId(), nodeId, obj.id, workflowSolution.getId())
                    return ret;
                })
                let objTemp: ICommon_Route_Res_FieldSolution_Info["data"][0]["data"][0] = {
                    workflow: obj,
                    node: node
                }
                arr.push(objTemp)
            }
            let obj:ICommon_Route_Res_FieldSolution_Info["data"][0]={
                workflowSolution:objWorkflowSolution,
                data:arr
            }
            ret.data.push(obj)
        }
        return ret;
    }

    override async delete(eventPulish?: EServer_Common_Event_Types.Types): Promise<void> {
        await super.delete()
        await fieldSolutionMapper.clearFieldSolution(this.getId())
    }

    async bindWorkflowSolution(workflowSolutionId:string){
        let objWorkflowSolution=await WorkflowSolutionService.getItemById(workflowSolutionId)
        if(!objWorkflowSolution) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let isIn=await this.checkWorkflowSolution(workflowSolutionId) 
        if(isIn) {
            throw Err.Project.Field.workflowSolutionAlreadyBind
            
        }
        await fieldSolutionMapper.bindWorkflowSolution(this.getId(),workflowSolutionId);
    }

    async unbindWorkflowSolution(workflowSolutionId:string) {
        let objWorkflowSolution=await WorkflowSolutionService.getItemById(workflowSolutionId)
        if(!objWorkflowSolution) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        await fieldSolutionMapper.unbindWorkflowSolution(this.getId(),workflowSolutionId);
    }

    async addWorkflowNodeField(workflowNodeId:string,workflowId:string,workflowSolutionId:string,fieldTypeId:string,name:string,optional:number,defaultValue?:string,description?:string,labelType?:ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!fieldTypeId) {
            throw Err.Project.Field.fieldTypeNotFound
        }
        let isBind=await fieldSolutionMapper.checkWorkflowSolution(this.getId(),workflowSolutionId)
        if(!isBind) {
            throw Err.Project.Field.workflowSolutionNotBind
        }
        let workflowSolution=await WorkflowSolutionService.getItemById(workflowSolutionId)
        if(!workflowSolution) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let isIn=await workflowSolution.checkWorkFlowAndNodeRelation(workflowId,workflowNodeId)
        if(!isIn) {
            throw Err.Project.Workflow.workflowNotInWorkflowSolution
        }
        let ret=await fieldSolutionMapper.addWorkflowNodeField(this.getId(),workflowNodeId,workflowId,workflowSolutionId,fieldTypeId,name,optional,defaultValue,description,labelType);
        return ret;
    }

    async listWorkflowNodeField(workflowNodeId:string,workflowId:string,workflowSolutionId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let workflowSolution=await WorkflowSolutionService.getItemById(workflowSolutionId)
        if(!workflowSolution) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let isIn=await workflowSolution.checkWorkFlowAndNodeRelation(workflowId,workflowNodeId)
        if(!isIn) {
            throw Err.Project.Workflow.workflowNotInWorkflowSolution
        }
        let ret=await fieldSolutionMapper.getWorkflowNodeFieldList(this.getId(),workflowNodeId,workflowId,workflowSolutionId);
        return ret;
    }

    static async clearItemsByWorkflowId(workflowId:string) {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        await fieldSolutionMapper.clearItemsByWorkflowId(workflowId)
    }

    static async getObjByFieldSolutionWorkflowNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId:string) {
        let ret=new FieldSolutionService
        let obj=await fieldSolutionMapper.getSolutionByFieldSolutionWorkflowNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId)
        if(obj) {
            ret.setItem(obj)
            return ret;
        }
        return null
    }

    static async getObjByFieldTypeConfigValueId(fieldTypeConfigValueId:string) {
        let ret=new FieldSolutionService
        let obj=await fieldSolutionMapper.getSolutionByFieldTypeConfigTypeId(fieldTypeConfigValueId)
        if(obj) {
            ret.setItem(obj)
            return ret;
        }
        return null
    }

    async editWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId:string,name?:string,optional?:number,defaultValue?:string,description?:string,labelType?:ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type) {
        let ret=await fieldSolutionMapper.editWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId,name,optional,defaultValue,description,labelType)
        return ret;
    }

    async deleteWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId:string) {
        await fieldSolutionMapper.deleteWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId);
    }

    async moveWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId:string,sort:number) {
        let ret=await fieldSolutionMapper.moveWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId,sort)
        return ret;
    }

    async listWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId:string) {
        let ret=await fieldSolutionMapper.listWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId)
        return ret;
    }

    async addWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId :string,value :string,name :string,selected :number) {
        let obj=await fieldSolutionMapper.getFieldByNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let objFieldType=await FieldType.getItemById(obj.field_type_id)
        if(!objFieldType) {
            throw Err.Project.Field.fieldTypeNotFound
        } else if(!objFieldType.getItem().multi) {
            throw Err.Project.Field.fieldTypeNotMatch
        }
        let ret=await fieldSolutionMapper.addWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId,value,name,selected)
        return ret;
    }

    async editWorkflowNodeFieldConfig(fieldTypeConfigValueId :string,value? :string,name? :string,selected? :number) {
        let ret=await fieldSolutionMapper.editWorkflowNodeFieldConfig(fieldTypeConfigValueId,value,name,selected)
        return ret;
    }

    async deleteWorkflowNodeFieldConfig(fieldTypeConfigValueId :string)  {
        await fieldSolutionMapper.deleteWorkflowNodeFieldConfig(fieldTypeConfigValueId)
    }

    async checkWorkflowSolution(workflowSolutionId:string) {
        let ret=await fieldSolutionMapper.checkWorkflowSolution(this.getId(),workflowSolutionId)
        return ret;
    }

    async workflowFieldsCopy(workflowSolutionId:string,workflowId:string,newFieldSolutionId:string,newWorkflowSolutionId:string) {
        let workflowSolution=await WorkflowSolutionService.getItemById(workflowSolutionId)
        if(!workflowSolution) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let isIn=await workflowSolution.checkWorkflow(workflowId)
        if(!isIn) {
            throw Err.Project.Workflow.workflowNotInWorkflowSolution
        }
        isIn=await this.checkWorkflowSolution(workflowSolutionId)
        if(!isIn) {
            throw Err.Project.Field.workflowSolutionNotBind
        }
        let newFieldSolution=await FieldSolutionService.getItemById(newFieldSolutionId)
        if(!newFieldSolution) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let newWorkflowSolution=await WorkflowSolutionService.getItemById(newWorkflowSolutionId)
        if(!newWorkflowSolution) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        isIn=await newWorkflowSolution.checkWorkflow(workflowId)
        if(!isIn) {
            throw Err.Project.Workflow.workflowNotInWorkflowSolution
        }
        isIn=await newFieldSolution.checkWorkflowSolution(newWorkflowSolutionId)
        if(!isIn) {
            throw Err.Project.Field.workflowSolutionNotBind
        }
        await fieldSolutionMapper.workflowFieldsCopy(this.getId(),workflowSolutionId,workflowId,newFieldSolutionId,newWorkflowSolutionId)
    }
}