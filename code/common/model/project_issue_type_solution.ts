import {BaseModel} from "./base"

export interface ICommon_Model_Project_Issue_Type_Solution {
    id :string,
    project_id :string,
    issue_type_solution_id:string
}
export const Table_Project_Issue_Type_Solution="project_issue_type_solution"

class ProjectIssueTypeSolutionModel extends BaseModel {
    table=Table_Project_Issue_Type_Solution
    model=<ICommon_Model_Project_Issue_Type_Solution>{}
  }
  
export let projectIssueTypeSolutionModel=new ProjectIssueTypeSolutionModel