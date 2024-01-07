import {Err} from "../../../common/status/error";
import {Entity} from "../../common/entity/entity";
import {ProjectService} from "../service/project";
import {ICommon_Model_Issue_Type, issueTypeModel} from './../../../common/model/issue_type';
import {ICommon_Model_Issue_Type_Solution, issueTypeSolutionModel} from './../../../common/model/issue_type_solution';
import {ICommon_Route_Res_IssueTypeSolution_List_Item} from './../../../common/routes/response';
import {issueTypeMapper, issueTypeSolutionMapper} from './../mapper/issueType';
import {WorkflowService} from "./workflow";
import {projectIssueMapper} from "../mapper/issue";
import {IServer_Common_Event_Types} from "../../common/event/types";
import {ProjectIssueService} from "./issue";
import {boardMapper} from "../mapper/board";
import * as i18next from "i18next";

export  class IssueTypeService extends Entity<typeof issueTypeModel,typeof issueTypeMapper> {
    constructor(){
        super(issueTypeMapper)
    }

    override async create(lang:string): Promise<typeof issueTypeModel["model"]> {
        let obj=await super.create();
        await WorkflowService.init(obj.id,lang);
        return obj
    }

    static async list(issueTypeSolutionId:string){
        let ret=await issueTypeMapper.list(issueTypeSolutionId)
        return ret;
    }

    override async delete(eventPublish?:keyof IServer_Common_Event_Types,convertIssueTypeId?:string) {
        if(convertIssueTypeId) {
            await Promise.all([
                projectIssueMapper.clearBeforeConvertByIssueTypeId(this.getId()),
                projectIssueMapper.updateConvertIssueType({
                    [this.getId()]:convertIssueTypeId
                })
            ])
        } else {
            await ProjectIssueService.clearByIssueTypeId(this.getId())
        }
        await super.delete()
        await WorkflowService.delete(this.getId());
    }

    override async copy(deletedFields?: (keyof typeof issueTypeModel["model"])[], updatedFields?: { [name in keyof typeof issueTypeModel["model"]]?: typeof issueTypeModel["model"][name] }): Promise<this> {
        let obj=await super.copy(deletedFields, updatedFields);
        await WorkflowService.copy(this.getId(),obj.getId());
        return obj;
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

    override async delete(eventPublish?:keyof IServer_Common_Event_Types,relationship?:{
        [id:string]:string
    }) {
        let arrIssueType=await this.issueTypeList()
        if(arrIssueType.length>0 && !relationship) {
            throw Err.Project.Issue.issueTypeSolutionConvertMissRelationship
        }
        await super.delete()
        if(relationship) {
            let arrProject=await this.projectList(0,10000)
            let arrPromise=[]
            arrProject.data.forEach(project=>{
                arrPromise.push(this.unbindProject(project.id,relationship))
            })
            await Promise.all(arrPromise)
        } else {
            await issueTypeSolutionMapper.resetProjects(this.getId(),this.getItem().organization_id);
        }
        let arr=[];
        for(let obj of arrIssueType) {
            arr.push((async ()=>{
                let o=await IssueTypeService.getItemById(obj.id);
                await o.delete()
            })())
        }
        await Promise.all(arr)
    }

    static async list(organizationId:string){
        let ret=await issueTypeSolutionMapper.list(organizationId)
        let arr:ICommon_Route_Res_IssueTypeSolution_List_Item[]=[]
        let arrPromise=[]
        for(let obj of ret) {
            arrPromise.push((async ()=>{
                let item={...obj} as ICommon_Route_Res_IssueTypeSolution_List_Item
                arr.push(item)
                item.issueTypeList=await issueTypeMapper.list(obj.id)
            })())
        }
        await Promise.all(arrPromise);
        return arr;
    }

    static async getInfoById(id: string): Promise<ICommon_Route_Res_IssueTypeSolution_List_Item> {
        let ret=await IssueTypeSolutionService.getItemById(id);
        if(!ret){
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        return {
            ...ret.getItem(),
            issueTypeList:await issueTypeMapper.list(id)
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

    async bindProject(projectId:string,relationship?:{
        [id:string]:string
    }) {
        let objProject=await ProjectService.getItemById(projectId)
        if(!objProject) {
            throw Err.Project.projectNotFound
        }
        let count=await objProject.issueCount()
        if(count>0 && !relationship) {
            throw Err.Project.ProjectIssue.issueShouldEmpty
        }
        if(count!=0) {
            await Promise.all([
                projectIssueMapper.clearBeforeConvertByProjectId(projectId),
                projectIssueMapper.updateConvertIssueType(relationship,projectId)
            ])
        }
        if(relationship) {
            await boardMapper.updateIssueType(relationship,projectId)
        }
        let objExist=await IssueTypeSolutionService.getObjByProjectId(projectId)
        if(objExist) {
            await issueTypeSolutionMapper.updateProject(this.getId(),projectId)
        } else {
            await issueTypeSolutionMapper.bindProject(this.getId(),projectId)
        }
    }

    async unbindProject(projectId:string,relationship?:{
        [id:string]:string
    }) {
        let objProject=await ProjectService.getItemById(projectId)
        if(!objProject) {
            throw Err.Project.projectNotFound
        }
        let count=await objProject.issueCount()
        if(count>0 && !relationship) {
            throw Err.Project.ProjectIssue.issueShouldEmpty
        }
        if(count!=0) {
            await Promise.all([
                projectIssueMapper.clearBeforeConvertByProjectId(projectId),
                projectIssueMapper.updateConvertIssueType(relationship,projectId)
            ])
        }
        if(relationship) {
            await boardMapper.updateIssueType(relationship,projectId)
        }
        await issueTypeSolutionMapper.unbindProject(this.getId(),projectId,this.getItem().organization_id)
    }

    async projectList(page:number,size:number,keyword?:string) {
        let ret=await issueTypeSolutionMapper.projectList(this.getId(),page,size,keyword)
        return ret
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

    static async init(organizationId:string,lang:string):Promise<{
        solution:ICommon_Model_Issue_Type_Solution,
        issueTypeMap:{
            [type in "task"|"bug"|"ticket"]:ICommon_Model_Issue_Type
        }
    }> {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let objSolution=new IssueTypeSolutionService;
        objSolution.assignItem({
            name:i18next.getFixedT(lang)("backend.default"),
            description:i18next.getFixedT(lang)("backend.default"),
            reserved:1,
            organization_id:organizationId
        })
        await objSolution.create()
        let objTask=new IssueTypeService();
        objTask.assignItem({
            name:i18next.getFixedT(lang)("backend.task"),
            reserved:1,
            issue_type_solution_id:objSolution.getId()
        })
        let objBug=new IssueTypeService;
        objBug.assignItem({
            name:i18next.getFixedT(lang)("backend.bug"),
            reserved:1,
            issue_type_solution_id:objSolution.getId()
        })
        let objTicket=new IssueTypeService;
        objTicket.assignItem({
            name:i18next.getFixedT(lang)("backend.ticket"),
            reserved:1,
            issue_type_solution_id:objSolution.getId()
        })
        await Promise.all([objTask.create(lang),objBug.create(lang),objTicket.create(lang)])
        return {
            solution:objSolution.getItem(),
            issueTypeMap:{
                task:objTask.getItem(),
                bug:objBug.getItem(),
                ticket:objTicket.getItem()
            }
        }
    }

    async issueTypeList() {
        let ret=await issueTypeMapper.list(this.getId());
        return ret;
    }


}