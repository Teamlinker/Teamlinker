export interface ICommon_Model_Project_Issue_Field_Value {
    id :bigint,
  project_issue_id :bigint,
  field_id :bigint,
  value :string,
  sort :number,
}
export const Table_Project_Issue_Field_Value="project_issue_field_value"