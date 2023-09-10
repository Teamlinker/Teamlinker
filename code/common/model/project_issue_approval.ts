import {BaseModel} from "./base"

export enum ECommon_Model_Project_Issue_Approval_Type {
    PENDING,
    RESOLVED,
    REJECTED
}

export enum ECommon_Model_Project_Issue_Approval_Action {
    RESOLVE,
    REJECT,
    REVOKE,
    COMMIT
}

export interface ICommon_Model_Project_Issue_Approval {
    id: string,
    project_issue_id:string
    workflow_node_id: string,
    type:ECommon_Model_Project_Issue_Approval_Type,
    approval_organization_user_id:string
}

export const Table_Project_Issue_Approval = "project_issue_approval"

class ProjectIssueApprovalModel extends BaseModel {
    table = Table_Project_Issue_Approval
    model = <ICommon_Model_Project_Issue_Approval>{}
}

export let projectIssueApprovalModel = new ProjectIssueApprovalModel