import { BaseModel } from "./base"

export interface ICommon_Model_Project_Issue_Description {
    id :string,
  project_issue_id :string,
  content:string
}
export const Table_Project_Issue_Description="project_issue_description"

class ProjectIssueDescriptionModel extends BaseModel {
  table=Table_Project_Issue_Description
  model=<ICommon_Model_Project_Issue_Description>{}
}

export let projectIssueDescriptionModel=new ProjectIssueDescriptionModel