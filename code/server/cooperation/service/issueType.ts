import { Entity } from "../../common/entity/entity";
import { issueTypeModel } from './../../../common/model/issue_type';
import { issueTypeMapper } from './../mapper/issueType';
export default class IssueType extends Entity<typeof issueTypeModel,typeof issueTypeMapper> {
    constructor(){
        super(issueTypeMapper)
    }
    static async list(){
        let ret=await issueTypeMapper.list()
        return ret;
    }
}