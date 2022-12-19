import {Err} from "../../../common/status/error";
import {WorkflowNodeFieldTypeService} from "../service/field";
import {ProjectService} from "../service/project";
import {IssueTypeSolutionService} from './../service/issueType';

class RpcCooperationApi  {
    
    async clearProject(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound;
        }
        let ret=await ProjectService.getProjectListByOrganizationId(organizationId)
        await ProjectService.clearProjects(ret.map(item=>item.id));
    }
    
    async clearIssueType(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound;
        }
        let arrIssueTypeId=await IssueTypeSolutionService.getIssueTypesByOrganizationId(organizationId)
        let arr=[]
        for(let id of arrIssueTypeId) {
            let obj=await WorkflowNodeFieldTypeService.getItemById(id);
            arr.push(obj.delete());
        }
        await Promise.all(arr)
    }
    
    async initIssueTypeSolution(organizationId: string) {
        let objIssueTypeSolution=await IssueTypeSolutionService.init(organizationId)
    }

    
    async initProject(organizationUserID: string, organizationId: string):Promise<string> {
        let objProject=new ProjectService
        objProject.assignItem({
            name:"test",
            keyword:"test",
            organization_id:organizationId,
            created_by:organizationUserID
        })
        await objProject.create()
        return objProject.getId();
    }
    
}
export default new RpcCooperationApi;