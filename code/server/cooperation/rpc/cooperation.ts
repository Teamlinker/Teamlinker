import {Err} from "../../../common/status/error";
import {ProjectService} from "../service/project";
import {IssueTypeSolutionService} from './../service/issueType';
import {ProjectIssueService} from "../service/issue";
import {ProjectReleaseService} from "../service/release";
import rpcContentApi from "../../content/rpc/content"
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {BoardService, BoardSprintService} from "../service/board";
import {ICommon_Model_Board_Sprint} from "../../../common/model/board_sprint";
import {ICommon_Model_Board} from "../../../common/model/board";
import {ICommon_Model_Project} from "../../../common/model/project";
import {ECommon_Model_Project_Issue_Priority} from "../../../common/model/project_issue";

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
    
    async initIssueTypeSolution(organizationId: string,lang:string) {
        let ret=await IssueTypeSolutionService.init(organizationId,lang)
        return ret;
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

    async board(boardId:string) {
        let obj=await BoardService.getItemById(boardId)
        if(!obj) {
            throw Err.Project.Board.boardSprintNotFound
        }
        return obj.getItem()
    }

    async boardSprintAndProject(boardSprintId:string):Promise<ICommon_Model_Board_Sprint & {
        board:ICommon_Model_Board,
        project:ICommon_Model_Project
    }> {
        let obj=await BoardSprintService.boardAndProject(boardSprintId)
        return obj;
    }

    async clearMember(organizationUserId:string) {
        await ProjectService.clearMember(organizationUserId)
    }

    async createProject(name:string,keyword:string,organizationUserId:string,organizationId:string,issueTypeSolutionId:string) {
        let obj=new ProjectService()
        obj.assignItem({
            keyword:keyword,
            name:name,
            created_by:organizationUserId,
            organization_id:organizationId
        })
        let ret=await obj.create(issueTypeSolutionId)
        return ret
    }

    async createIssue(projectId:string,issueTypeId:string,name:string,priority:ECommon_Model_Project_Issue_Priority,organizationUserId:string) {
        let projectIssue=new ProjectIssueService
        projectIssue.assignItem({
            project_id:projectId,
            issue_type_id:issueTypeId,
            name,
            priority,
            created_by:organizationUserId
        })
        let obj=await projectIssue.create()
        return obj;
    }
}
export default new RpcCooperationApi;