import { workflowSolutionIssueTypeWorkflowModel } from "../../../common/model/workflow_solution_issue_type_workflow";
import { Err } from "../../../common/status/error";
import { keys } from "../../../common/transform";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateCreateSql, generateDeleteSql, generateLeftJoinSql, generateQuerySql, generateSnowId } from "../../common/util/sql";
import { ICommon_Model_Issue_Type, issueTypeModel } from './../../../common/model/issue_type';
import { ICommon_Model_Issue_Type_Solution, issueTypeSolutionModel } from './../../../common/model/issue_type_solution';
import { issueTypeSolutionIssueTypeModel } from './../../../common/model/issue_type_solution_issue_type';
class IssueTypeMapper extends Mapper<typeof issueTypeModel> {
    constructor() {
        super(issueTypeModel)
    }
    async list():Promise<ICommon_Model_Issue_Type[]>
    {
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(issueTypeModel,[],null,null,{
            field:"name",
            type:"asc"
        }))
        return ret;
    }
    async deleteFromSolution(issueTypeId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(issueTypeSolutionIssueTypeModel,{
            issue_type_id:issueTypeId
        }))
    }
}
export let issueTypeMapper=new IssueTypeMapper

class IssueTypeSolutionMapper extends Mapper<typeof issueTypeSolutionModel> {
    constructor() {
        super(issueTypeSolutionModel)
    }
    async list():Promise<ICommon_Model_Issue_Type_Solution[]>
    {
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(issueTypeSolutionModel,[],null,null,{
            field:"name",
            type:"asc"
        }))
        return ret;
    }

    async getIssueTypesBySolutionId(issueTypeSolutionId:string):Promise<ICommon_Model_Issue_Type[]>{
        let mysql=getMysqlInstance()
        let fields=keys<ICommon_Model_Issue_Type>().map(item=>item.name);
        let sql=generateLeftJoinSql({
            model:issueTypeSolutionIssueTypeModel
        },{
            model:issueTypeModel,
            columns:fields,
            expression:{
                id:{
                    model:issueTypeSolutionIssueTypeModel,
                    field:"issue_type_id"
                }
            }
        },{
            issue_type_solution_id:{
                model:issueTypeSolutionIssueTypeModel,
                value:issueTypeSolutionId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async addIssueType(issueTypeId:string,issueTypeSolutionId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        } else if (!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(issueTypeSolutionIssueTypeModel,[],{
            issue_type_id:issueTypeId,
            issue_type_solution_id:issueTypeSolutionId
        }))
        if(ret) {
            throw Err.Project.Issue.issueTypeSolutionExists
        }
        await mysql.execute(generateCreateSql(issueTypeSolutionIssueTypeModel,{
            id:await generateSnowId(),
            issue_type_id:issueTypeId,
            issue_type_solution_id:issueTypeSolutionId
        }))
    }

    async removeIssueType(issueTypeId:string,issueTypeSolutionId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        } else if (!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(issueTypeSolutionIssueTypeModel,{
            issue_type_id:issueTypeId,
            issue_type_solution_id:issueTypeSolutionId
        }))
        await mysql.execute(generateDeleteSql(workflowSolutionIssueTypeWorkflowModel,{
            issue_type_id:issueTypeId
        }))
    }
}
export let issueTypeSolutionMapper=new IssueTypeSolutionMapper
