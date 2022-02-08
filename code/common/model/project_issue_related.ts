import { BaseModel } from "./base"

export interface ICommon_Model_Project_Issue_Related {
    id :string,
    project_issue_1_id :string,
    project_issue_2_id:string
}
export const Table_Project_Issue_Related="project_issue_related"

class ProjectIssueRelatedModel extends BaseModel {
    table=Table_Project_Issue_Related
    model=<ICommon_Model_Project_Issue_Related>{}
  }
  
export let projectIssueRelatedModel=new ProjectIssueRelatedModel