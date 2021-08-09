export default interface IServer_DB_Model_Field_Solution_Workflow_Action {
    id :bigint,
  field_solution :bigint ,
  workflow_action_id :bigint ,
  field :bigint,
  optional :number,
  default_value :string,
  multi :number,
  sort :number,
}
export const Table_Field_Solution_Workflow_Action="field_solution_workflow_action"