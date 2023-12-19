import {BaseModel} from "./base"

export interface ICommon_Model_Project_Issue_Field_Value {
    id :string,
  project_issue_id :string,
  workflow_node_field_type_id :string,
  number_value :number,
  field_config_ids:string[],
  string_value:string,
  ref_values:string[]
}
export const Table_Project_Issue_Field_Value="project_issue_field_value"

class ProjectIssueFieldValueModel extends BaseModel {
  table=Table_Project_Issue_Field_Value
  model=<ICommon_Model_Project_Issue_Field_Value>{}
}

export let projectIssueFieldValueModel=new ProjectIssueFieldValueModel