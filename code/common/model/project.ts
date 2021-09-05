export interface ICommon_Model_Project {
    id :bigint,
  key :string,
  name :string,
  created_time :Date,
  modified_time :Date,
  image :bigint,
  created_by :bigint ,
  description :string,
}
export const Table_Project="project"