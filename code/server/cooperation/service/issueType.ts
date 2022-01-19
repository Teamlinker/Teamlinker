import { ICommon_Route_Res_IssueTypeSolution_Info } from "../../../common/routes/response";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { issueTypeModel } from './../../../common/model/issue_type';
import { ICommon_Model_Issue_Type_Solution, issueTypeSolutionModel } from './../../../common/model/issue_type_solution';
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

    override async create():Promise<ICommon_Model_Issue_Type_Solution> {
        let ret=await super.create();
        let objWorkflowSolution=new WorkflowSolutionService()
        objWorkflowSolution.assignItem({
            name:this.getItem().name,
            description:this.getItem().description,
            issue_type_solution_id:this.getId()
        })
        await objWorkflowSolution.create()
        return ret;
    }

    override async update():Promise<ICommon_Model_Issue_Type_Solution> {
        let ret=await super.update();
        let objWorkflowSolution=await WorkflowSolutionService.getItemByIssueSolutionId(this.getId())
        objWorkflowSolution.assignItem({
            name:this.getItem().name
        })
        if(objWorkflowSolution) {
            await objWorkflowSolution.update()
        }
        return ret;
    }

    override async delete() {
        await super.delete()
        let objWorkflowSolution=await WorkflowSolutionService.getItemByIssueSolutionId(this.getId())
        if(objWorkflowSolution) {
            await objWorkflowSolution.delete()
        }
    }

    static async list(){
        let ret=await issueTypeSolutionMapper.list()
        return ret;
    }

    static async getInfoById(id: string): Promise<ICommon_Route_Res_IssueTypeSolution_Info> {
        let ret=await IssueTypeSolutionService.getItemById(id);
        if(!ret){
            throw Err.Project.Issue.issueTypeNotFound
        }
        return {
            ...ret.getItem(),
            data:await issueTypeSolutionMapper.getIssueTypesBySolutionId(id)
        }
    }

    async addIssueType(issueTypeId:string) {
        await issueTypeSolutionMapper.addIssueType(issueTypeId,this.getId())
        let objWorkflowSolution=await WorkflowSolutionService.getItemByIssueSolutionId(this.getId())
        if(objWorkflowSolution) {
            let reserved=await WorkflowService.getReservedItem()
            await objWorkflowSolution.assign(issueTypeId,reserved.getId())
        }
    }

    async removeIssueType(issueTypeId:string) {
        await issueTypeSolutionMapper.removeIssueType(issueTypeId,this.getId())
        let objWorkflowSolution=await WorkflowSolutionService.getItemByIssueSolutionId(this.getId())
        if(objWorkflowSolution) {
            await objWorkflowSolution.deleteIssueType(issueTypeId)
        }
    }
}