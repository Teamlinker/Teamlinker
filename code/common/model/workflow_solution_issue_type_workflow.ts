import { BaseModel } from "./base"

export interface ICommon_Model_Workflow_Solution_Issue_Type_Worflow {
    id :string,
  workflow_solution_id :string,
  workflow_id :string ,
  issue_type_id:string
}
export const Table_Workflow_Solution_Issue_Type_Workflow="workflow_solution_issue_type_solution"

class WorkflowSolutionIssueTypeWorkflowModel extends BaseModel {
  table=Table_Workflow_Solution_Issue_Type_Workflow
  model=<ICommon_Model_Workflow_Solution_Issue_Type_Worflow>{}
}

export  let workflowSolutionIssueTypeWorkflowModel=new WorkflowSolutionIssueTypeWorkflowModel