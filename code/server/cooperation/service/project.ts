import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type} from "../../../common/model/role";
import {ICommon_Route_Res_Project_List, ICommon_Route_Res_Project_Statics} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {Entity} from "../../common/entity/entity";
import {moduleMapper} from "../mapper/module";
import {projectMapper} from '../mapper/project';
import rpcAuthApi from "../../auth/rpc/auth";
import {ProjectIssueService} from "../service/issue";
import {ICommon_Model_Project, projectModel} from './../../../common/model/project';
import {ECommon_Model_Organization_Member_Type} from './../../../common/model/organization';
import {issueTypeSolutionMapper} from './../mapper/issueType';
import {releaseMapper} from './../mapper/release';
import {labelMapper} from '../mapper/label';
import {WorkflowNodeFieldTypeService} from './field';
import {IssueTypeSolutionService} from './issueType';
import {WorkflowService} from './workflow';
import {IServer_Common_Event_Types} from "../../common/event/types";
import {emitServiceEvent} from "../../common/event/event";
import {BoardService} from "./board";
import {REDIS_PROJECT} from "../../common/cache/keys/project";
import rpcUserApi from "../../user/rpc/user"
import {planMapper} from "../mapper/plan";

export class ProjectService extends Entity<typeof projectModel,typeof projectMapper> {
    constructor(){
        super(projectMapper)
    }

    async statics(organizationUserId:string):Promise<ICommon_Route_Res_Project_Statics> {
        let objRedis=REDIS_PROJECT.statics(this.getId())
        let value=await objRedis.get()
        if(!value) {
            value=await projectMapper.statics(this.getId(),organizationUserId)
            await objRedis.set(value)
        }
        return value
    }

    override async delete(type?:keyof IServer_Common_Event_Types) {
        await Promise.all([
            super.delete("projectDelete"),
            moduleMapper.deleteByProjectId(this.item.id),
            labelMapper.deleteByProjectId(this.item.id),
            rpcAuthApi.clearRoleByItemId(this.item.id),
            ProjectIssueService.clearByProjectIds([this.item.id]),
            releaseMapper.clear(this.item.id),
            issueTypeSolutionMapper.clearProjects([this.item.id]),
            BoardService.clearByProjectId(this.getId()),
            planMapper.clearByProjects([this.item.id])
        ])
    }

    override async create(issueTypeSolutionId?:string): Promise<ICommon_Model_Project> {
        let ret=await super.create();
        let role=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.PROJECT)
        if(role) {
            await rpcAuthApi.addRoleMember(this.getId(),role,ECommon_Model_Organization_Member_Type.USER,this.getItem().created_by)
        }
        if(issueTypeSolutionId) {
            let obj=await IssueTypeSolutionService.getItemById(issueTypeSolutionId)
            if(!obj) {
                throw Err.Project.Issue.issueTypeSolutionNotFound
            }
            await obj.bindProject(this.getId())
        } else {
            let issueTypeSolution=await IssueTypeSolutionService.getReservedItem(ret.organization_id)
            if(issueTypeSolution) {
                await issueTypeSolution.bindProject(this.getId())
            }
        }
        return ret;
    }

    async listMember(memberType:ECommon_Model_Organization_Member_Type,page:number,size:number,key:string){
        let ret=await rpcAuthApi.listRoleMember(this.getId(),ECommon_Model_Role_Type.PROJECT,memberType,page,size,key);
        return ret;
    }

    async addMember(memberId:string, type:ECommon_Model_Organization_Member_Type, roleId:string) {
        let ret=await rpcAuthApi.addRoleMember(this.getId(),roleId,type,memberId)
        emitServiceEvent("projectMemberAdd",this.getId(),memberId)
        return ret;
    }

    async removeMember(memberId:string,type:ECommon_Model_Organization_Member_Type){
        await rpcAuthApi.removeRoleMember(this.getId(),type,memberId)
        emitServiceEvent("projectMemberDelete",this.getId(),memberId)
    }

    async editMember(memberId:string,type:ECommon_Model_Organization_Member_Type,roleId:string){
       if(this.getItem().created_by==memberId) {
            throw Err.Role.roleChangeForbidden
        }
        let ret=await rpcAuthApi.changeRoleMember(this.item.id,roleId,type,memberId)
        emitServiceEvent("projectMemberEdit",this.getId(),memberId)
        return ret;
    }

    static async list(organizationId:string,page:number,size:number,keyword?:string,organizationUserId?:string):Promise<ICommon_Route_Res_Project_List>{
        let ret=await projectMapper.list(organizationId,page,size,keyword,organizationUserId)
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            page:page,
            data:ret.data
        }
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
        let node=await WorkflowService.getFirstNode(issueTypeId)
        return node
    }

    async getBindIssueTypeSolution() {
        let issueTypeSolution=await IssueTypeSolutionService.getObjByProjectId(this.getId())
        return issueTypeSolution
    }

    async getFirstNodeFields(issueTypeId:string){
        let node=await this.getFirstNodeInfo(issueTypeId);
        if(!node) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let ret=await WorkflowNodeFieldTypeService.listWorkflowNodeField(node.id);
        return ret;
    }

    static async getObjByKeyword(keyword:string) {
        let item=await projectMapper.getItemByKeyword(keyword) 
        if(item) {
            let obj=new ProjectService()
            obj.setItem(item)
            return obj;
        } else {
            return null
        }
    }

    static async recentProjectList(organizationUserId:string) {
        let ret=await projectMapper.recentProjectList(organizationUserId)
        return ret
    }

    static async userProjectList(organizationId:string,organizationUserId:string,page:number,size:number,type:"all"|"created"|"joined",keyword?:string,sort?:"name"|"created_time") {
        let ret=await projectMapper.userProjectList(organizationId,organizationUserId,page,size,type,keyword,sort)
        return ret
    }

    static async getProjectListByOrganizationId(organizationId:string) {
        let ret=await projectMapper.getProjectListByOrganizationId(organizationId);
        return ret;
    }

    static async clearProjects(projectIds:string[]) {
        await Promise.all([
            projectMapper.clearProjects(projectIds),
            moduleMapper.deleteByProjectIds(projectIds),
            labelMapper.deleteByProjectIds(projectIds),
            rpcAuthApi.clearRoleByItemIds(projectIds),
            ProjectIssueService.clearByProjectIds(projectIds),
            releaseMapper.clearByProjectIds(projectIds),
            issueTypeSolutionMapper.clearProjects(projectIds),
            BoardService.clearByProjectIds(projectIds),
            planMapper.clearByProjects(projectIds)
        ])
    }

    async listRole(){
        let ret=await rpcAuthApi.listRole(this.getId(),ECommon_Model_Role_Type.PROJECT);
        return ret;
    }

    static async listGlobalRole(organizationId:string) {
        let ret=await rpcAuthApi.listRole(organizationId,ECommon_Model_Role_Type.PROJECT);
        return ret;
    }

    async createRole(name :string,
                     description:string,
                     value:number){
        let ret=await rpcAuthApi.createRole({
            name,
            description,
            item_id:this.getId(),
            organization_id:this.item.organization_id,
            type:ECommon_Model_Role_Type.PROJECT,
            reserved:ECommon_Model_Role_Reserved.NORMAL,
            value:value
        });
        return ret;
    }

    static async createGlobalRole(organizationId:string,name:string,description:string,value: number) {
        let ret=await rpcAuthApi.createRole({
            name,
            description,
            organization_id:organizationId,
            type:ECommon_Model_Role_Type.PROJECT,
            reserved:ECommon_Model_Role_Reserved.NORMAL,
            value
        })
        return ret;
    }

    async editRole(roleId:string,name:string,description:string,value:number){
        let ret=await rpcAuthApi.updateRole({
            id:roleId,
            name,
            description,
            value:value
        });
        return ret;
    }

    async removeRole(roleId:string){
        let ret=await rpcAuthApi.removeRole(roleId);
        return ret;
    }

    async issueCount() {
        let ret=await projectMapper.issueCount(this.getId())
        return ret;
    }

    static async clearMember(organizationUserId:string) {
        let objOrganization=await rpcUserApi.organizationUser(organizationUserId)
        let objDeletedUser=await rpcUserApi.getDeletedOrganizationUser(objOrganization.organization_id)
        await projectMapper.updateMember(organizationUserId,objDeletedUser.id)
    }
}