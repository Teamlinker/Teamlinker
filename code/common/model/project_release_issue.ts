import { BaseModel } from "./base"

export interface ICommon_Model_Project_Release_Issue {
    id :string ,
    project_release_id :string,
    project_issue_id:string
}
export const Table_Project_Release_Issue="project_release_issue"

class ProjectReleaseIssueModel extends BaseModel {
    table=Table_Project_Release_Issue
    model=<ICommon_Model_Project_Release_Issue>{}
  }
  
export let projectReleaseIssueModel=new ProjectReleaseIssueModel