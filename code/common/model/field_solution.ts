import { BaseModel } from "./base"

export interface ICommon_Model_Field_Solution {
    id :string,
  created_time :Date,
  modified_time :Date ,
  name :string,
  description :string,
  organization_id:string
}
export const Table_Field_Solution="field_solution"

class FieldSolutionModel extends BaseModel {
  table=Table_Field_Solution
  model=<ICommon_Model_Field_Solution>{}
}

export let fieldSolutionModel=new FieldSolutionModel