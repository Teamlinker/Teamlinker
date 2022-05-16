import { ICommon_Model_Issue_Type } from "../../../common/model/issue_type";
import { workflowSolutionModel } from "../../../common/model/workflow_solution";
import { workflowSolutionIssueTypeSolutionModel } from "../../../common/model/workflow_solution_issue_type_solution";
import { workflowSolutionWorkflowModel } from "../../../common/model/workflow_solution_workflow";
import { workflowSolutionWorkflowIssueTypeModel } from "../../../common/model/workflow_solution_workflow_issue_type";
import { Err } from '../../../common/status/error';
import { keys } from "../../../common/transform";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateBatchCreateSql, generateCreateSql, generateDeleteSql, generateLeftJoin2Sql, generateLeftJoinSql, generateQuerySql, generateSnowId, generateUpdateSql } from "../../common/util/sql";
import { fieldSolutionWorkflowNodeFieldTypeModel } from './../../../common/model/field_solution_workflow_node_field_type';
import { fieldSolutionWorkflowSolutionModel } from './../../../common/model/field_solution_workflow_solution';
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
    async getReservedItem(organizationId:string) {
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowModel,[],{
            reserved:1,
            organization_id:organizationId
        }))
        return ret;
    }
    async list(organizationId:string):Promise<ICommon_Model_Workflow[]>
    {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowModel,[],{
            organization_id:organizationId
        },null,{
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

    async revoke(workflowId:string,organizationId:string) {
        if(!workflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let objWorkflow=await workflowMapper.getReservedItem(organizationId)
        await mysql.execute(generateUpdateSql(workflowSolutionWorkflowIssueTypeModel,{
            workflow_id:objWorkflow.id
        },{
            workflow_id:workflowId
        }))
    }

    async copyItem(originWorkflowId:string,newWorkflowId:string) {
        if(!originWorkflowId || !newWorkflowId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let nodeList=await this.nodeList(originWorkflowId)
        let actionList=await this.actionList(originWorkflowId)
        for(let obj of nodeList) {
            let oldId=obj.id;
            obj.id=await generateSnowId()
            obj.workflow_id=newWorkflowId
            for(let action of actionList) {
                if(action.dest_node_id==oldId) {
                    action.dest_node_id=obj.id
                } else if(action.source_node_id==oldId) {
                    action.source_node_id=obj.id
                }
            }
        }
        for(let obj of actionList) {
            obj.id=await generateSnowId()
            obj.workflow_id=newWorkflowId
        }
        await mysql.execute(generateBatchCreateSql(workflowNodeModel,nodeList))
        await mysql.execute(generateBatchCreateSql(workflowActionModel,actionList))
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

    async init(organizationId: string) {
        if (!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql = getMysqlInstance()
        let workflowId = await generateSnowId()
        await mysql.execute(generateCreateSql(workflowModel, {
            id: workflowId,
            name: "default",
            description: "",
            reserved: 1,
            organization_id: organizationId
        }))
        let workflowNodeOpenId = await generateSnowId()
        let workflowNodeProgressId = await generateSnowId()
        let workflowNodeClosedId = await generateSnowId()
        let workflowNodeResolvedId = await generateSnowId()
        await mysql.execute(generateCreateSql(workflowNodeModel, {
            id: workflowNodeOpenId,
            name: "open",
            status: ECommon_Model_Workflow_Node_Status.NOTSTART,
            workflow_id: workflowId,
            x: 50,
            y: 45
        }))
        await mysql.execute(generateCreateSql(workflowNodeModel, {
            id: workflowNodeProgressId,
            name: "in progress",
            status: ECommon_Model_Workflow_Node_Status.INPROGRESS,
            workflow_id: workflowId,
            x: 281,
            y: 177
        }))
        await mysql.execute(generateCreateSql(workflowNodeModel, {
            id: workflowNodeClosedId,
            name: "closed",
            status: ECommon_Model_Workflow_Node_Status.DONE,
            workflow_id: workflowId,
            x: 59,
            y: 502
        }))
        await mysql.execute(generateCreateSql(workflowNodeModel, {
            id: workflowNodeResolvedId,
            name: "resolved",
            status: ECommon_Model_Workflow_Node_Status.DONE,
            workflow_id: workflowId,
            x: 507,
            y: 503
        }))
        let actionOpenToProgressId = await generateSnowId()
        let actionProgressToOpenId = await generateSnowId()
        let actionOpenToClosedId = await generateSnowId()
        let actionClosedToOpenId = await generateSnowId()
        let actionProgressToResolvedId = await generateSnowId()
        let actionResolvedToProgressId = await generateSnowId()
        await mysql.execute(generateCreateSql(workflowActionModel, {
            id: actionOpenToProgressId,
            name: "open to progress",
            workflow_id: workflowId,
            source_node_id: workflowNodeOpenId,
            dest_node_id: workflowNodeProgressId
        }))
        await mysql.execute(generateCreateSql(workflowActionModel, {
            id: actionProgressToOpenId,
            name: "progress to open",
            workflow_id: workflowId,
            source_node_id: workflowNodeProgressId,
            dest_node_id: workflowNodeOpenId
        }))
        await mysql.execute(generateCreateSql(workflowActionModel, {
            id: actionOpenToClosedId,
            name: "open to close",
            workflow_id: workflowId,
            source_node_id: workflowNodeOpenId,
            dest_node_id: workflowNodeClosedId
        }))
        await mysql.execute(generateCreateSql(workflowActionModel, {
            id: actionClosedToOpenId,
            name: "closed to open",
            workflow_id: workflowId,
            source_node_id: workflowNodeClosedId,
            dest_node_id: workflowNodeOpenId
        }))
        await mysql.execute(generateCreateSql(workflowActionModel, {
            id: actionProgressToResolvedId,
            name: "progress to resolved",
            workflow_id: workflowId,
            source_node_id: workflowNodeProgressId,
            dest_node_id: workflowNodeResolvedId
        }))
        await mysql.execute(generateCreateSql(workflowActionModel, {
            id: actionResolvedToProgressId,
            name: "resolved to progress",
            workflow_id: workflowId,
            source_node_id: workflowNodeResolvedId,
            dest_node_id: workflowNodeProgressId
        }))
        return workflowId;
    }

}
export let workflowMapper=new WorkflowMapper

class WorkflowSolutionMapper extends Mapper<typeof workflowSolutionModel> {
    constructor() {
        super(workflowSolutionModel)
    }
    async getReservedItem(organizationId:string) {
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowSolutionModel,[],{
            reserved:1,
            organization_id:organizationId
        }))
        return ret;
    }
    async list(organizationId:string):Promise<ICommon_Model_Workflow_Solution[]>
    {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowSolutionModel,[],{
            organization_id:organizationId
        },null,{
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

    async bindIssueTypeSolutionList(workflowSolutionId:string,issueTypeSolutionIds:string[],organizationId:string) {
        if(!issueTypeSolutionIds || issueTypeSolutionIds.length==0) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        } else if(!workflowSolutionId) {
            throw Err.Project.Workflow.workflowSolutionNotFound
        }
        let mysql=getMysqlInstance()
        let workflowId=(await workflowMapper.getReservedItem(organizationId)).id;
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
                    issue_type_id:obj.issue_type_id,
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

    async clearIssueTypeSolution(issueTypeSolutionIds:string[]) {
        if(!issueTypeSolutionIds) {
            throw Err.Project.Issue.issueTypeSolutionNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(workflowSolutionIssueTypeSolutionModel,{
            issue_type_solution_id:{
                exp:"in",
                value:issueTypeSolutionIds
            }
        }))
        await mysql.execute(generateDeleteSql(workflowSolutionWorkflowIssueTypeModel,{
            issue_type_solution_id:{
                exp:"in",
                value:issueTypeSolutionIds
            }
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

    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let workflowSolutionList =await mysql.execute(generateQuerySql(workflowSolutionModel,["id"],{
            organization_id:organizationId
        }))
        if(workflowSolutionList.length>0){
            let ids=workflowSolutionList.map(item=>item.id);
            await mysql.execute(generateDeleteSql(workflowSolutionModel,{
                organization_id:organizationId
            }))
            await mysql.execute(generateDeleteSql(workflowSolutionIssueTypeSolutionModel,{
                workflow_solution_id:{
                    exp:"in",
                    value:ids
                }
            }))
            await mysql.execute(generateDeleteSql(workflowSolutionWorkflowModel,{
                workflow_solution_id:{
                    exp:"in",
                    value:ids
                }
            }))
            await mysql.execute(generateDeleteSql(workflowSolutionWorkflowIssueTypeModel,{
                workflow_solution_id:{
                    exp:"in",
                    value:ids
                }
            }))
            await mysql.execute(generateDeleteSql(fieldSolutionWorkflowSolutionModel,{
                workflow_solution_id:{
                    exp:"in",
                    value:ids
                }
            }))
            await mysql.execute(generateDeleteSql(fieldSolutionWorkflowNodeFieldTypeModel,{
                workflow_solution_id:{
                    exp:"in",
                    value:ids
                }
            }))
        }
        let workflowList =await mysql.execute(generateQuerySql(workflowModel,["id"],{
            organization_id:organizationId
        }))
        if(workflowList.length>0) {
            let ids=workflowSolutionList.map(item=>item.id);
            await mysql.execute(generateDeleteSql(workflowModel,{
                organization_id:organizationId
            }))
            await mysql.execute(generateDeleteSql(workflowNodeModel,{
                workflow_id:{
                    exp:"in",
                    value:ids
                }
            }))
            await mysql.execute(generateDeleteSql(workflowActionModel,{
                workflow_id:{
                    exp:"in",
                    value:ids
                }
            }))
        }
    }

    async init(issueTypeSolutionId: string, issueTypeSolutionName: string, issueTypeTaskId: string, issueTypeBugId: string, issueTypeTicketId: string, workflowId: string, organizationId: string) {
        let mysql=getMysqlInstance()
        let workflowSolutionId = await generateSnowId()
        await mysql.execute(generateCreateSql(workflowSolutionModel, {
            id: workflowSolutionId,
            reserved: 1,
            name: issueTypeSolutionName,
            organization_id: organizationId
        }))
        await mysql.execute(generateCreateSql(workflowSolutionWorkflowModel, {
            id: await generateSnowId(),
            workflow_solution_id: workflowSolutionId,
            workflow_id: workflowId
        }))
        await mysql.execute(generateCreateSql(workflowSolutionIssueTypeSolutionModel, {
            id: await generateSnowId(),
            workflow_solution_id: workflowSolutionId,
            issue_type_solution_id: issueTypeSolutionId
        }))
        await mysql.execute(generateCreateSql(workflowSolutionWorkflowIssueTypeModel, {
            id: await generateSnowId(),
            workflow_solution_id: workflowSolutionId,
            workflow_id: workflowId,
            issue_type_id: issueTypeTaskId,
            issue_type_solution_id: issueTypeSolutionId
        }))
        await mysql.execute(generateCreateSql(workflowSolutionWorkflowIssueTypeModel, {
            id: await generateSnowId(),
            workflow_solution_id: workflowSolutionId,
            workflow_id: workflowId,
            issue_type_id: issueTypeBugId,
            issue_type_solution_id: issueTypeSolutionId
        }))
        await mysql.execute(generateCreateSql(workflowSolutionWorkflowIssueTypeModel, {
            id: await generateSnowId(),
            workflow_solution_id: workflowSolutionId,
            workflow_id: workflowId,
            issue_type_id: issueTypeTicketId,
            issue_type_solution_id: issueTypeSolutionId
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