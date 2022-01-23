import { BaseModel } from "./base"

export interface ICommon_Model_Field_Solution_Workflow_Solution {
    id: string,
  field_solution_id :string,
  workflow_solution_id :string,
}
export const Table_Field_Solution_Workflow_Solution="field_solution_workflow_solution"

class FieldSolutionWorkflowSolutionModel extends BaseModel {
  table=Table_Field_Solution_Workflow_Solution
  model=<ICommon_Model_Field_Solution_Workflow_Solution>{}
}

export let fieldSolutionWorkflowSolutionModel=new FieldSolutionWorkflowSolutionModel