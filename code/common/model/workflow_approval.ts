import {BaseModel} from "./base"

export enum ECommon_Model_Workflow_Approval_Type {
    PERSON,
    TEAM,
    FIELD
}

export interface ICommon_Model_Workflow_Approval {
    id :string ,
    workflow_node_id:string,
    type:ECommon_Model_Workflow_Approval_Type,
    value:string[],
    extra:string
}
export const Table_Workflow_Approval="workflow_approval"

class WorkflowApprovalModel extends BaseModel {
    table=Table_Workflow_Approval
    model=<ICommon_Model_Workflow_Approval>{}
}

export  let workflowApprovalModel=new WorkflowApprovalModel