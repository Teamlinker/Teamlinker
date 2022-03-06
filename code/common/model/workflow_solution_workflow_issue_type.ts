import { BaseModel } from "./base"

export interface ICommon_Model_Workflow_Solution_Worflow_Issue_Type {
    id :string,
  workflow_solution_id :string,
  workflow_id :string ,
  issue_type_id:string,
  issue_type_solution_id:string
}
export const Table_Workflow_Solution_Workflow_Issue_Type="workflow_solution_workflow_issue_type"

class WorkflowSolutionWorkflowIssueTypeModel extends BaseModel {
  table=Table_Workflow_Solution_Workflow_Issue_Type
  model=<ICommon_Model_Workflow_Solution_Worflow_Issue_Type>{}
}

export  let workflowSolutionWorkflowIssueTypeModel=new WorkflowSolutionWorkflowIssueTypeModel