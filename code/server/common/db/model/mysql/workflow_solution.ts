export default interface IServer_DB_Model_Workflow_Solution {
    id :bigint ,
  created_time :number,
  modified_time :number,
  created_by :bigint ,
  modified_by :bigint,
  system :number,
  name :string,
  description :string,
}
export const Table_Workflow_Solution="workflow_solution"