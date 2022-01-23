import { BaseModel } from "./base"

export interface ICommon_Model_Field_Type_Config_Value {
    id: string,
    field_solution_workflow_node_field_type_id :string,
  value :string,
  name :string,
  selected :number,
}
export const Table_Field_Type_Config_Value="field_type_config_value"

class FieldTypeConfigValueModel extends BaseModel {
  table=Table_Field_Type_Config_Value
  model=<ICommon_Model_Field_Type_Config_Value>{}
}

export let fieldTypeConfigValueModel=new FieldTypeConfigValueModel