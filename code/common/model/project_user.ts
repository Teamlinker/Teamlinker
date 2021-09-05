export interface ICommon_Model_Project_User {
    id :bigint,
  permission :bigint ,
  created_time :Date,
  modified_time :Date,
  project_id :bigint ,
  user_id :bigint ,
}
export const Table_Project_User="project_user"