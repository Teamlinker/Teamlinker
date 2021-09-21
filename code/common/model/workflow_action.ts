export interface ICommon_Model_Workflow_Action {
    id :string ,
  name :string,
  system :number,
  description :string,
  source_node_id :string ,
  dest_node_id :string ,
  workflow_id :string,
}
export const Table_Workflow_Action="workflow_action"