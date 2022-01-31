import * as fieldApi from "../../../common/routes/field";
import { Err } from "../../../common/status/error";
import { DComponent } from "../../common/decorate/component";
import { DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired } from "../../common/http/http";
import FieldTypeService from "../service/field";
import { FieldSolutionService } from './../service/field';
@DComponent
@DHttpController(fieldApi)
class FieldController {
    @DHttpApi(fieldApi.routes.typeList)
    async typeList(): Promise<typeof fieldApi.routes.typeList.res> {
        let ret = await FieldTypeService.list()
        return ret;
    }

    @DHttpApi(fieldApi.routes.typeInfo)
    async typeInfo(@DHttpReqParamRequired("fieldTypeId") fieldTypeId:string): Promise<typeof fieldApi.routes.typeInfo.res> {
        let ret = await FieldTypeService.getItemById(fieldTypeId)
        if(!ret) {
            throw Err.Project.Field.fieldTypeNotFound
        }
        return ret.getItem();
    }

    @DHttpApi(fieldApi.routes.solutionList)
    async solutionList(): Promise<typeof fieldApi.routes.solutionList.res> {
        let ret = await FieldSolutionService.list()
        return ret;
    }

    @DHttpApi(fieldApi.routes.solutionInfo)
    async solutionInfo(@DHttpReqParamRequired("fieldSolutionId") fieldSolutionId:string): Promise<typeof fieldApi.routes.solutionInfo.res> {
        let obj=await FieldSolutionService.getItemById(fieldSolutionId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.info()
        return ret;
    }

    @DHttpApi(fieldApi.routes.solutionCreate)
    async solutionCreate(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("description") description:string): Promise<typeof fieldApi.routes.solutionCreate.res> {
        let service=new FieldSolutionService
        service.assignItem({
            name,
            description
        })
        let ret=await service.create()
        return ret;
    }

    @DHttpApi(fieldApi.routes.solutionEdit)
    async solutionEdit(@DHttpReqParamRequired("fieldSolutionId") fieldSolutionId:string,@DHttpReqParam("name") name:string,@DHttpReqParam("description") description:string): Promise<typeof fieldApi.routes.solutionEdit.res> {
        let obj=await FieldSolutionService.getItemById(fieldSolutionId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        obj.assignItem({
            name,
            description
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(fieldApi.routes.solutionDelete)
    async solutionDelete(@DHttpReqParamRequired("fieldSolutionId") fieldSolutionId:string): Promise<typeof fieldApi.routes.solutionDelete.res> {
        let obj=await FieldSolutionService.getItemById(fieldSolutionId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(fieldApi.routes.bindWorkflowSolution)
    async bindWorkflowSolution(@DHttpReqParamRequired("fieldSolutionId") fieldSolutionId:string,@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string): Promise<typeof fieldApi.routes.bindWorkflowSolution.res> {
        
        let obj=await FieldSolutionService.getItemById(fieldSolutionId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        await obj.bindWorkflowSolution(workflowSolutionId)
        return
    }

    @DHttpApi(fieldApi.routes.unbindWorkflowSolution)
    async unbindWorkflowSolution(@DHttpReqParamRequired("fieldSolutionId") fieldSolutionId:string,@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string): Promise<typeof fieldApi.routes.unbindWorkflowSolution.res> {
        let obj=await FieldSolutionService.getItemById(fieldSolutionId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        await obj.unbindWorkflowSolution(workflowSolutionId)
        return
    }

    @DHttpApi(fieldApi.routes.listWorkflowNodeField)
    async listWorkflowNodeField(@DHttpReqParamRequired("fieldSolutionId") fieldSolutionId:string,@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string,@DHttpReqParamRequired("workflowNodeId") workflowNodeId:string,@DHttpReqParamRequired("workflowId") workflowId:string): Promise<typeof fieldApi.routes.listWorkflowNodeField.res> {
        let obj=await FieldSolutionService.getItemById(fieldSolutionId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.listWorkflowNodeField(workflowNodeId,workflowId,workflowSolutionId)
        return ret;
    }

    @DHttpApi(fieldApi.routes.addWorkflowNodeField)
    async addWorkflowNodeField(@DHttpReqParamRequired("fieldSolutionId") fieldSolutionId:string,
    @DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string,
    @DHttpReqParamRequired("fieldTypeId") fieldTypeId:string,
    @DHttpReqParamRequired("optional") optional:number,
    @DHttpReqParam("defaultValue") defaultValue:string,
    @DHttpReqParamRequired("name") name:string,
    @DHttpReqParamRequired("workflowId") workflowId:string,
    @DHttpReqParamRequired("workflowNodeId") workflowNodeId:string,
    @DHttpReqParam("description") description:string,
    @DHttpReqParam("lable_type") labelType:string): Promise<typeof fieldApi.routes.addWorkflowNodeField.res> {
        let obj=await FieldSolutionService.getItemById(fieldSolutionId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.addWorkflowNodeField(workflowNodeId,workflowId,workflowSolutionId,fieldTypeId,name,optional,defaultValue,description)
        return ret;
    }

    @DHttpApi(fieldApi.routes.editWorkflowNodeField)
    async editWorkflowNodeField(@DHttpReqParamRequired("fieldSolutionWorkflowNodeFieldTypeId") fieldSolutionWorkflowNodeFieldTypeId:string,
    @DHttpReqParam("optional") optional:number,
    @DHttpReqParam("defaultValue") defaultValue:string,
    @DHttpReqParam("name") name:string,
    @DHttpReqParam("description") description:string): Promise<typeof fieldApi.routes.editWorkflowNodeField.res> {
        let obj=await FieldSolutionService.getObjByFieldSolutionWorkflowNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.editWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId,name,optional,defaultValue,description)
        return ret;
    }

    @DHttpApi(fieldApi.routes.moveWorkflowNodeField)
    async moveWorkflowNodeField(@DHttpReqParamRequired("fieldSolutionWorkflowNodeFieldTypeId") fieldSolutionWorkflowNodeFieldTypeId:string,@DHttpReqParamRequired("sort") sort:number): Promise<typeof fieldApi.routes.moveWorkflowNodeField.res> {
        let obj=await FieldSolutionService.getObjByFieldSolutionWorkflowNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.moveWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId,sort)
        return ret;
    }

    @DHttpApi(fieldApi.routes.deleteWorkflowNodeField)
    async deleteWorkflowNodeField(@DHttpReqParamRequired("fieldSolutionWorkflowNodeFieldTypeId") fieldSolutionWorkflowNodeFieldTypeId:string): Promise<typeof fieldApi.routes.deleteWorkflowNodeField.res> {
        let obj=await FieldSolutionService.getObjByFieldSolutionWorkflowNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        await obj.deleteWorkflowNodeField(fieldSolutionWorkflowNodeFieldTypeId)
        return
    }

    @DHttpApi(fieldApi.routes.listWorkflowNodeFieldConfig)
    async listWorkflowNodeFieldConfig(@DHttpReqParamRequired("fieldSolutionWorkflowNodeFieldTypeId") fieldSolutionWorkflowNodeFieldTypeId:string): Promise<typeof fieldApi.routes.listWorkflowNodeFieldConfig.res> {
        let obj=await FieldSolutionService.getObjByFieldSolutionWorkflowNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.listWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId)
        return ret;
    }

    @DHttpApi(fieldApi.routes.addWorkflowNodeFieldConfig)
    async addWorkflowNodeFieldConfig(@DHttpReqParamRequired("fieldSolutionWorkflowNodeFieldTypeId") fieldSolutionWorkflowNodeFieldTypeId:string,
    @DHttpReqParamRequired("value") value:string,
    @DHttpReqParamRequired("name") name:string,
    @DHttpReqParamRequired("selected") selected:number): Promise<typeof fieldApi.routes.addWorkflowNodeFieldConfig.res> {
        let obj=await FieldSolutionService.getObjByFieldSolutionWorkflowNodeFieldTypeId(fieldSolutionWorkflowNodeFieldTypeId)
        if(!obj) {
            throw Err.Project.Field.fieldSolutionNotFound
        }
        let ret=await obj.addWorkflowNodeFieldConfig(fieldSolutionWorkflowNodeFieldTypeId,value,name,selected)
        return ret;
    }

    @DHttpApi(fieldApi.routes.editWorkflowNodeFieldConfig)
    async editWorkflowNodeFieldConfig(@DHttpReqParamRequired("fieldTypeConfigValueId") fieldTypeConfigValueId:string,
    @DHttpReqParam("value") value:string,
    @DHttpReqParam("name") name:string,
    @DHttpReqParam("selected") selected:number): Promise<typeof fieldApi.routes.editWorkflowNodeFieldConfig.res> {
        let obj=await FieldSolutionService.getObjByFieldTypeConfigValueId(fieldTypeConfigValueId)
        if(!obj) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        let ret=await obj.editWorkflowNodeFieldConfig(fieldTypeConfigValueId,value,name,selected)
        return ret;
    }

    @DHttpApi(fieldApi.routes.deleteWorkflowNodeFieldConfig)
    async deleteWorkflowNodeFieldConfig(@DHttpReqParamRequired("fieldTypeConfigValueId") fieldTypeConfigValueId:string): Promise<typeof fieldApi.routes.deleteWorkflowNodeFieldConfig.res> {
        let obj=await FieldSolutionService.getObjByFieldTypeConfigValueId(fieldTypeConfigValueId)
        if(!obj) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        await obj.deleteWorkflowNodeFieldConfig(fieldTypeConfigValueId)
        return
    }

    @DHttpApi(fieldApi.routes.workflowFieldsCopy)
    async workflowFieldsCopy(@DHttpReqParamRequired("fieldSolutionId") fieldSolutionId:string,
    @DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string,
    @DHttpReqParamRequired("workflowId") workflowId:string,
    @DHttpReqParamRequired("newFieldSolutionId") newFieldSolutionId:string,
    @DHttpReqParamRequired("newWorkflowSolutionId") newWorkflowSolutionId:string): Promise<typeof fieldApi.routes.workflowFieldsCopy.res> {
        let obj=await FieldSolutionService.getItemById(fieldSolutionId)
        if(!obj) {
            throw Err.Project.Field.fieldTypeConfigValueIdNotFound
        }
        await obj.workflowFieldsCopy(workflowSolutionId,workflowId,newFieldSolutionId,newWorkflowSolutionId)
        return
    }

}