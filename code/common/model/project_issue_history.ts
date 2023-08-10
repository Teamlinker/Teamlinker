import {BaseModel} from "./base";

export enum ECommon_Model_Project_Issue_History_Type {
    CREATE_ISSUE,
    UPDATE_FIELD,
    UPDATE_NODE,
    APPROVAL_RESOLVE,
    APPROVAL_REJECT,
    ISSUE_TYPE_CONVERT
}

export interface ICommon_Model_Project_Issue_History {
    id: string,
    created_time: Date,
    type:ECommon_Model_Project_Issue_History_Type,
    project_issue_id:string,
    organization_user_id:string,
    project_id:string,
    name:string,
    value:string
}

export const Table_Project_Issue_History = "project_issue_history"

class ProjectIssueHistoryModel extends BaseModel {
    table = Table_Project_Issue_History
    model = <ICommon_Model_Project_Issue_History>{}
}

export let projectIssueHistoryModel = new ProjectIssueHistoryModel