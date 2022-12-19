import fieldApi from "../../../common/routes/field";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired} from "../../common/http/http";
import {FieldTypeService} from "../service/field";
import {WorkflowNodeFieldTypeService} from './../service/field';
import {ECommon_Field_Type} from "../../../common/field/type";

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
    @DHttpReqParam("defaultValue") defaultValue:string,
    @DHttpReqParamRequired("name") name:string,
    @DHttpReqParam("description") description:string): Promise<typeof fieldApi.routes.addWorkflowNodeField.res> {
        let ret=await WorkflowNodeFieldTypeService.addWorkflowNodeField(workflowNodeId,fieldTypeId,name,optional,defaultValue,description)
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
    @DHttpReqParam("defaultValue") defaultValue:string,
    @DHttpReqParam("name") name:string,
    @DHttpReqParam("description") description:string): Promise<typeof fieldApi.routes.editWorkflowNodeField.res> {
        let obj=await WorkflowNodeFieldTypeService.getItemById(workflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        obj.assignItem({
            name,
            optional,
            default_value:defaultValue,
            description
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
    async addWorkflowNodeFieldConfig(@DHttpReqParamRequired("workflowNodeFieldTypeId") workflowNodeFieldTypeId:string,
    @DHttpReqParamRequired("data") data:{
        value :string,
        name :string,
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
    @DHttpReqParamRequired("newWorkflowNodeId") newWorkflowNodeId:string): Promise<typeof fieldApi.routes.workflowFieldsCopy.res> {
        await WorkflowNodeFieldTypeService.workflowFieldsCopy(workflowNodeId,newWorkflowNodeId)
        return
    }

}