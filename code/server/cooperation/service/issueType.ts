import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import ProjectService from "../service/project";
import { issueTypeModel } from './../../../common/model/issue_type';
import { ICommon_Model_Issue_Type_Solution, issueTypeSolutionModel } from './../../../common/model/issue_type_solution';
import { ICommon_Route_Res_IssueTypeSolution_List_Item } from './../../../common/routes/response';
import { issueTypeMapper, issueTypeSolutionMapper } from './../mapper/issueType';
import WorkflowService, { WorkflowSolutionService } from './workflow';
export default class IssueType extends Entity<typeof issueTypeModel,typeof issueTypeMapper> {
    constructor(){
        super(issueTypeMapper)
    }
    static async list(){
        let ret=await issueTypeMapper.list()
        return ret;
    }
    override async delete() {
        await super.delete()
        await issueTypeMapper.deleteFromSolution(this.getId());
        await WorkflowSolutionService.clearIssueType(this.getId())
    }
}

export class IssueTypeSolutionService extends Entity<typeof issueTypeSolutionModel,typeof issueTypeSolutionMapper> {
    constructor(){
        super(issueTypeSolutionMapper)
    }
    override async copy():Promise<this> {
        let arr=await issueTypeSolutionMapper.getIssueTypesBySolutionId(this.getId());
        let obj=await super.copy()
        for(let o of arr) {
            await issueTypeSolutionMapper.addIssueType(o.id,obj.getId());
        }
        let objWorkflowSolution=await WorkflowSolutionService.getItemByIssueTypeSolutionId(this.getId())
        if(objWorkflowSolution) {
            await objWorkflowSolution.bindIssueTypeSolutions([obj.getId()])
        }
        return obj;
    }
    override async create():Promise<ICommon_Model_Issue_Type_Solution> {
        let ret=await super.create();
        let objWorkflowReserved=await WorkflowSolutionService.getReservedItem()
        objWorkflowReserved.bindIssueTypeSolutions([this.getId()])
        return ret;
    }

    override async update():Promise<ICommon_Model_Issue_Type_Solution> {
        let ret=await super.update();
        return ret;
    }

    override async delete() {
        await super.delete()
        let objWorkflowSolution=await WorkflowSolutionService.getItemByIssueTypeSolutionId(this.getId())
        if(objWorkflowSolution) {
            await objWorkflowSolution.unbindIssueTypeSolutions([this.getId()]);
        }
        await issueTypeSolutionMapper.resetProjects(this.getId());
    }

    static async list(){
        let ret=await issueTypeSolutionMapper.list()
        let arr:ICommon_Route_Res_IssueTypeSolution_List_Item[]=[]
        for(let obj of ret) {
            arr.push({
                ...obj,
                projectList:(await issueTypeSolutionMapper.projectList(obj.id)).map(item=>{ return {
                    id:item.id,
                    photo:item.photo,
                    name:item.name,
                    description:item.description
                }}),
                issueTypeList:await issueTypeSolutionMapper.getIssueTypesBySolutionId(obj.id)
            })
        }
        return arr;
    }

    static async getInfoById(id: string): Promise<ICommon_Route_Res_IssueTypeSolution_List_Item> {
        let ret=await IssueTypeSolutionService.getItemById(id);
        if(!ret){
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        return {
            ...ret.getItem(),
            issueTypeList:await issueTypeSolutionMapper.getIssueTypesBySolutionId(id),
            projectList:await issueTypeSolutionMapper.projectList(id)
        }
    }

    async issueTypeList() {
        let ret=await issueTypeSolutionMapper.getIssueTypesBySolutionId(this.getId())
        return ret;
    }

    async addIssueType(issueTypeId:string) {
        await issueTypeSolutionMapper.addIssueType(issueTypeId,this.getId())
        let objWorkflowSolution=await WorkflowSolutionService.getItemByIssueTypeSolutionId(this.getId())
        if(objWorkflowSolution) {
            let reserved=await WorkflowService.getReservedItem()
            await objWorkflowSolution.assign(issueTypeId,reserved.getId(),this.getId())
        }
    }

    async removeIssueType(issueTypeId:string) {
        await issueTypeSolutionMapper.removeIssueType(issueTypeId,this.getId())
        let objWorkflowSolution=await WorkflowSolutionService.getItemByIssueTypeSolutionId(this.getId())
        if(objWorkflowSolution) {
            await objWorkflowSolution.deleteIssueType(issueTypeId,this.getId())
        }
    }

    static async getReservedItem() {
        let obj=await issueTypeSolutionMapper.getReservedItem()
        let ret=new IssueTypeSolutionService
        ret.setItem(obj)
        return ret;
    }

    async bindProject(projectId:string) {
        let objProject=await ProjectService.getItemById(projectId)
        if(!objProject) {
            throw Err.Project.projectNotFound
        }
        let objExist=await IssueTypeSolutionService.getObjByProjectId(projectId)
        if(objExist) {
            await issueTypeSolutionMapper.updateProject(this.getId(),projectId)
        } else {
            await issueTypeSolutionMapper.bindProject(this.getId(),projectId)
        }
        
    }

    async unbindProject(projectId:string) {
        let objProject=await ProjectService.getItemById(projectId)
        if(!objProject) {
            throw Err.Project.projectNotFound
        }
        await issueTypeSolutionMapper.unbindProject(this.getId(),projectId)
    }

    async projectList():Promise<{
        id:string,
        name:string,
        photo:string,
        description:string
    }[]> {
        let ret=await issueTypeSolutionMapper.projectList(this.getId())
        return ret.map(item=>{
            return {
                id:item.id,
                name:item.name,
                photo:item.photo,
                description:item.description
            }
        });
    }

    static async getObjByProjectId(projectId:string) {
        let objProject=await ProjectService.getItemById(projectId)
        if(!objProject) {
            throw Err.Project.projectNotFound
        }
        let obj=await issueTypeSolutionMapper.getItemByProjectId(projectId)
        if(obj) {
            let ret=new IssueTypeSolutionService
            ret.setItem(obj)
            return ret;
        } else {
            return null;
        }
        
    }
}