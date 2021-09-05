export interface ICommon_Model_Project_Release {
    id :bigint ,
  name :string,
  start_time :number,
  release_time :number,
  description :string,
  created_time :Date,
  modified_time :Date,
  created_by :bigint ,
  modified_by :bigint,
  status :number,
  project_id :bigint,
}
export const Table_Project_Release="project_release"