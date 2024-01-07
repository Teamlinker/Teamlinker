import {BaseModel} from "./base"

export enum ECommon_Model_Project_Issue_Priority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

export interface ICommon_Model_Project_Issue {
    unique_id: number,
    id: string,
    created_time: Date,
    modified_time: Date,
    created_by: string,
    project_id: string,
    issue_type_id: string,
    name: string,
    priority: ECommon_Model_Project_Issue_Priority,
    assigner_id: string,
    reporter_id: string,
    workflow_node_id: string,
    man_day:number
}

export const Table_Project_Issue = "project_issue"

class ProjectIssueModel extends BaseModel {
    table = Table_Project_Issue
    model = <ICommon_Model_Project_Issue>{}
}

export let projectIssueModel = new ProjectIssueModel