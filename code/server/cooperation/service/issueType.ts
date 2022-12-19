import {Err} from "../../../common/status/error";
import {Entity} from "../../common/entity/entity";
import {ProjectService} from "../service/project";
import {issueTypeModel} from './../../../common/model/issue_type';
import {issueTypeSolutionModel} from './../../../common/model/issue_type_solution';
import {ICommon_Route_Res_IssueTypeSolution_List_Item} from './../../../common/routes/response';
import {issueTypeMapper, issueTypeSolutionMapper} from './../mapper/issueType';
import {WorkflowService} from "./workflow";

export  class IssueTypeService extends Entity<typeof issueTypeModel,typeof issueTypeMapper> {
    constructor(){
        super(issueTypeMapper)
    }
    static async list(issueTypeSolutionId:string){
        let ret=await issueTypeMapper.list(issueTypeSolutionId)
        return ret;
    }
    override async delete() {
        await super.delete()
        await WorkflowService.delete(this.getId());
    }

    override async copy(deletedFields?: (keyof typeof issueTypeModel["model"])[], updatedFields?: { [name in keyof typeof issueTypeModel["model"]]?: typeof issueTypeModel["model"][name] }): Promise<this> {
        let obj=await super.copy(deletedFields, updatedFields);
        await WorkflowService.copy(this.getId(),obj.getId());
        return obj;
    }

    static async init(issueTypeSolutionId:string):Promise<{
        taskId:string,
        bugId:string,
        ticketId:string
    }> {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let objTask=new IssueTypeService();
        objTask.assignItem({
            name:"Task",
            reserved:1,
            issue_type_solution_id:issueTypeSolutionId
        })
        await objTask.create();
        let objBug=new IssueTypeService;
        objBug.assignItem({
            name:"Bug",
            reserved:1,
            issue_type_solution_id:issueTypeSolutionId
        })
        await objBug.create();
        let objTicket=new IssueTypeService;
        objTicket.assignItem({
            name:"Ticket",
            reserved:1,
            issue_type_solution_id:issueTypeSolutionId
        })
        await objTicket.create();
        return {
            taskId:objTask.getId(),
            bugId:objBug.getId(),
            ticketId:objTicket.getId()
        };
    }
}

export class IssueTypeSolutionService extends Entity<typeof issueTypeSolutionModel,typeof issueTypeSolutionMapper> {
    constructor(){
        super(issueTypeSolutionMapper)
    }

    override async copy(deletedFields?: (keyof typeof issueTypeSolutionModel["model"])[], updatedFields?: { [name in keyof typeof issueTypeSolutionModel["model"]]?: typeof issueTypeSolutionModel["model"][name] }): Promise<this> {
        let obj=await super.copy(deletedFields, updatedFields);
        let list=await this.issueTypeList();
        let arr=[]
        for(let o of list) {
            let objIssueType=await IssueTypeService.getItemById(o.id);
            arr.push(objIssueType.copy(null,{
                issue_type_solution_id:obj.getId()
            }))
        }
        await Promise.all(arr)
        return obj;
    }

    override async delete() {
        await super.delete()
        await issueTypeSolutionMapper.resetProjects(this.getId(),this.getItem().organization_id);
        let list=await this.issueTypeList();
        let arr=[];
        for(let obj of list) {
            let o=await IssueTypeService.getItemById(obj.id);
            arr.push(o.delete())
        }
        await Promise.all(arr)
    }

    static async list(organizationId:string){
        let ret=await issueTypeSolutionMapper.list(organizationId)
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
                issueTypeList:await issueTypeMapper.list(obj.id)
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
            issueTypeList:await issueTypeMapper.list(id),
            projectList:await issueTypeSolutionMapper.projectList(id)
        }
    }


    static async getReservedItem(organizationId:string) {
        let obj=await issueTypeSolutionMapper.getReservedItem(organizationId)
        if(!obj) {
            return null;
        }
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
        await issueTypeSolutionMapper.unbindProject(this.getId(),projectId,this.getItem().organization_id)
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

    static async clearByOrganizationId(organizationId:string):Promise<string[]> {
        let ret=await issueTypeSolutionMapper.clearByOrganizationId(organizationId)
        return ret;
    }

    static async getIssueTypesByOrganizationId(organizationId:string):Promise<string[]> {
        let ret=await issueTypeSolutionMapper.clearByOrganizationId(organizationId)
        return ret;
    }

    static async init(organizationId:string):Promise<{
        solutionId:string,
        solutionName:string
    }> {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let objSolution=new IssueTypeSolutionService;
        objSolution.assignItem({
            name:"Default",
            description:"Default",
            reserved:1,
            organization_id:organizationId
        })
        await objSolution.create()
        await IssueTypeService.init(objSolution.getId());
        return {
            solutionId:objSolution.getId(),
            solutionName:objSolution.getItem().name
        }
    }

    async issueTypeList() {
        let ret=await issueTypeMapper.list(this.getId());
        return ret;
    }


}