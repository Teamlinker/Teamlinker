import {Err} from '../../../common/status/error';
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {
    generateBatchCreateSql,
    generateCreateSql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId
} from "../../common/util/sql";
import {ICommon_Model_Workflow_Action, workflowActionModel} from './../../../common/model/workflow_action';
import {
    ECommon_Model_Workflow_Node_Status,
    ICommon_Model_Workflow_Node,
    workflowNodeModel
} from './../../../common/model/workflow_node';
import {ICommon_Model_Workflow_Approval, workflowApprovalModel} from "../../../common/model/workflow_approval";
import {keys} from "../../../common/transform";
import {WorkflowApprovalService} from "../service/workflow";
import * as i18next from "i18next";

class WorkflowMapper  {
    async nodeList(issueTypeId:string) {
        if(!issueTypeId) {
            throw Err.Project.Workflow.workflowNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:workflowNodeModel,
            columns:keys<ICommon_Model_Workflow_Node>().map(item=>item.name),
        },{
            model:workflowApprovalModel,
            columns:keys<ICommon_Model_Workflow_Approval>().map(item=>item.name),
            aggregation:"approval",
            expression:{
                workflow_node_id:{
                    model:workflowNodeModel,
                    field:"id"
                }
            }
        },{
            issue_type_id:{
                model:workflowNodeModel,
                value:issueTypeId
            }
        })
        let ret=await mysql.execute(sql)
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
        let arrApproval=await Promise.all(nodeList.map(item=>{
            return WorkflowApprovalService.getItemByExp({
                workflow_node_id:item.id
            })
        }))
        let approvalList=arrApproval.filter(item=>item!==null).map(item=>item.getItem())
        let newIds:string[]=[],oldIds=nodeList.map(item=>item.id);
        for(let obj of nodeList) {
            delete obj.approval
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
            if(obj.is_approval) {
                let objApproval=approvalList.find(item=>item.workflow_node_id===oldId)
                if(objApproval) {
                    objApproval.workflow_node_id=obj.id
                    objApproval.id=await generateSnowId()
                }
            }
        }
        for(let obj of actionList) {
            obj.id=await generateSnowId()
            obj.issue_type_id=newIssueTypeId
        }
        await Promise.all([
            nodeList.length>0?mysql.execute(generateBatchCreateSql(workflowNodeModel,nodeList)):null,
            actionList.length>0?mysql.execute(generateBatchCreateSql(workflowActionModel,actionList)):null,
            approvalList.length>0?mysql.execute(generateBatchCreateSql(workflowApprovalModel,approvalList)):null
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

    async init(issueTypeId: string,lang:string) {
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
                name: i18next.getFixedT(lang)("backend.open"),
                status: ECommon_Model_Workflow_Node_Status.NOTSTART,
                issue_type_id: issueTypeId,
                x: 50,
                y: 45
            })),
            mysql.execute(generateCreateSql(workflowNodeModel, {
                id: workflowNodeProgressId,
                name: i18next.getFixedT(lang)("backend.inProgress"),
                status: ECommon_Model_Workflow_Node_Status.INPROGRESS,
                issue_type_id: issueTypeId,
                x: 281,
                y: 177
            })),
            mysql.execute(generateCreateSql(workflowNodeModel, {
                id: workflowNodeClosedId,
                name: i18next.getFixedT(lang)("backend.closed"),
                status: ECommon_Model_Workflow_Node_Status.DONE,
                issue_type_id: issueTypeId,
                x: 59,
                y: 502
            })),
            mysql.execute(generateCreateSql(workflowNodeModel, {
                id: workflowNodeResolvedId,
                name: i18next.getFixedT(lang)("backend.resolved"),
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
                name: i18next.getFixedT(lang)("backend.openToProgress"),
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeOpenId,
                dest_node_id: workflowNodeProgressId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionProgressToOpenId,
                name: i18next.getFixedT(lang)("backend.progressToOpen"),
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeProgressId,
                dest_node_id: workflowNodeOpenId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionOpenToClosedId,
                name: i18next.getFixedT(lang)("backend.openToClosed"),
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeOpenId,
                dest_node_id: workflowNodeClosedId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionClosedToOpenId,
                name: i18next.getFixedT(lang)("backend.closedToOpen"),
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeClosedId,
                dest_node_id: workflowNodeOpenId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionProgressToResolvedId,
                name: i18next.getFixedT(lang)("backend.progressToResolved"),
                issue_type_id: issueTypeId,
                source_node_id: workflowNodeProgressId,
                dest_node_id: workflowNodeResolvedId
            })),
            mysql.execute(generateCreateSql(workflowActionModel, {
                id: actionResolvedToProgressId,
                name: i18next.getFixedT(lang)("backend.resolvedToProgress"),
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

    async getAllComingNodeList(issueTypeId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(workflowNodeModel,[],{
            issue_type_id:issueTypeId,
            is_all_coming:1
        }))
        return ret;
    }

    async info(workflowNodeId:string) {
        if(!workflowNodeId) {
            throw Err.Project.Workflow.workflowNodeNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:workflowNodeModel,
            columns:keys<ICommon_Model_Workflow_Node>().map(item=>item.name)
        },{
            model:workflowApprovalModel,
            columns:keys<ICommon_Model_Workflow_Approval>().map(item=>item.name),
            aggregation:"approval",
            expression:{
                workflow_node_id:{
                    model:workflowNodeModel,
                    field: "id"
                }
            }
        },{
            id:{
                model:workflowNodeModel,
                value:workflowNodeId
            }
        })
        let ret=await mysql.executeOne(sql)
        return ret
    }
}

export let workflowNodeMapper=new WorkflowNodeMapper

class WorkflowActionMapper extends Mapper<typeof workflowActionModel> {
    constructor() {
        super(workflowActionModel)
    }
}

export let workflowActionMapper=new WorkflowActionMapper

class WorkflowApprovalMapper extends Mapper<typeof workflowApprovalModel> {
    constructor() {
        super(workflowApprovalModel)
    }
}

export let workflowApprovalMapper=new WorkflowApprovalMapper