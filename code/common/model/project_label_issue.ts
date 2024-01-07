import { BaseModel } from "./base"

export interface ICommon_Model_Project_Lable_Issue {
    id :string,
    project_label_id:string,
    project_issue_id:string
}
export const Table_Project_Label_Issue="project_label_issue"

class ProjectLabelIssueModel extends BaseModel {
    table=Table_Project_Label_Issue
    model=<ICommon_Model_Project_Lable_Issue>{}
  }
  
  export let projectLabelIssueModel=new ProjectLabelIssueModel