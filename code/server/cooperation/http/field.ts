import fieldApi from "../../../common/routes/field";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired} from "../../common/http/http";
import {FieldTypeService} from "../service/field";
import {WorkflowNodeFieldTypeService} from './../service/field';
import {ECommon_Field_Type, Field_Types} from "../../../common/field/type";
import {ECommon_Model_Workflow_Node_Field_Type_Label_Type} from "../../../common/model/workflow_node_field_type";

@DComponent
@DHttpController(fieldApi)
class FieldController {
    @DHttpApi(fieldApi.routes.typeList)
    async typeList(): Promise<typeof fieldApi.routes.typeList.res> {
        let ret = await FieldTypeService.list()
        return ret;
    }

    @DHttpApi(fieldApi.routes.typeInfo)
    async typeInfo(@DHttpReqParamRequired("fieldTypeId") fieldTypeId:ECommon_Field_Type): Promise<typeof fieldApi.routes.typeInfo.res> {
        let ret = await FieldTypeService.getItem(fieldTypeId)
        return ret
    }

    @DHttpApi(fieldApi.routes.listWorkflowNodeField)
    async listWorkflowNodeField(@DHttpReqParamRequired("workflowNodeId") workflowNodeId:string): Promise<typeof fieldApi.routes.listWorkflowNodeField.res> {
        let ret=await WorkflowNodeFieldTypeService.listWorkflowNodeField(workflowNodeId)
        return ret;
    }

    @DHttpApi(fieldApi.routes.workflowNodeFieldInfo)
    async workflowNodeFieldInfo(@DHttpReqParamRequired("workflowNodeFieldTypeId") workflowNodeFieldTypeId:string): Promise<typeof fieldApi.routes.workflowNodeFieldInfo.res> {
        let obj=await WorkflowNodeFieldTypeService.getItemById(workflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.workflowNodeFieldInfo(workflowNodeFieldTypeId)
        return ret;
    }

    @DHttpApi(fieldApi.routes.addWorkflowNodeField)
    async addWorkflowNodeField(@DHttpReqParamRequired("workflowNodeId") workflowNodeId:string,
    @DHttpReqParamRequired("fieldTypeId") fieldTypeId:ECommon_Field_Type,
    @DHttpReqParamRequired("optional") optional:number,
    @DHttpReqParam("defaultStringValue") defaultStringValue:string,
    @DHttpReqParam("defaultNumberValue") defaultNumberValue:number,
    @DHttpReqParamRequired("name") name:string,
    @DHttpReqParam("description") description:string): Promise<typeof fieldApi.routes.addWorkflowNodeField.res> {
        let ret=await WorkflowNodeFieldTypeService.addWorkflowNodeField(workflowNodeId,fieldTypeId,name,optional,defaultStringValue,defaultNumberValue,description)
        return ret;
    }

    @DHttpApi(fieldApi.routes.editWorkflowNodeFieldLabelType)
    async editWorkflowNodeFieldLabelType(@DHttpReqParamRequired("workflowNodeFieldTypeId") workflowNodeFieldTypeId:string,
    @DHttpReqParamRequired("labelType") labelType:number): Promise<typeof fieldApi.routes.editWorkflowNodeFieldLabelType.res> {
        let obj=await WorkflowNodeFieldTypeService.getItemById(workflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        await obj.editWorkflowNodeFieldLabelType(workflowNodeFieldTypeId,labelType)
        return;
    }

    @DHttpApi(fieldApi.routes.editWorkflowNodeField)
    async editWorkflowNodeField(@DHttpReqParamRequired("workflowNodeFieldTypeId") workflowNodeFieldTypeId:string,
    @DHttpReqParam("optional") optional:number,
    @DHttpReqParam("defaultStringValue") defaultStringValue:string,
    @DHttpReqParam("defaultNumberValue") defaultNumberValue:number,
    @DHttpReqParam("name") name:string,
    @DHttpReqParam("description") description:string,
    @DHttpReqParam("labelType") labelType:ECommon_Model_Workflow_Node_Field_Type_Label_Type): Promise<typeof fieldApi.routes.editWorkflowNodeField.res> {
        let obj=await WorkflowNodeFieldTypeService.getItemById(workflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        if(labelType!==null && labelType!==undefined) {
            let objFieldType=Field_Types[obj.getItem().field_type_id]
            if(objFieldType.type!=ECommon_Field_Type.LABEL && objFieldType.type!=ECommon_Field_Type.MULTILABEL) {
                throw Err.Project.Field.fieldTypeNotMatch
            }
        }
        obj.assignItem({
            name,
            optional,
            default_string_value:defaultStringValue,
            default_number_value:defaultNumberValue,
            description,
            label_type:labelType
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(fieldApi.routes.moveWorkflowNodeField)
    async moveWorkflowNodeField(@DHttpReqParamRequired("workflowNodeFieldTypeId") workflowNodeFieldTypeId:string,@DHttpReqParamRequired("weight") weight:number): Promise<typeof fieldApi.routes.moveWorkflowNodeField.res> {
        let obj=await WorkflowNodeFieldTypeService.getItemById(workflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.moveWorkflowNodeField(weight)
        return ret;
    }

    @DHttpApi(fieldApi.routes.deleteWorkflowNodeField)
    async deleteWorkflowNodeField(@DHttpReqParamRequired("workflowNodeFieldTypeId") workflowNodeFieldTypeId:string): Promise<typeof fieldApi.routes.deleteWorkflowNodeField.res> {
        let obj=await WorkflowNodeFieldTypeService.getItemById(workflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(fieldApi.routes.listWorkflowNodeFieldConfig)
    async listWorkflowNodeFieldConfig(@DHttpReqParamRequired("workflowNodeFieldTypeId") workflowNodeFieldTypeId:string): Promise<typeof fieldApi.routes.listWorkflowNodeFieldConfig.res> {
        let obj=await WorkflowNodeFieldTypeService.getItemById(workflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.listWorkflowNodeFieldConfig()
        return ret;
    }

    @DHttpApi(fieldApi.routes.editWorkflowNodeFieldConfig)
    async editWorkflowNodeFieldConfig(@DHttpReqParamRequired("workflowNodeFieldTypeId") workflowNodeFieldTypeId:string,
    @DHttpReqParamRequired("data") data:{
        id?:string,
        value :string,
        selected :number
    }[]): Promise<typeof fieldApi.routes.editWorkflowNodeFieldConfig.res> {
        let obj=await WorkflowNodeFieldTypeService.getItemById(workflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.editWorkflowNodeFieldConfigs(data)
        return ret;
    }

    @DHttpApi(fieldApi.routes.workflowFieldsCopy)
    async workflowFieldsCopy(@DHttpReqParamRequired("workflowNodeId") workflowNodeId:string,
    @DHttpReqParamRequired("newWorkflowNodeId") newWorkflowNodeId:string,@DHttpReqParamRequired("overwrite") overwrite:number): Promise<typeof fieldApi.routes.workflowFieldsCopy.res> {
        await WorkflowNodeFieldTypeService.workflowFieldsCopy(workflowNodeId,newWorkflowNodeId,overwrite)
        return
    }

    @DHttpApi(fieldApi.routes.setWorkflowNodeFieldsWeight)
    async setWorkflowNodeFieldsWeight(@DHttpReqParamRequired("workflowNodeFieldTypeIds") workflowNodeFieldTypeIds:string): Promise<typeof fieldApi.routes.setWorkflowNodeFieldsWeight.res> {
        await WorkflowNodeFieldTypeService.setWorkflowNodeFieldsWeight(workflowNodeFieldTypeIds)
        return
    }

}