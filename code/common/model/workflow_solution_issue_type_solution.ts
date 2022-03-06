import { BaseModel } from "./base"

export interface ICommon_Model_Workflow_Solution_Issue_Type_Solution {
    id :string,
  workflow_solution_id :string,
  issue_type_solution_id:string
}
export const Table_Workflow_Solution_Issue_Type_Solution="workflow_solution_issue_type_solution"

class WorkflowSolutionIssueTypeSolutionModel extends BaseModel {
  table=Table_Workflow_Solution_Issue_Type_Solution
  model=<ICommon_Model_Workflow_Solution_Issue_Type_Solution>{}
}

export  let workflowSolutionIssueTypeSolutionModel=new WorkflowSolutionIssueTypeSolutionModel