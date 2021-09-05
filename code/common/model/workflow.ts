export interface ICommon_Model_Workflow {
    id :bigint ,
  name :string,
  description :string,
  system :number,
  created_time :Date,
  modified_time :Date,
  created_by :bigint ,
  modified_by :bigint ,
}
export const Table_Workflow="workflow"