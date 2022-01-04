import { ICommon_Route_Res_IssueTypeSolution_Info } from "../../../common/routes/response";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { issueTypeModel } from './../../../common/model/issue_type';
import { issueTypeSolutionModel } from './../../../common/model/issue_type_solution';
import { issueTypeMapper, issueTypeSolutionMapper } from './../mapper/issueType';
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
    }
}

export class IssueTypeSolutionService extends Entity<typeof issueTypeSolutionModel,typeof issueTypeSolutionMapper> {
    constructor(){
        super(issueTypeSolutionMapper)
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
    }

    async removeIssueType(issueTypeId:string) {
        await issueTypeSolutionMapper.removeIssueType(issueTypeId,this.getId())
    }
}