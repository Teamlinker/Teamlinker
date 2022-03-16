import { fieldSolutionModel } from "../../../common/model/field_solution";
import { ICommon_Model_Field_Type_Config_Value } from "../../../common/model/field_type_config_value";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from "../../common/event/types";
import { ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type } from './../../../common/model/field_solution_workflow_node_field_type';
import { ECommon_Model_Field_Type, fieldTypeModel } from './../../../common/model/field_type';
import { ICommon_Route_Res_FieldSolution_Info } from './../../../common/routes/response';
import { fieldSolutionMapper, fieldTypeMapper } from './../mapper/field';
import { WorkflowSolutionService } from './workflow';

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
            workflowSolutionList:await fieldSolutionMapper.getBindWorkflowSolutionList(this.getId()),
            ...this.getItem()
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

    static async getObjByWorkflowSolutionId(workflowSolutionId:string) {
        let objWorkflowSolution=await WorkflowSolutionService.getItemById(workflowSolutionId)
        if(!objWorkflowSolution) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let ret=await fieldSolutionMapper.getItemByWorkflowSolutionId(workflowSolutionId)
        if(ret) {
            let fieldSolution=new FieldSolutionService()
            fieldSolution.setItem(ret)
            return fieldSolution
        } else {
            return null;
        }
        
    }

    async addWorkflowNodeField(workflowNodeId:string,workflowId:string,workflowSolutionId:string,fieldTypeId:string,name:string,optional:number,defaultValue?:string,description?:string,weight?:number) {
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
        let ret=await fieldSolutionMapper.addWorkflowNodeField(this.getId(),workflowNodeId,workflowId,workflowSolutionId,fieldTypeId,name,optional,defaultValue,description,weight);
        return ret;
    }

    async editWorkflowNodeFieldLableType(fieldSolutionWorkflowNodeFieldTypeId:string,labelType:number) {
        let obj=await fieldSolutionMapper.getFieldByNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId);
        if(!obj) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let objFieldType=await FieldType.getItemById(obj.field_type_id)
        if(!objFieldType) {
            throw Err.Project.Field.fieldTypeNotFound
        } else if(objFieldType.getItem().type!=ECommon_Model_Field_Type.LABEL && objFieldType.getItem().type!=ECommon_Model_Field_Type.MULTILABEL) {
            throw Err.Project.Field.fieldTypeNotMatch
        }
        await fieldSolutionMapper.editWorkflowNodeFieldLableType(obj.id,labelType);
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

    async workflowNodeFieldInfo(fieldSolutionWorkflowNodeFieldTypeId:string) {
        if(!fieldSolutionWorkflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let ret=await fieldSolutionMapper.workflowNodeFieldInfo(fieldSolutionWorkflowNodeFieldTypeId)
        return ret;
    }

    async getIfCopyedWorkflowList(workflowId:string,workflowSolutionId:string) {
        let ret=await WorkflowSolutionService.getItemListByWorkflowId(workflowId)
        let workflowSolutionIds=ret.map(item=>item.id)
        let arr=await fieldSolutionMapper.getFieldSolutionWorkflowSolutionListByWorkflowSolutionIds(workflowSolutionIds)
        return arr.filter(obj=>{
            if(obj.workflowSolution.id==workflowSolutionId && obj.fieldSolution.id==this.getId()) {
                return false
            } else {
                return true
            }
        })
    }

    static async clearItemsByWorkflowId(workflowId:string) {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        await fieldSolutionMapper.clearItemsByWorkflowId(workflowId)
    }

    static async clearItemsByWorkflowSolutionId(workflowSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        await fieldSolutionMapper.clearItemsByWorkflowSolutionId(workflowSolutionId)
    }

    static async clearItemsByWorkflowIdAndWorkflowSolutionId(workflowId:string,workflowSolutionId:string) {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        await fieldSolutionMapper.clearItemsByWorkflowIdAndWorkflowSolutionId(workflowId,workflowSolutionId)
    }

    static async clearItemsByWorkflowNodeId(workflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        await fieldSolutionMapper.clearItemsByWorkflowNodeId(workflowNodeId)
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

    async editWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId:string,name?:string,optional?:number,defaultValue?:string,description?:string,labelType?:ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type,weight?:number) {
        let ret=await fieldSolutionMapper.editWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId,name,optional,defaultValue,description,labelType,weight)
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

    async addWorkflowNodeFieldConfigs(fieldSolutionWorkflowNodeFieldTypeId :string,data:{
        value :string,
        name :string,
        selected :number
    }[]) {
        if(data.length==0) {
            return []
        }
        let isSelected = false
        for(let o of data) {
            if(o.selected) {
                if(!isSelected) {
                    isSelected=true
                } else {
                    throw Err.Project.Field.fieldConfigValueAlreadySelected
                }
            }
        }
        let obj=await fieldSolutionMapper.getFieldByNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let objFieldType=await FieldType.getItemById(obj.field_type_id)
        if(!objFieldType) {
            throw Err.Project.Field.fieldTypeNotFound
        } else if(objFieldType.getItem().type!=ECommon_Model_Field_Type.SELECT && objFieldType.getItem().type!=ECommon_Model_Field_Type.MULTISELECT) {
            throw Err.Project.Field.fieldTypeNotMatch
        }
        if (isSelected && objFieldType.getItem().type==ECommon_Model_Field_Type.SELECT) {
            let isExist = await fieldSolutionMapper.checkFieldConfigValueSelectedExist(fieldSolutionWorkflowNodeFieldTypeId)
            if(isExist) {
                throw Err.Project.Field.fieldConfigValueAlreadySelected
            }
        }
        let arr:ICommon_Model_Field_Type_Config_Value[]=[];
        for(let obj of data) {
            let ret=await fieldSolutionMapper.addWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId,obj.value,obj.name,obj.selected)
            arr.push(ret)
        }
        return arr;
    }

    async editWorkflowNodeFieldConfig(fieldTypeConfigValueId :string,value? :string,name? :string,selected? :number) {
        let obj=await fieldSolutionMapper.getFieldByFieldTypeConfigId(fieldTypeConfigValueId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let objFieldType=await FieldType.getItemById(obj.field_type_id)
        if(!objFieldType) {
            throw Err.Project.Field.fieldTypeNotFound
        } else if(objFieldType.getItem().type!=ECommon_Model_Field_Type.SELECT && objFieldType.getItem().type!=ECommon_Model_Field_Type.MULTISELECT) {
            throw Err.Project.Field.fieldTypeNotMatch
        }
        if(selected && objFieldType.getItem().type==ECommon_Model_Field_Type.SELECT) {
            let isExist = await fieldSolutionMapper.checkFieldConfigValueSelectedExist(obj.id)
            if(isExist) {
                throw Err.Project.Field.fieldConfigValueAlreadySelected
            }
        }
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

    static async getFieldTypesByFieldIds(fieldIds:string[]) {
        if(!Array.isArray(fieldIds) || fieldIds.length==0) {
            return [];
        }
        let arr=await fieldSolutionMapper.getFieldTypesByFieldIds(fieldIds)
        return arr;
    }
}