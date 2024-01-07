import { BaseModel } from "./base"

export interface ICommon_Model_Project_Module_Issue {
    id :string,
    project_module_id:string,
    project_issue_id:string
}
export const Table_Project_Module_Issue="project_module_issue"

class ProjectModuleIssueModel extends BaseModel {
    table=Table_Project_Module_Issue
    model=<ICommon_Model_Project_Module_Issue>{}
  }
  
  export let projectModuleIssueModel=new ProjectModuleIssueModel