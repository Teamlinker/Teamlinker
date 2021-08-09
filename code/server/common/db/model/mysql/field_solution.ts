export default interface IServer_DB_Model_Field_Solution {
    id :bigint,
  created_time :number,
  modified_time :number ,
  created_by :bigint,
  modified_by: bigint,
  name :string,
  description :string,
  system :number,
}
export const Table_Field_Solution="field_solution"