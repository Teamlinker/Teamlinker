import * as moment from "moment";
import {Err} from "../../../common/status/error";
import {Entity} from "../../common/entity/entity";
import {
    ECommon_Model_Project_Release_Status,
    ICommon_Model_Project_Release,
    projectReleaseModel
} from './../../../common/model/project_release';
import {releaseMapper} from './../mapper/release';
import {ProjectIssueHistoryService, ProjectIssueService} from "./issue";
import {ECommon_Model_Project_Issue_History_Type} from "../../../common/model/project_issue_history";
import {IServer_Common_Event_Types} from "../../common/event/types";

export class ProjectReleaseService extends Entity<typeof projectReleaseModel,typeof releaseMapper> {
    constructor(){
        super(releaseMapper)
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        await releaseMapper.clearIssue(this.getId())
    }

    static async globalSearch(keyword:string,size:number,organizationUserId:string) {
        let ret=await releaseMapper.globalSearch(keyword, size, organizationUserId)
        return ret;
    }

    static async list(organizationId:string,projectId:string,page:number,size:number,name?:string,status?:ECommon_Model_Project_Release_Status,projectReleaseIds?:string[]){
        if(page<0 || size<=0){
            throw Err.Project.Release.releaseSizeEmpty
        }
        let ret=await releaseMapper.list(organizationId,projectId,page,size,name,status,projectReleaseIds)
        return ret
    }

    async info() {
        let obj=await releaseMapper.info(this.getId())
        return obj
    }

    override async create(): Promise<ICommon_Model_Project_Release> {
        if(this.getItem().start_time) {
            if(!moment(this.getItem().start_time).isValid()) {
                throw Err.Project.Release.releaseDateError
            }
        }
        if(this.getItem().release_time) {
            if(!moment(this.getItem().release_time).isValid()) {
                throw Err.Project.Release.releaseDateError
            }
        }
        if(this.getItem().start_time && this.getItem().release_time) {
            if(!moment(this.getItem().start_time).isBefore(moment(this.getItem().release_time))) {
                throw Err.Project.Release.releaseStartDateNotMoreThanReleaseDate
            }
        }
        let ret=await super.create()
        return ret;
    }

    override async update(): Promise<ICommon_Model_Project_Release> {
        if(this.getItem().start_time) {
            if(!moment(this.getItem().start_time).isValid()) {
                throw Err.Project.Release.releaseDateError
            }
        }
        if(this.getItem().release_time) {
            if(!moment(this.getItem().release_time).isValid()) {
                throw Err.Project.Release.releaseDateError
            }
        }
        if(this.getItem().start_time && this.getItem().release_time) {
            if(!moment(this.getItem().start_time).isBefore(moment(this.getItem().release_time))) {
                throw Err.Project.Release.releaseStartDateNotMoreThanReleaseDate
            }
        }
        let ret=await super.update()
        return ret;
    }

    async addIssue(projectIssueId:string,organizationUserId:string) {
        let objIssue=await ProjectIssueService.getItemById(projectIssueId)
        if(!objIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if (objIssue.getItem().project_id!=this.getItem().project_id) {
            throw Err.Project.ProjectIssue.issueProjectNotMatch
        }
        await releaseMapper.addIssue(this.getId(),projectIssueId)
        let objHistory=new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id:projectIssueId,
            type:ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id:organizationUserId,
            project_id:objIssue.getItem().project_id,
            name:"Fix Version",
            value:this.getItem().name
        })
        objHistory.create()
    }

    async removeIssue(projectIssueId:string,organizationUserId:string) {
        let objIssue=await ProjectIssueService.getItemById(projectIssueId)
        if(!objIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if (objIssue.getItem().project_id!=this.getItem().project_id) {
            throw Err.Project.ProjectIssue.issueProjectNotMatch
        }
        await releaseMapper.removeIssue(this.getId(),projectIssueId)
        let objHistory=new ProjectIssueHistoryService()
        objHistory.assignItem({
            project_issue_id:projectIssueId,
            type:ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD,
            organization_user_id:organizationUserId,
            project_id:objIssue.getItem().project_id,
            name:"Fix Version",
        })
        objHistory.create()
    }

    async checkIfCanRelease() {
        let unDoneIssueList=await releaseMapper.getUnDoneIssueList(this.getId())
        if(unDoneIssueList.length>0) {
            return {
                result:false,
                unDoneIssueList:unDoneIssueList
            }
        } else {
            return {
                result:true
            }
        }
    }

    static async issueReleaseList(projectIssueId:string) {
        let ret=await releaseMapper.issueReleaseList(projectIssueId)
        return ret;
    }

    static async issueBindReleaseList(projectIssueId:string,projectReleaseIds:string[]) {
        let ret=await releaseMapper.issueBindReleaseList(projectIssueId,projectReleaseIds)
        return ret;
    }

}