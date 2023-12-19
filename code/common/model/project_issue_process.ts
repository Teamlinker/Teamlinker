import {BaseModel} from "./base"

export interface ICommon_Model_Project_Issue_Process {
    id :string,
    project_issue_id :string,
    workflow_node_process:string[]
}
export const Table_Project_Issue_Process="project_issue_process"

class ProjectIssueProcessModel extends BaseModel {
    table=Table_Project_Issue_Process
    model=<ICommon_Model_Project_Issue_Process>{}
  }
  
export let projectIssueProcessModel=new ProjectIssueProcessModel