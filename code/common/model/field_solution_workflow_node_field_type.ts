import { BaseModel } from "./base"
export enum ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type {
  USER,
  RELEASE,
  ISSUE,
  MODULE,
  TAG
}
export interface ICommon_Model_Field_Solution_Workflow_Node_Field_Type {
    id :string,
  field_solution_id :string ,
  workflow_node_id :string ,
  field_type_id :string,
  optional :number,
  default_value :string,
  name:string,
  workflow_id:string,
  workflow_solution_id:string,
  description:string,
  sort:number,
  label_type:ECommon_Model_Field_Solution_Workflow_Node_Field_Type_Label_Type
}
export const Table_Field_Solution_Workflow_Node_Field_Type="field_solution_workflow_node_field_type"

class FieldSolutionWorkflowNodeFieldTypeModel extends BaseModel {
  table=Table_Field_Solution_Workflow_Node_Field_Type
  model=<ICommon_Model_Field_Solution_Workflow_Node_Field_Type>{}
}

export let fieldSolutionWorkflowNodeFieldTypeModel=new FieldSolutionWorkflowNodeFieldTypeModel