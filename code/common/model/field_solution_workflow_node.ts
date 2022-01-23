import { BaseModel } from "./base"

export interface ICommon_Model_Field_Solution_Workflow_Node {
    id :string,
  field_solution_id :string ,
  workflow_node_id :string ,
  field_type_id :string,
  optional :number,
  default_value :string,
  name:string,
  workflow_id:string,
  workflow_solution_id:string,
  issue_type_id:string,
  description:string
}
export const Table_Field_Solution_Workflow_Node="field_solution_workflow_node"

class FieldSolutionWorkflowNodeModel extends BaseModel {
  table=Table_Field_Solution_Workflow_Node
  model=<ICommon_Model_Field_Solution_Workflow_Node>{}
}

export let fieldSolutionWorkflowNodeModel=new FieldSolutionWorkflowNodeModel