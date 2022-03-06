import { BaseModel } from "./base"

export interface ICommon_Model_Workflow_Solution_Workflow {
    id :string ,
  workflow_solution_id:string,
  workflow_id:string
}
export const Table_Workflow_Solution_Workflow="workflow_solution_workflow"

class WorkflowSolutionWorkflowModel extends BaseModel {
  table=Table_Workflow_Solution_Workflow
  model=<ICommon_Model_Workflow_Solution_Workflow>{}
}

export  let workflowSolutionWorkflowModel=new WorkflowSolutionWorkflowModel