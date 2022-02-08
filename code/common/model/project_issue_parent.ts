import { BaseModel } from "./base"

export interface ICommon_Model_Project_Issue_Parent {
    id :string,
    parent_id :string,
    child_id:string
}
export const Table_Project_Issue_Parent="project_issue_parent"

class ProjectIssueParentModel extends BaseModel {
    table=Table_Project_Issue_Parent
    model=<ICommon_Model_Project_Issue_Parent>{}
  }
  
export let projectIssueParentModel=new ProjectIssueParentModel