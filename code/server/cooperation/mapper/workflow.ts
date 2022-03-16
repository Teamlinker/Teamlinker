import { ICommon_Model_Issue_Type } from "../../../common/model/issue_type";
import { workflowSolutionModel } from "../../../common/model/workflow_solution";
import { workflowSolutionIssueTypeSolutionModel } from "../../../common/model/workflow_solution_issue_type_solution";
import { workflowSolutionWorkflowModel } from "../../../common/model/workflow_solution_workflow";
import { workflowSolutionWorkflowIssueTypeModel } from "../../../common/model/workflow_solution_workflow_issue_type";
import { Err } from '../../../common/status/error';
import { keys } from "../../../common/transform";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateCreateSql, generateDeleteSql, generateLeftJoin2Sql, generateLeftJoinSql, generateQuerySql, generateSnowId, generateUpdateSql } from "../../common/util/sql";
import { issueTypeModel } from './../../../common/model/issue_type';
import { ICommon_Model_Issue_Type_Solution, issueTypeSolutionModel } from './../../../common/model/issue_type_solution';
import { issueTypeSolutionIssueTypeModel } from './../../../common/model/issue_type_solution_issue_type';
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

    async revoke(workflowId:string) {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let objWorkflow=await workflowMapper.getReservedItem()
        await mysql.execute(generateUpdateSql(workflowSolutionWorkflowIssueTypeModel,{
            workflow_id:objWorkflow.id
        },{
            workflow_id:workflowId
        }))
    }

    async checkNode(workflowId:string,workflowNodeId:string):Promise<boolean> {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeModel,["id"],{
            workflow_id:workflowId,
            id:workflowNodeId
        }))
        return ret!=null
    }

    async checkAction(workflowId:string,workflowActionId:string):Promise<boolean> {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!workflowActionId) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowActionModel,["id"],{
            workflow_id:workflowId,
            id:workflowActionId
        }))
        return ret!=null
    }

}
export let workflowMapper=new WorkflowMapper

class WorkflowSolutionMapper extends Mapper<typeof workflowSolutionModel> {
    constructor() {
        super(workflowSolutionModel)
    }
    async getReservedItem() {
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowSolutionModel,[],{
            reserved:1
        }))
        return ret;
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
    async getItemByIssueTypeSolutionId(issueSolutionId:string) {
        if(!issueSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowSolutionIssueTypeSolutionModel,[],{
            issue_type_solution_id:issueSolutionId
        }))
        if(!ret) {
            throw Err.Project.Workflow.workflowSolutionNotBindIssueTypeSolution
        }
        let obj=await mysql.executeOne(generateQuerySql(workflowSolutionModel,[],{
            id:ret.workflow_solution_id
        }))
        return obj;
    }
    async bindIssueTypeSolutionList(workflowSolutionId:string,issueTypeSolutionIds:string[]) {
        if(!issueTypeSolutionIds || issueTypeSolutionIds.length==0) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let workflowId=(await workflowMapper.getReservedItem()).id;
        for(let issueTypeSolutionId of issueTypeSolutionIds) {
            await mysql.execute(generateCreateSql(workflowSolutionIssueTypeSolutionModel,{
                id:await generateSnowId(),
                workflow_solution_id:workflowSolutionId,
                issue_type_solution_id:issueTypeSolutionId
            }))
            let arr=await mysql.execute(generateQuerySql(issueTypeSolutionIssueTypeModel,[],{
                issue_type_solution_id:issueTypeSolutionId
            }))
            for(let obj of arr) {
                await mysql.execute(generateCreateSql(workflowSolutionWorkflowIssueTypeModel,{
                    id:await generateSnowId(),
                    workflow_id:workflowId,
                    issue_type_id:obj.id,
                    issue_type_solution_id:issueTypeSolutionId,
                    workflow_solution_id:workflowSolutionId
                }))
            }
        }
    }
    async getIssueTypeSolutionList(workflowSolutionId:string):Promise<ICommon_Model_Issue_Type_Solution[]> {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:workflowSolutionIssueTypeSolutionModel
        },{
            model:issueTypeSolutionModel,
            columns:keys<typeof issueTypeSolutionModel.model>().map(item=>item.name),
            expression:{
                id:{
                    model:workflowSolutionIssueTypeSolutionModel,
                    field:"issue_type_solution_id"
                }
            }
        },{
            workflow_solution_id:{
                model:workflowSolutionIssueTypeSolutionModel,
                value:workflowSolutionId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }
    async unbindIssueTypeSolution(workflowSolutionId:string,issueTypeSolutionIds:string[]=null) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionIssueTypeSolutionModel,{
            workflow_solution_id:workflowSolutionId,
            ...((issueTypeSolutionIds && issueTypeSolutionIds.length>0) && {issue_type_solution_id:{
                exp:"in",
                value:issueTypeSolutionIds
            }})
        }))
        await mysql.execute(generateDeleteSql(workflowSolutionWorkflowIssueTypeModel,{
            workflow_solution_id:workflowSolutionId,
            ...((issueTypeSolutionIds && issueTypeSolutionIds.length>0) && {issue_type_solution_id:{
                exp:"in",
                value:issueTypeSolutionIds
            }})
        }))
    }
    async workflowIssueTypeList(workflowSolutionId:string,issueTypeSolutionId:string):Promise<{
        issueType:ICommon_Model_Issue_Type,
        workflow:ICommon_Model_Workflow
    }[]> {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin2Sql({
            model:workflowSolutionWorkflowIssueTypeModel
        },{
            model:issueTypeModel,
            columns:keys<ICommon_Model_Issue_Type>().map(item=>item.name),
            expression:{
                id:{
                    model:workflowSolutionWorkflowIssueTypeModel,
                    field:"issue_type_id"
                }
            },
            aggregation:"issueType"
        },{
            model:workflowModel,
            columns:keys<ICommon_Model_Workflow>().map(item=>item.name),
            expression:{
                id:{
                    model:workflowSolutionWorkflowIssueTypeModel,
                    field:"workflow_id"
                }
            },
            aggregation:"workflow"
        },{
            workflow_solution_id:{
                model:workflowSolutionWorkflowIssueTypeModel,
                value:workflowSolutionId
            },
            issue_type_solution_id:{
                model:workflowSolutionWorkflowIssueTypeModel,
                value:issueTypeSolutionId
            }
        });
        let ret=await mysql.execute(sql);
        return ret;
    }


    async assign(workflowSolutionId:string,workflowId:string,issueTypeId:string,issueTypeSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        } else if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        } else if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let issueTypeList=await mysql.execute(generateQuerySql(issueTypeSolutionIssueTypeModel,[],{
            issue_type_solution_id:issueTypeSolutionId
        }))
        let issueTypeIds=issueTypeList.map(item=>item.issue_type_id)
        if(!issueTypeIds.includes(issueTypeId)) {
            throw Err.Project.Issue.issueTypeNotInIssueTypeSolution
        }
        let obj=await mysql.executeOne(generateQuerySql(workflowSolutionWorkflowIssueTypeModel,[],{
            workflow_solution_id:workflowSolutionId,
            issue_type_id:issueTypeId,
            issue_type_solution_id:issueTypeSolutionId
        }))
        if(obj) {
            await mysql.execute(generateUpdateSql(workflowSolutionWorkflowIssueTypeModel,{
                workflow_id:workflowId
            },{
                workflow_solution_id:workflowSolutionId,
                issue_type_id:issueTypeId,
                issue_type_solution_id:issueTypeSolutionId
            }))
        } else {
            let id=await generateSnowId();
            await mysql.execute(generateCreateSql(workflowSolutionWorkflowIssueTypeModel,{
                id:id,
                workflow_id:workflowId,
                workflow_solution_id:workflowSolutionId,
                issue_type_id:issueTypeId,
                issue_type_solution_id:issueTypeSolutionId
            }))
        }
    }

    async getWorkflowByIssueTypeId(workflowSolutionId:string,issueTypeId:string,issueTypeSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        } else if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:workflowSolutionWorkflowIssueTypeModel
        },{
            model:workflowModel,
            columns:keys<ICommon_Model_Workflow>().map(item=>item.name),
            expression:{
                id:{
                    model:workflowSolutionWorkflowIssueTypeModel,
                    field:"workflow_id"
                }
            }
        },{
            workflow_solution_id:{
                model:workflowSolutionWorkflowIssueTypeModel,
                value:workflowSolutionId
            },
            issue_type_id:{
                model:workflowSolutionWorkflowIssueTypeModel,
                value:issueTypeId
            },
            issue_type_solution_id:{
                model:workflowSolutionWorkflowIssueTypeModel,
                value:issueTypeSolutionId
            }
        })
        let ret=await mysql.executeOne(sql)
        return ret;
    }

    async deleteItemsByWorkflowSolutionId(workflowSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionWorkflowIssueTypeModel,{
            workflow_solution_id:workflowSolutionId
        }))
        await mysql.execute(generateDeleteSql(workflowSolutionWorkflowModel,{
            workflow_solution_id:workflowSolutionId
        }))
    }

    async deleteIssueType(workflowSolutionId:string,issueTypeId:string,issueTypeSolutionId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        } else if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionWorkflowIssueTypeModel,{
            workflow_solution_id:workflowSolutionId,
            issue_type_id:issueTypeId,
            issue_type_solution_id:issueTypeSolutionId
        }))
    }

    async clearIssueType(issueTypeId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionWorkflowIssueTypeModel,{
            issue_type_id:issueTypeId
        }))
    }

    async addWorkflow(workflowSolutionId:string,workflowId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(workflowSolutionWorkflowModel,["id"],{
            workflow_id:workflowId,
            workflow_solution_id:workflowSolutionId
        }))
        if(!obj) {
            await mysql.execute(generateCreateSql(workflowSolutionWorkflowModel,{
                id:await generateSnowId(),
                workflow_id:workflowId,
                workflow_solution_id:workflowSolutionId
            }))
        }
    }

    async removeWorkflow(workflowSolutionId:string,workflowId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionWorkflowModel,{
            workflow_id:workflowId,
            workflow_solution_id:workflowSolutionId
        }))
    }

    async listWorkflow(workflowSolutionId:string):Promise<ICommon_Model_Workflow[]> {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:workflowSolutionWorkflowModel
        },{
            model:workflowModel,
            columns:keys<ICommon_Model_Workflow>().map(item=>item.name),
            expression:{
                id:{
                    model:workflowSolutionWorkflowModel,
                    field:"workflow_id"
                }
            }
        },{
            workflow_solution_id:{
                model:workflowSolutionWorkflowModel,
                value:workflowSolutionId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async checkWorkflow(workflowSolutionId:string,workflowId:string) {
        if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        } else if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowSolutionWorkflowModel,["id"],{
            workflow_id:workflowId,
            workflow_solution_id:workflowSolutionId
        }))
        return ret!=null
    }

    async getItemsByIssueTypeSolutionId(issueTypeSolutionId:string) {
        if(!issueTypeSolutionId) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowSolutionIssueTypeSolutionModel,[],{
            issue_type_solution_id:issueTypeSolutionId
        }))
        return ret
    }

    async getItemsByWorkflowId(workflowId:string) {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:workflowSolutionWorkflowModel
        },{
            model:workflowSolutionModel,
            columns:keys<ICommon_Model_Workflow_Solution>().map(item=>item.name),
            expression:{
                id:{
                    model:workflowSolutionWorkflowModel,
                    field:"workflow_solution_id"
                }
            },
        },{
            workflow_id:{
                model:workflowSolutionWorkflowModel,
                value:workflowId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
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

    async getActionList(workflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowActionModel,[],{
            source_node_id:workflowNodeId
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