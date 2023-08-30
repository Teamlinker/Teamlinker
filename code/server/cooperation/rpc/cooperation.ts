import {Err} from "../../../common/status/error";
import {ProjectService} from "../service/project";
import {IssueTypeSolutionService} from './../service/issueType';
import {ProjectIssueService} from "../service/issue";
import {ProjectReleaseService} from "../service/release";
import rpcContentApi from "../../content/rpc/content"
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {BoardSprintService} from "../service/board";

class RpcCooperationApi  {
    
    async clearProject(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound;
        }
        let ret=await ProjectService.getProjectListByOrganizationId(organizationId)
        await ProjectService.clearProjects(ret.map(item=>item.id));
    }
    
    async clearIssueTypeSolution(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound;
        }
        await IssueTypeSolutionService.clearByOrganizationId(organizationId)
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

    async project(projectId:string) {
        let obj=await ProjectService.getItemById(projectId)
        if(!obj) {
            throw Err.Project.projectNotFound
        }
        return obj.getItem()
    }

    async projectIssue(projectIssueId:string) {
        let obj=await ProjectIssueService.getItemById(projectIssueId)
        if(!obj) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        return obj.getItem()
    }

    async projectRelease(projectReleaseId:string) {
        let obj=await ProjectReleaseService.getItemById(projectReleaseId)
        if(!obj) {
            throw Err.Project.Release.releaseNotFound
        }
        return obj.getItem()
    }

    async getIssueRelatedOrganizationUserIds(projectIssueId:string) {
        let arrPromise=await Promise.allSettled([
            (async ()=>{
                let obj=await ProjectIssueService.getItemById(projectIssueId)
                if(!obj) {
                    throw Err.Project.ProjectIssue.projectIssueNotFound
                }
                let list=await obj.getOrganizationUserIdsByIssueExtraField()
                return [obj.getItem().assigner_id,obj.getItem().reporter_id,obj.getItem().created_by,...list]
            })(),
            (async ()=>{
                let list=await rpcContentApi.list(projectIssueId,ECommon_Model_Content_Type.PROJECT_ISSUE_COMMENT,false)
                let ret:string[]=[]
                for(let obj of list) {
                    ret.push(obj.created_by,obj.modified_by)
                }
                return ret;
            })()
        ])
        let ret:string[]=[]
        for(let promise of arrPromise) {
            if(promise.status==="fulfilled") {
                let objResolve=promise.value
                for(let id of objResolve) {
                    if(id && !ret.includes(id)) {
                        ret.push(id)
                    }
                }
            }
        }
        return ret;
    }

    async boardSprint(boardSprintId:string) {
        let obj=await BoardSprintService.getItemById(boardSprintId)
        if(!obj) {
            throw Err.Project.Board.boardSprintNotFound
        }
        return obj.getItem()
    }
    
}
export default new RpcCooperationApi;