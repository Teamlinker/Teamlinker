export interface ICommon_Model_Workflow_Action {
    id :bigint ,
  name :string,
  system :number,
  description :string,
  source_node_id :bigint ,
  dest_node_id :bigint ,
  workflow_id :bigint,
}
export const Table_Workflow_Action="workflow_action"