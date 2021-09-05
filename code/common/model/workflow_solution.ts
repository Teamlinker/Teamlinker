export interface ICommon_Model_Workflow_Solution {
    id :bigint ,
  created_time :Date,
  modified_time :Date,
  created_by :bigint ,
  modified_by :bigint,
  system :number,
  name :string,
  description :string,
}
export const Table_Workflow_Solution="workflow_solution"