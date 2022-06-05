import { Err } from "../../../common/status/error";
import { IServer_Common_RPC_Cooperation } from "../../common/rpc/api/cooperation";
import { DRPCRecieve } from "../../common/rpc/rpc";
import { FieldSolutionService } from "../service/field";
import ProjectService from "../service/project";
import FieldTypeService from './../service/field';
import IssueTypeService, { IssueTypeSolutionService } from './../service/issueType';
import WorkflowService, { WorkflowSolutionService } from './../service/workflow';
class RpcCooperationApi implements IServer_Common_RPC_Cooperation {
    @DRPCRecieve
    async clearProject(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound;
        }
        let ret=await ProjectService.getProjectListByOrganizationId(organizationId)
        await ProjectService.clearProjects(ret.map(item=>item.id));
    }
    @DRPCRecieve
    async clearField(organizationId:string){
        if(!organizationId) {
            throw Err.Organization.organizationNotFound;
        }
        await FieldSolutionService.clearFieldByOrganizationId(organizationId);
    }
    @DRPCRecieve
    async clearWorkflow(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound;
        }
        await WorkflowSolutionService.clearByOrganizationId(organizationId);
    }
    @DRPCRecieve
    async clearIssueType(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound;
        }
        await IssueTypeSolutionService.clearByOrganizationId(organizationId);
    }
    @DRPCRecieve
    async initIssueTypeWorkflowAndSolution(organizationId: string,projectId?:string) {
        let objIssueType=await IssueTypeService.init(organizationId);
        let objIssueTypeSolution=await IssueTypeSolutionService.init(organizationId,objIssueType)
        let workflowId = await WorkflowService.init(organizationId)
        await WorkflowSolutionService.init(objIssueTypeSolution.solutionId,objIssueTypeSolution.solutionName,objIssueType.taskId,objIssueType.bugId,objIssueType.ticketId,workflowId,organizationId);
    }

    @DRPCRecieve
    async initProject(userId: string, projectRoleUserId: string, organizationId: string):Promise<string> {
        let objProject=new ProjectService
        objProject.assignItem({
            name:"test",
            keyword:"test",
            organization_id:organizationId,
            created_by:userId
        })
        await objProject.create()
        return objProject.getId();
    }

    @DRPCRecieve
    async initField() {
        await FieldTypeService.init()
    }
    
}
export default new RpcCooperationApi;