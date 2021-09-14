export interface ICommon_Model_Project_Issue {
    unique_id :number,
  id :string ,
  created_time :Date,
  modified_time :Date,
  created_by :string ,
  modified_by :string ,
  project_id :string ,
  issue_type_id :string ,
  name :string,
  priority :number,
  assigner_id :string ,
  reporter_id :string ,
}
export const Table_Project_Issue="project_issue"