export default interface IServer_DB_Model_Project_Issue {
    unique_id :number,
  id :bigint ,
  created_time :number,
  modified_time :number,
  created_by :bigint ,
  modified_by :bigint ,
  project_id :bigint ,
  issue_type_id :bigint ,
  name :string,
  priority :number,
  assigner_id :bigint ,
  reporter_id :bigint ,
}
export const Table_Project_Issue="project_issue"