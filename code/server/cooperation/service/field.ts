import {ICommon_Model_Workflow_Node_Field_Type_Config} from "../../../common/model/workflow_node_field_type_config";
import {Err} from "../../../common/status/error";
import {Entity} from "../../common/entity/entity";
import {EServer_Common_Event_Types} from "../../common/event/types";
import {workflowNodeFieldTypeModel} from '../../../common/model/workflow_node_field_type';
import {workflowNodeFieldTypeMapper} from './../mapper/field';
import {ECommon_Field_Type, Field_Types} from "../../../common/field/type";
import {ProjectIssueService} from "./issue";

export  class FieldTypeService {

    static async list(){
        return Object.values(Field_Types);
    }

    static async getItem(key:ECommon_Field_Type) {
        let obj=Field_Types[key]
        if(!obj) {
            throw Err.Project.Field.fieldTypeNotFound
        }
        return obj;
    }
}

export class WorkflowNodeFieldTypeService extends Entity<typeof workflowNodeFieldTypeModel,typeof workflowNodeFieldTypeMapper> {
    constructor(){
        super(workflowNodeFieldTypeMapper)
    }

    override async delete(eventPulish?: EServer_Common_Event_Types.Types): Promise<void> {
        await super.delete()
        await workflowNodeFieldTypeMapper.deleteWorkflowNodeField(this.getId());
        await ProjectIssueService.clearIssueValueByFieldTypeId(this.getId());
    }


    static async addWorkflowNodeField(workflowNodeId:string,fieldTypeId:ECommon_Field_Type,name:string,optional:number,defaultStringValue?:string,defaultNumberValue?:number,description?:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        } else if(fieldTypeId===undefined || fieldTypeId===null) {
            throw Err.Project.Field.fieldTypeNotFound
        }
        let ret=await workflowNodeFieldTypeMapper.addWorkflowNodeField(workflowNodeId,fieldTypeId,name,optional,defaultStringValue,defaultNumberValue,description);
        return ret;
    }

    async editWorkflowNodeFieldLabelType(workflowNodeFieldTypeId:string, labelType:number) {
        let obj=await workflowNodeFieldTypeMapper.getFieldByNodeFieldTypeId(workflowNodeFieldTypeId);
        if(!obj) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let objFieldType=Field_Types[obj.field_type_id]
        if(!objFieldType) {
            throw Err.Project.Field.fieldTypeNotFound
        } else if(objFieldType.type!=ECommon_Field_Type.LABEL && objFieldType.type!=ECommon_Field_Type.MULTILABEL) {
            throw Err.Project.Field.fieldTypeNotMatch
        }
        await workflowNodeFieldTypeMapper.editWorkflowNodeFieldLabelType(obj.id,labelType);
    }

    static async listWorkflowNodeField(workflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let ret=await workflowNodeFieldTypeMapper.getWorkflowNodeFieldList(workflowNodeId);
        return ret;
    }

    async workflowNodeFieldInfo(workflowNodeFieldTypeId:string) {
        if(!workflowNodeFieldTypeId) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let ret=await workflowNodeFieldTypeMapper.workflowNodeFieldInfo(workflowNodeFieldTypeId)
        return ret;
    }

    static async clearItemsByWorkflowNodeId(workflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        await workflowNodeFieldTypeMapper.clearFieldByWorkflowNodeId(workflowNodeId)
    }

    async moveWorkflowNodeField(weight:number) {
        let ret=await workflowNodeFieldTypeMapper.moveWorkflowNodeField(this.getId(),weight)
        return ret;
    }

    async listWorkflowNodeFieldConfig() {
        let ret=await workflowNodeFieldTypeMapper.listWorkflowNodeFieldConfig(this.getId())
        return ret;
    }

    async editWorkflowNodeFieldConfigs( data:{
        value :string,
        selected :number
    }[]) {
        if(data.length==0) {
            return []
        }
        let obj=await workflowNodeFieldTypeMapper.getFieldByNodeFieldTypeId(this.getId())
        if(!obj) {
            throw Err.Project.Field.fieldSolutionWorkflowNodeFieldTypeNotFound
        }
        let objFieldType=Field_Types[obj.field_type_id]
        if(!objFieldType) {
            throw Err.Project.Field.fieldTypeNotFound
        } else if(objFieldType.type!=ECommon_Field_Type.SELECT && objFieldType.type!=ECommon_Field_Type.MULTISELECT) {
            throw Err.Project.Field.fieldTypeNotMatch
        }
        await workflowNodeFieldTypeMapper.deleteConfigByFieldId(this.getId())
        let arr:ICommon_Model_Workflow_Node_Field_Type_Config[]=new Array(data.length);
        let i=0,arrPromise=[]
        for(let i=0;i<data.length;i++) {
            let obj=data[i];
            arrPromise.push((async ()=>{
                let ret=await workflowNodeFieldTypeMapper.addWorkflowNodeFieldConfig(this.getId(),obj.value,obj.selected,i)
                arr[i]=ret;
            })())
        }
        await Promise.all(arrPromise);
        return arr;
    }

    static async workflowFieldsCopy(workflowNodeId:string,newWorkflowNodeId:string) {
        await workflowNodeFieldTypeMapper.clearFieldByWorkflowNodeId(newWorkflowNodeId)
        await workflowNodeFieldTypeMapper.workflowFieldsCopy(workflowNodeId,newWorkflowNodeId)
    }

    static async getFieldTypesByFieldIds(fieldIds:string[]) {
        if(!Array.isArray(fieldIds) || fieldIds.length==0) {
            return [];
        }
        let arr=await workflowNodeFieldTypeMapper.getFieldTypesByFieldIds(fieldIds)
        return arr;
    }

    static async clearFieldByWorkflowNodeId(workflowNodeId:string) {
        await workflowNodeFieldTypeMapper.clearFieldByWorkflowNodeId(workflowNodeId);
    }

    static async setWorkflowNodeFieldsWeight(workflowNodeFieldTypeIds:string) {
        await workflowNodeFieldTypeMapper.setWorkflowNodeFieldsWeight(workflowNodeFieldTypeIds)
    }
}