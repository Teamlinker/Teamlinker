import { ECommon_Model_Workflow_Node_Status } from "../../../common/model/workflow_node";
import * as workflowApi from "../../../common/routes/workflow";
import { Err } from "../../../common/status/error";
import { DComponent } from "../../common/decorate/component";
import { DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired } from "../../common/http/http";
import WorkflowService, { WorkflowActionService } from "../service/workflow";
import { WorkflowNodeService, WorkflowSolutionService } from './../service/workflow';
@DComponent
@DHttpController(workflowApi)
class WorkflowController {
    @DHttpApi(workflowApi.routes.list)
    async list(): Promise<typeof workflowApi.routes.list.res> {
        let ret = await WorkflowService.list()
        return ret;
    }
    @DHttpApi(workflowApi.routes.info)
    async info(@DHttpReqParamRequired("workflowId") workflowId: string): Promise<typeof workflowApi.routes.info.res> {
        let ret = await WorkflowService.getItemById(workflowId)
        if (!ret) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let obj = await ret.info()
        return obj;
    }

    @DHttpApi(workflowApi.routes.create)
    async create(@DHttpReqParamRequired("name") name: string, @DHttpReqParam("description") description: string): Promise<typeof workflowApi.routes.create.res> {
        let obj = new WorkflowService()
        obj.assignItem({
            name,
            description
        })
        let ret = await obj.create()
        return ret;
    }

    @DHttpApi(workflowApi.routes.edit)
    async update(@DHttpReqParamRequired("workflowId") workflowId: string, @DHttpReqParam("name") name: string, @DHttpReqParam("description") description: string): Promise<typeof workflowApi.routes.edit.res> {
        let obj = await WorkflowService.getItemById(workflowId)
        if (!obj) {
            throw Err.Project.Workflow.workflowNotFound
        }
        if (obj.getItem().reserved) {
            throw Err.Project.Workflow.workflowForbidden
        }
        obj.assignItem({
            id: workflowId,
            name,
            description
        }, true)
        let ret = await obj.update()
        return ret;
    }

    @DHttpApi(workflowApi.routes.delete)
    async delete(@DHttpReqParamRequired("workflowId") workflowId: string): Promise<typeof workflowApi.routes.delete.res> {
        let obj = await WorkflowService.getItemById(workflowId)
        if (!obj) {
            throw Err.Project.Workflow.workflowNotFound
        }
        if (obj.getItem().reserved) {
            throw Err.Project.Workflow.workflowForbidden
        }
        await obj.delete()
        return;
    }

    @DHttpApi(workflowApi.routes.addNode)
    async addNode(@DHttpReqParamRequired("workflowId") workflowId: string, @DHttpReqParamRequired("name") name: string, @DHttpReqParam("description") description: string, @DHttpReqParam("status") status: ECommon_Model_Workflow_Node_Status): Promise<typeof workflowApi.routes.addNode.res> {
        let obj = new WorkflowNodeService;
        obj.assignItem({
            workflow_id: workflowId,
            name: name,
            description: description,
            status: status
        })
        let ret = await obj.create()
        return ret;
    }

    @DHttpApi(workflowApi.routes.editNode)
    async editNode(@DHttpReqParamRequired("workflowNodeId") workflowNodeId: string, @DHttpReqParam("name") name: string, @DHttpReqParam("description") description: string, @DHttpReqParam("status") status: ECommon_Model_Workflow_Node_Status): Promise<typeof workflowApi.routes.editNode.res> {
        let obj = await WorkflowNodeService.getItemById(workflowNodeId);
        if (!obj) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        if (obj.getItem().reserved) {
            throw Err.Project.Workflow.workflowNodeForbidden
        }
        obj.assignItem({
            name: name,
            description: description,
            status: status
        })
        let ret = await obj.update()
        return ret;
    }

    @DHttpApi(workflowApi.routes.deleteNode)
    async deleteNode(@DHttpReqParamRequired("workflowNodeId") workflowNodeId: string): Promise<typeof workflowApi.routes.deleteNode.res> {
        let obj = await WorkflowNodeService.getItemById(workflowNodeId);
        if (!obj) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        if (obj.getItem().reserved) {
            throw Err.Project.Workflow.workflowNodeForbidden
        }
        await obj.delete()
        return;
    }

    @DHttpApi(workflowApi.routes.addAction)
    async addAction(@DHttpReqParamRequired("workflowId") workflowId: string, @DHttpReqParamRequired("name") name: string, @DHttpReqParam("description") description: string, @DHttpReqParamRequired("sourceNodeId") sourceNodeId: string,@DHttpReqParamRequired("destNodeId") destNodeId: string): Promise<typeof workflowApi.routes.addAction.res> {
        let obj = new WorkflowActionService;
        obj.assignItem({
            workflow_id: workflowId,
            name: name,
            description: description,
            source_node_id:sourceNodeId,
            dest_node_id:destNodeId
        })
        let ret = await obj.create()
        return ret;
    }

    @DHttpApi(workflowApi.routes.editAction)
    async editAction(@DHttpReqParamRequired("workflowActionId") workflowActionId: string, @DHttpReqParamRequired("name") name: string, @DHttpReqParam("description") description: string, @DHttpReqParam("sourceNodeId") sourceNodeId: string,@DHttpReqParam("destNodeId") destNodeId: string): Promise<typeof workflowApi.routes.editAction.res> {
        let obj = await WorkflowActionService.getItemById(workflowActionId);
        if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        if (obj.getItem().reserved) {
            throw Err.Project.Workflow.workflowActionForbidden
        }
        obj.assignItem({
            name: name,
            description: description,
            source_node_id:sourceNodeId,
            dest_node_id:destNodeId
        })
        let ret = await obj.update()
        return ret;
    }

    @DHttpApi(workflowApi.routes.deleteAction)
    async deleteAction(@DHttpReqParamRequired("workflowActionId") workflowActionId: string): Promise<typeof workflowApi.routes.deleteAction.res> {
        let obj = await WorkflowActionService.getItemById(workflowActionId);
        if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        if (obj.getItem().reserved) {
            throw Err.Project.Workflow.workflowActionForbidden
        }
        await obj.delete()
        return;
    }

    @DHttpApi(workflowApi.routes.solutionList)
     async solutionList():Promise<typeof workflowApi.routes.solutionList.res> {
         let ret=await WorkflowSolutionService.list()
         return ret;
     }
     @DHttpApi(workflowApi.routes.solutionInfo)
     async solutionInfo(@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string):Promise<typeof workflowApi.routes.solutionInfo.res> {
         let obj=await WorkflowSolutionService.getItemById(workflowSolutionId);
         if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        let ret=await obj.info()
        return ret;
     }
     @DHttpApi(workflowApi.routes.solutionAssign)
     async solutionAssign(@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string,@DHttpReqParamRequired("issueTypeId") issueTypeId:string,@DHttpReqParamRequired("workflowId") workflowId:string,@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string):Promise<typeof workflowApi.routes.solutionAssign.res> {
         let obj=await WorkflowSolutionService.getItemById(workflowSolutionId);
         if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        await obj.assign(issueTypeId,workflowId,issueTypeSolutionId)
        return
     }
     @DHttpApi(workflowApi.routes.solutionCreate)
     async solutionCreate(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("description") description:string):Promise<typeof workflowApi.routes.solutionCreate.res> {
        let obj=new WorkflowSolutionService()
        obj.assignItem({
            name:name,
            description:description
        })
        let ret=await obj.create();
        return ret;
     }
     @DHttpApi(workflowApi.routes.solutionUpdate)
     async solutionUpdate(@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string,@DHttpReqParam("name") name:string,@DHttpReqParam("description") description:string):Promise<typeof workflowApi.routes.solutionUpdate.res> {
         let obj=await WorkflowSolutionService.getItemById(workflowSolutionId);
         if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        obj.assignItem({
            name,
            description
        })
        let ret=await obj.update()
        return ret;
     }
     @DHttpApi(workflowApi.routes.solutionDelete)
     async solutionDelete(@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string):Promise<typeof workflowApi.routes.solutionDelete.res> {
         let obj=await WorkflowSolutionService.getItemById(workflowSolutionId);
         if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        await obj.delete()
        return
     }
     @DHttpApi(workflowApi.routes.solutionBind)
     async solutionBind(@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string,@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string):Promise<typeof workflowApi.routes.solutionBind.res> {
         let obj=await WorkflowSolutionService.getItemById(workflowSolutionId);
         if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        await obj.bindIssueTypeSolutions([issueTypeSolutionId])
        return
     }
     @DHttpApi(workflowApi.routes.solutionUnBind)
     async solutionUnBind(@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string,@DHttpReqParamRequired("issueTypeSolutionId") issueTypeSolutionId:string):Promise<typeof workflowApi.routes.solutionUnBind.res> {
         let obj=await WorkflowSolutionService.getItemById(workflowSolutionId);
         if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        await obj.unbindIssueTypeSolutions([issueTypeSolutionId])
        return
     }
     @DHttpApi(workflowApi.routes.solutionCopy)
     async solutionCopy(@DHttpReqParamRequired("workflowSolutionId") workflowSolutionId:string):Promise<typeof workflowApi.routes.solutionCopy.res> {
         let obj=await WorkflowSolutionService.getItemById(workflowSolutionId);
         if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        let ret=await obj.copy()
        return ret.getItem()
     }

}