export default interface IServer_DB_Model_Workflow {
    id :bigint ,
  name :string,
  description :string,
  system :number,
  created_time :number,
  modified_time :number,
  created_by :bigint ,
  modified_by :bigint ,
}
export const Table_Workflow="workflow"