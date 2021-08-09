export default interface IServer_DB_Model_Project_User {
    id :bigint,
  permission :bigint ,
  created_time :number,
  modified_time :number,
  project_id :bigint ,
  user_id :bigint ,
}
export const Table_Project_User="project_user"