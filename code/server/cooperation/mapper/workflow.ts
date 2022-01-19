import { ICommon_Model_Issue_Type } from "../../../common/model/issue_type";
import { workflowSolutionModel } from "../../../common/model/workflow_solution";
import { workflowSolutionIssueTypeWorkflowModel } from "../../../common/model/workflow_solution_issue_type_workflow";
import { Err } from '../../../common/status/error';
import { keys } from "../../../common/transform";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateCreateSql, generateDeleteSql, generateLeftJoin2Sql, generateQuerySql, generateSnowId, generateUpdateSql } from "../../common/util/sql";
import { issueTypeModel } from './../../../common/model/issue_type';
import { ICommon_Model_Workflow, workflowModel } from './../../../common/model/workflow';
import { ICommon_Model_Workflow_Action, workflowActionModel } from './../../../common/model/workflow_action';
import { ECommon_Model_Workflow_Node_Status, ICommon_Model_Workflow_Node, workflowNodeModel } from './../../../common/model/workflow_node';
import { ICommon_Model_Workflow_Solution } from './../../../common/model/workflow_solution';
class WorkflowMapper extends Mapper<typeof workflowModel> {
    constructor() {
        super(workflowModel)
    }
    async getReservedItem() {
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowModel,[],{
            reserved:1
        }))
        return ret;
    }
    async list():Promise<ICommon_Model_Workflow[]>
    {
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowModel,[],null,null,{
            field:"name",
            type:"asc"
        }))
        return ret;
    }
    async nodeList(workflowId:string):Promise<ICommon_Model_Workflow_Node[]>{
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowNodeModel,[],{
            workflow_id:workflowId
        }))
        return ret;
    }
    async actionList(workflowId:string):Promise<ICommon_Model_Workflow_Action[]>{
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowActionModel,[],{
            workflow_id:workflowId
        }))
        return ret;
    }

}
export let workflowMapper=new WorkflowMapper

class WorkflowSolutionMapper extends Mapper<typeof workflowSolutionModel> {
    constructor() {
        super(workflowSolutionModel)
    }
    async list():Promise<ICommon_Model_Workflow_Solution[]>
    {
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowSolutionModel,[],null,null,{
            field:"name",
            type:"asc"
        }))
        return ret;
    }
    async getItemByIssueSolutionId(issueSolutionId:string) {
        if(!issueSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowSolutionModel,[],{
            issue_type_solution_id:issueSolutionId
        }))
        return ret;
    }
    async items(workflowSolutionId:string):Promise<{
        issueType:ICommon_Model_Issue_Type,
        workflow:ICommon_Model_Workflow
    }[]> {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin2Sql({
            model:workflowSolutionIssueTypeWorkflowModel
        },{
            model:issueTypeModel,
            columns:keys<ICommon_Model_Issue_Type>().map(item=>item.name),
            expression:{
                id:{
                    model:workflowSolutionIssueTypeWorkflowModel,
                    field:"issue_type_id"
                }
            },
            aggregation:"issueType"
        },{
            model:workflowModel,
            columns:keys<ICommon_Model_Workflow>().map(item=>item.name),
            expression:{
                id:{
                    model:workflowSolutionIssueTypeWorkflowModel,
                    field:"workflow_id"
                }
            },
            aggregation:"workflow"
        },{
            workflow_solution_id:{
                model:workflowSolutionIssueTypeWorkflowModel,
                value:workflowSolutionId
            }
        });
        let ret=await mysql.execute(sql);
        return ret;
    }
    async assign(workflowSolutionId:string,workflowId:string,issueTypeId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(workflowSolutionIssueTypeWorkflowModel,[],{
            workflow_solution_id:workflowSolutionId,
            issue_type_id:issueTypeId
        }))
        if(obj) {
            await mysql.execute(generateUpdateSql(workflowSolutionIssueTypeWorkflowModel,{
                workflow_id:workflowId
            },{
                workflow_solution_id:workflowSolutionId,
                issue_type_id:issueTypeId
            }))
        } else {
            let id=await generateSnowId();
            await mysql.execute(generateCreateSql(workflowSolutionIssueTypeWorkflowModel,{
                id:id,
                workflow_id:workflowId,
                workflow_solution_id:workflowSolutionId,
                issue_type_id:issueTypeId
            }))
        }
    }

    async deleteItems(workflowSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionIssueTypeWorkflowModel,{
            workflow_solution_id:workflowSolutionId
        }))
    }

    async deleteIssueType(workflowSolutionId:string,issueTypeId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionIssueTypeWorkflowModel,{
            workflow_solution_id:workflowSolutionId,
            issue_type_id:issueTypeId
        }))
    }

    async clearIssueType(issueTypeId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionIssueTypeWorkflowModel,{
            issue_type_id:issueTypeId
        }))
    }
}
export let workflowSolutionMapper=new WorkflowSolutionMapper

class WorkflowNodeMapper extends Mapper<typeof workflowNodeModel> {
    constructor() {
        super(workflowNodeModel)
    }
    async getOpenNode(workflowId:string) {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeModel,[],{
            status:ECommon_Model_Workflow_Node_Status.NOTSTART,
            workflow_id:workflowId
        }))
        return ret;
    }
}

export let workflowNodeMapper=new WorkflowNodeMapper

class WorkflowActionMapper extends Mapper<typeof workflowActionModel> {
    constructor() {
        super(workflowActionModel)
    }
}

export let workflowActionMapper=new WorkflowActionMapper