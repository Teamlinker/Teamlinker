export interface ICommon_Model_Project_Release {
    id :string ,
  name :string,
  start_time :number,
  release_time :number,
  description :string,
  created_time :Date,
  modified_time :Date,
  created_by :string ,
  modified_by :string,
  status :number,
  project_id :string,
}
export const Table_Project_Release="project_release"