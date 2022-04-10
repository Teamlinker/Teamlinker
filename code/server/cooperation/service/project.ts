import { ICommon_Model_Project_Role } from "../../../common/model/project_role";
import { ICommon_Route_Res_Project_List } from "../../../common/routes/response";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from "../../common/event/types";
import { moduleMapper } from "../mapper/module";
import { projectMapper } from '../mapper/project';
import { ICommon_Model_Project, projectModel } from './../../../common/model/project';
import { ECommon_Model_Project_Member_Type } from './../../../common/model/project_member';
import { tagMapper } from './../mapper/tag';
import { FieldSolutionService } from './field';
import { IssueTypeSolutionService } from './issueType';
import WorkflowService, { WorkflowSolutionService } from './workflow';
export default class Project extends Entity<typeof projectModel,typeof projectMapper> {
    constructor(){
        super(projectMapper)
    }
    override async delete(type?:EServer_Common_Event_Types.Types) {
        await super.delete(EServer_Common_Event_Types.Project.DELETE)
        await moduleMapper.deleteByProjectId(this.item.id)
        await tagMapper.deleteByProjectId(this.item.id)
        await projectMapper.clearMember(this.item.id);
    }

    override async create(): Promise<ICommon_Model_Project> {
        let ret=await super.create();
        let role=await projectMapper.getRoleByName("admin","")
        if(role) {
            await projectMapper.addMember(this.getId(),this.getItem().created_by,ECommon_Model_Project_Member_Type.USER,role.id)
        }
        let issueTypeSolution=await IssueTypeSolutionService.getReservedItem()
        await issueTypeSolution.bindProject(this.getId())
        return ret;
    }

    async listMember(page:number,size:number){
        let ret=await projectMapper.listMember(this.item.id,page,size);
        return ret;
    }

    async addMember(memberId:string,type:ECommon_Model_Project_Member_Type,roleId:string) {
        await projectMapper.addMember(this.item.id,memberId,type,roleId)
    }

    async removeMember(memberId:string){
        await projectMapper.removeMember(this.item.id,memberId)
    }

    async editMember(memberId:string,roleId:string){
        await projectMapper.changeRole(this.item.id,memberId,roleId)
    }

    static async list(page:number,size:number,keyword?:string,userId?:string):Promise<ICommon_Route_Res_Project_List>{
        let ret=await projectMapper.list(page,size,keyword,userId)
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            page:page,
            data:ret.data
        }
    }

    async getRoles():Promise<ICommon_Model_Project_Role[]>{
        if(!this.item || !this.item.id) {
            throw  Err.Project.projectNotFound;
        }
        let ret=await projectMapper.getRoles(this.item.id);
        return ret;
    }

    async issueTypeList() {
        let issueTypeSolution=await IssueTypeSolutionService.getObjByProjectId(this.getId())
        if(!issueTypeSolution) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let list=await issueTypeSolution.issueTypeList()
        return list;
    }

    async getFirstNodeInfo(issueTypeId:string) {
        let issueTypeSolution=await IssueTypeSolutionService.getObjByProjectId(this.getId())
        if(!issueTypeSolution) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let arr=await issueTypeSolution.issueTypeList()
        let list=arr.map(item=>item.id)
        if(!list.includes(issueTypeId)) {
            throw Err.Project.Issue.issueTypeNotInIssueTypeSolution
        }
        let workflowSolution=await WorkflowSolutionService.getItemByIssueTypeSolutionId(issueTypeSolution.getId())
        if(!workflowSolution) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let workflowItem=await workflowSolution.getWorkflowByIssueTypeId(issueTypeId,issueTypeSolution.getId())
        let workflow =await WorkflowService.getItemById(workflowItem.id)
        let node=await workflow.getFirstNode()
        return {
            node:node,
            workflowSolution:workflowSolution,
            workflow:workflow
        };
    }

    async getBindInfo() {
        let issueTypeSolution=await IssueTypeSolutionService.getObjByProjectId(this.getId())
        let workflowSolution:WorkflowSolutionService=null,fieldSolution:FieldSolutionService=null
        if(issueTypeSolution) {
            workflowSolution=await WorkflowSolutionService.getItemByIssueTypeSolutionId(issueTypeSolution.getId())
            if(workflowSolution) {
                fieldSolution=await FieldSolutionService.getObjByWorkflowSolutionId(workflowSolution.getId())
            }
        }
        return {
            issueTypeSolution:issueTypeSolution,
            workflowSolution:workflowSolution,
            fieldSolution:fieldSolution
        }
    }

    async getFirstNodeFields(issueTypeId:string){
        let info=await this.getFirstNodeInfo(issueTypeId);
        if(!info || !info.node) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let fieldSolution=await FieldSolutionService.getObjByWorkflowSolutionId(info.workflowSolution.getId())
        if(!fieldSolution) {
            return null
        } else {
            let ret=await fieldSolution.listWorkflowNodeField(info.node.id,info.workflow.getId(),info.workflowSolution.getId())
            return ret;
        }
    }

    static async getObjByKeyword(keyword:string) {
        let item=await projectMapper.getItemByKeyword(keyword) 
        if(item) {
            let obj=new Project
            obj.setItem(item)
            return obj;
        } else {
            return null
        }
    }

    static async recentProjectList(userId:string) {
        let ret=await projectMapper.recentProjectList(userId)
        return ret
    }

    async listUser(keyword?:string) {
        let arr=await projectMapper.listUser(this.getId(),keyword)
        return arr;
    }
}