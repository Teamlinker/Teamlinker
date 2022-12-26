import {Err} from '../../../common/status/error';
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {generateBatchCreateSql, generateCreateSql, generateQuerySql, generateSnowId} from "../../common/util/sql";
import {ICommon_Model_Workflow_Action, workflowActionModel} from './../../../common/model/workflow_action';
import {
    ECommon_Model_Workflow_Node_Status,
    ICommon_Model_Workflow_Node,
    workflowNodeModel
} from './../../../common/model/workflow_node';

class WorkflowMapper  {
    async nodeList(issueTypeId:string):Promise<ICommon_Model_Workflow_Node[]>{
        if(!issueTypeId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowNodeModel,[],{
            issue_type_id:issueTypeId
        }))
        return ret;
    }
    async actionList(issueTypeId:string):Promise<ICommon_Model_Workflow_Action[]>{
        if(!issueTypeId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowActionModel,[],{
            issue_type_id:issueTypeId
        }))
        return ret;
    }

    async copyItem(issueTypeId:string,newIssueTypeId:string):Promise<{
        workflowNodes:string[],
        newWorkflowNodes:string[]
    }> {
        let mysql=getMysqlInstance()
        let [nodeList,actionList]=await Promise.all([
            this.nodeList(issueTypeId),
            this.actionList(issueTypeId)
        ])
        let newIds:string[]=[],oldIds=nodeList.map(item=>item.id);
        for(let obj of nodeList) {
            let oldId=obj.id;
            obj.id=await generateSnowId()
            newIds.push(obj.id)
            obj.issue_type_id=newIssueTypeId
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
            obj.issue_type_id=newIssueTypeId
        }
        await Promise.all([
            mysql.execute(generateBatchCreateSql(workflowNodeModel,nodeList)),
            mysql.execute(generateBatchCreateSql(workflowActionModel,actionList))
        ])
        return {
            workflowNodes:oldIds,
            newWorkflowNodes:newIds
        }
    }

    async checkNode(issueTypeId:string,workflowNodeId:string):Promise<boolean> {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        } else if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeModel,["id"],{
            issue_type_id:issueTypeId,
            id:workflowNodeId
        }))
        return ret!=null
    }

    async checkAction(issueTypeId:string,workflowActionId:string):Promise<boolean> {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        } else if(!workflowActionId) {
            throw Err.Project.Workflow.workflowActionNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowActionModel,["id"],{
            issue_type_id:issueTypeId,
            id:workflowActionId
        }))
        return ret!=null
    }

    async init(issueTypeId: string) {
        if (!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql = getMysqlInstance()
        let workflowNodeOpenId = await generateSnowId()
        let workflowNodeProgressId = await generateSnowId()
        let workflowNodeClosedId = await generateSnowId()
        let workflowNodeResolvedId = await generateSnowId()
        await Promise.all([
            mysql.execute(generateCreateSql(workflowNodeModel, {
                id: workflowNodeOpenId,
                name: "open",
                status: ECommon_Model_Workflow_Node_Status.NOTSTART,
                issue_type_id: issueTypeId,
                x: 50,
                y: 45
            })),
            mysql.execute(generateCreateSql(workflowNodeModel, {
                id: workflowNodeProgressId,
                name: "in progress",
                status: ECommon_Model_Workflow_Node_Status.INPROGRESS,
                issue_type_id: issueTypeId,
                x: 281,
                y: 177
            })),
            mysql.execute(generateCreateSql(workflowNodeModel, {
                id: workflowNodeClosedId,
                name: "closed",
                status: ECommon_Model_Workflow_Node_Status.DONE,
                issue_type_id: issueTypeId,
                x: 59,
                y: 502
            })),
            mysql.execute(generateCreateSql(workflowNodeModel, {
                id: workflowNodeResolvedId,
                name: "resolved",
                status: ECommon_Model_Workflow_Node_Status.DONE,
                issue_type_id: issueTypeId,
                x: 507,
                y: 503
            }))
        ])
        let actionOpenToProgressId = await generateSnowId()
        let actionProgressToOpenId = await generateSnowId()
        let actionOpenToClosedId = await generateSnowId()
        let actionClosedToOpenId = await generateSnowId()
        let actionProgressToResolvedId = await generateSnowId()
        let actionResolvedToProgressId = await generateSnowId()
        await Promise.all([
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionOpenToProgressId,
                name: "open to progress",
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeOpenId,
                dest_node_id: workflowNodeProgressId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionProgressToOpenId,
                name: "progress to open",
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeProgressId,
                dest_node_id: workflowNodeOpenId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionOpenToClosedId,
                name: "open to close",
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeOpenId,
                dest_node_id: workflowNodeClosedId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionClosedToOpenId,
                name: "closed to open",
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeClosedId,
                dest_node_id: workflowNodeOpenId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionProgressToResolvedId,
                name: "progress to resolved",
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeProgressId,
                dest_node_id: workflowNodeResolvedId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionResolvedToProgressId,
                name: "resolved to progress",
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeResolvedId,
                dest_node_id: workflowNodeProgressId
            }))
        ])
    }

}
export let workflowMapper=new WorkflowMapper

class WorkflowNodeMapper extends Mapper<typeof workflowNodeModel> {
    constructor() {
        super(workflowNodeModel)
    }
    async getOpenNode(issueTypeId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(workflowNodeModel,[],{
            status:ECommon_Model_Workflow_Node_Status.NOTSTART,
            issue_type_id:issueTypeId
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