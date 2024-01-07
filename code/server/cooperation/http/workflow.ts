import {ECommon_Model_Workflow_Node_Status} from "../../../common/model/workflow_node";
import workflowApi from "../../../common/routes/workflow";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {WorkflowActionService, WorkflowApprovalService, WorkflowService} from "../service/workflow";
import {WorkflowNodeService} from './../service/workflow';
import {IUserSession} from "../../user/types/config";
import {ECommon_Model_Workflow_Approval_Type} from "../../../common/model/workflow_approval";

@DComponent
@DHttpController(workflowApi)
class WorkflowController {
    @DHttpApi(workflowApi.routes.info)
    async info(@DHttpReqParamRequired("issueTypeId") issueTypeId: string): Promise<typeof workflowApi.routes.info.res> {
        let ret = await WorkflowService.info(issueTypeId)
        return ret;
    }

    @DHttpApi(workflowApi.routes.addNode)
    async addNode(@DHttpReqParamRequired("issueTypeId") issueTypeId: string, @DHttpReqParamRequired("name") name: string, @DHttpReqParam("description") description: string, @DHttpReqParam("status") status: ECommon_Model_Workflow_Node_Status,@DHttpReqParamRequired("x") x: number,@DHttpReqParamRequired("y") y: number): Promise<typeof workflowApi.routes.addNode.res> {
        let obj = new WorkflowNodeService;
        obj.assignItem({
            issue_type_id: issueTypeId,
            name: name,
            description: description,
            status: status,
            x,
            y
        })
        let ret = await obj.create()
        return ret;
    }

    @DHttpApi(workflowApi.routes.editNode)
    async editNode(@DHttpReqParamRequired("workflowNodeId") workflowNodeId: string,
                   @DHttpReqParam("name") name: string,
                   @DHttpReqParam("description") description: string,
                   @DHttpReqParam("status") status: ECommon_Model_Workflow_Node_Status,
                   @DHttpReqParam("x") x: number,
                   @DHttpReqParam("y") y: number,
                   @DHttpReqParam("approval") approval: number,
                   @DHttpReqParam("approvalType") approvalType: ECommon_Model_Workflow_Approval_Type,
                   @DHttpReqParam("approvalValue") approvalValue: string[],
                   @DHttpReqParam("approvalExtra") approvalExtra: string,
                   @DHttpReqParam("isAllComing") isAllComing: number): Promise<typeof workflowApi.routes.editNode.res> {
        let obj = await WorkflowNodeService.getItemById(workflowNodeId);
        if (!obj) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        if ((obj.getItem().status==ECommon_Model_Workflow_Node_Status.NOTSTART && status!==undefined && status!==ECommon_Model_Workflow_Node_Status.NOTSTART) || (obj.getItem().status!=ECommon_Model_Workflow_Node_Status.NOTSTART && status===ECommon_Model_Workflow_Node_Status.NOTSTART)) {
            throw Err.Project.Workflow.workflowNodeForbidden
        }
        obj.assignItem({
            name: name,
            description: description,
            status: status,
            x:x,
            y:y,
            is_approval:approval,
            is_all_coming:isAllComing
        })
        await obj.update()
        if((status===ECommon_Model_Workflow_Node_Status.INPROGRESS || status===ECommon_Model_Workflow_Node_Status.DONE) && approval!==undefined) {
            let objApproval=await WorkflowApprovalService.getItemByExp({
                workflow_node_id:obj.getId()
            })
            if(approval) {
                if(objApproval) {
                    objApproval.assignItem({
                        type:approvalType,
                        value:approvalValue,
                        extra:approvalExtra
                    })
                    await objApproval.update()
                } else {
                    objApproval=new WorkflowApprovalService()
                    objApproval.assignItem({
                        workflow_node_id:obj.getId(),
                        type:approvalType,
                        value:approvalValue,
                        extra:approvalExtra
                    })
                    await objApproval.create()
                }
            } else {
                await objApproval?.delete()
            }
        }
        let ret=await obj.info()
        return ret;
    }

    @DHttpApi(workflowApi.routes.deleteNode)
    async deleteNode(@DHttpReqParamRequired("workflowNodeId") workflowNodeId: string): Promise<typeof workflowApi.routes.deleteNode.res> {
        let obj = await WorkflowNodeService.getItemById(workflowNodeId);
        if (!obj) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        if (obj.getItem().status==ECommon_Model_Workflow_Node_Status.NOTSTART) {
            throw Err.Project.Workflow.workflowNodeForbidden
        }
        await obj.delete()
        return;
    }

    @DHttpApi(workflowApi.routes.addAction)
    async addAction(@DHttpReqParamRequired("issueTypeId") issueTypeId: string, @DHttpReqParamRequired("name") name: string, @DHttpReqParam("description") description: string, @DHttpReqParamRequired("sourceNodeId") sourceNodeId: string,@DHttpReqParamRequired("destNodeId") destNodeId: string,@DHttpReqParamRequired("sourceAnchorPoint") sourceAnchorPoint: string,@DHttpReqParamRequired("endAnchorPoint") endAnchorPoint: string): Promise<typeof workflowApi.routes.addAction.res> {
        let obj = new WorkflowActionService;
        obj.assignItem({
            issue_type_id: issueTypeId,
            name: name,
            description: description,
            source_node_id:sourceNodeId,
            dest_node_id:destNodeId,
            source_anchor_point:sourceAnchorPoint,
            end_anchor_point:endAnchorPoint
        })
        let ret = await obj.create()
        return ret;
    }

    @DHttpApi(workflowApi.routes.editAction)
    async editAction(@DHttpReqParamRequired("workflowActionId") workflowActionId: string, @DHttpReqParam("name") name: string, @DHttpReqParam("description") description: string, @DHttpReqParam("sourceNodeId") sourceNodeId: string,@DHttpReqParam("destNodeId") destNodeId: string,@DHttpReqParam("sourceAnchorPoint") sourceAnchorPoint: string,@DHttpReqParam("endAnchorPoint") endAnchorPoint: string): Promise<typeof workflowApi.routes.editAction.res> {
        let obj = await WorkflowActionService.getItemById(workflowActionId);
        if (!obj) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        obj.assignItem({
            name: name,
            description: description,
            source_node_id:sourceNodeId,
            dest_node_id:destNodeId,
            source_anchor_point:sourceAnchorPoint,
            end_anchor_point:endAnchorPoint
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
        await obj.delete()
        return;
    }

    @DHttpApi(workflowApi.routes.listAllNode)
    async listAllNode(@DHttpUser user:IUserSession): Promise<typeof workflowApi.routes.listAllNode.res> {
        let ret=await WorkflowNodeService.listAllNode(user.organizationInfo.organizationId)
        return ret;
    }

    @DHttpApi(workflowApi.routes.listApprovalField)
    async listApprovalField(@DHttpReqParamRequired("workflowNodeId") workflowNodeId: string,@DHttpUser user:IUserSession): Promise<typeof workflowApi.routes.listApprovalField.res> {
        let obj=await WorkflowNodeService.getItemById(workflowNodeId)
        if(!obj) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let ret=await obj.listApprovalField()
        return ret;
    }
}