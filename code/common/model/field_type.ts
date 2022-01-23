import { BaseModel } from "./base"

export interface ICommon_Model_Field_Type {
    id :string,
  name :string,
  icon :string,
  description :string,
  multi :number,
}
export const Table_Field_Type="field_type"

class FieldTypeModel extends BaseModel {
  table=Table_Field_Type
  model=<ICommon_Model_Field_Type>{}
}

export let fieldTypeModel=new FieldTypeModel