import * as moment from "moment";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { ECommon_Model_Project_Release_Status, ICommon_Model_Project_Release, projectReleaseModel } from './../../../common/model/project_release';
import { releaseMapper } from './../mapper/release';
import ProjectIssue from "./issue";
export class ProjectReleaseService extends Entity<typeof projectReleaseModel,typeof releaseMapper> {
    constructor(){
        super(releaseMapper)
    }
    static async list(projectId:string,page:number,size:number,name?:string,status?:ECommon_Model_Project_Release_Status){
        if(page<0 || size<=0){
            throw Err.Project.Release.releaseSizeEmpty
        }
        let ret=await releaseMapper.list(projectId,page,size,name,status)
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
                throw Err.Project.Release.releaseStartDateNotLessReleaseDate
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
                throw Err.Project.Release.releaseStartDateNotLessReleaseDate
            }
        }
        let ret=await super.update()
        return ret;
    }

    async addIssue(projectIssueId:string) {
        let objIssue=await ProjectIssue.getItemById(projectIssueId)
        if(!objIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if (objIssue.getItem().project_id!=this.getItem().project_id) {
            throw Err.Project.ProjectIssue.issueProjectNotMatch
        }
        await releaseMapper.addIssue(this.getId(),projectIssueId)
    }

    async removeIssue(projectIssueId:string) {
        let objIssue=await ProjectIssue.getItemById(projectIssueId)
        if(!objIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        } else if (objIssue.getItem().project_id!=this.getItem().project_id) {
            throw Err.Project.ProjectIssue.issueProjectNotMatch
        }
        await releaseMapper.removeIssue(this.getId(),projectIssueId)
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

}