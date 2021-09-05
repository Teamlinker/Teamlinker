export interface ICommon_Model_Field_Solution {
    id :bigint,
  created_time :Date,
  modified_time :Date ,
  created_by :bigint,
  modified_by: bigint,
  name :string,
  description :string,
  system :number,
}
export const Table_Field_Solution="field_solution"