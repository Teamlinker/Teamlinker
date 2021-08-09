export default interface IServer_DB_Model_Workflow_Node {
    id :bigint ,
  name :string,
  description :string,
  system :number,
  status :number,
  workflow_id :bigint ,
}
export const Table_Workflow_Node="workflow_node"