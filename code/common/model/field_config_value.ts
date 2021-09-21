import { BaseModel } from "./base"

export interface ICommon_Model_Field_Config_Value {
    id: string,
  field_id :string,
  value :string,
  sort :number,
  label :string,
}
export const Table_Field_Config_Value="field_config_value"

export class FieldConfigValueModel extends BaseModel {
  table=Table_Field_Config_Value
  model=<ICommon_Model_Field_Config_Value>{}
}