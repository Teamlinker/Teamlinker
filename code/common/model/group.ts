import { BaseModel } from "./base"

export interface ICommon_Model_Group {
    id :string ,
  name :string,
  created_time :Date,
  modified_time :Date,
  created_by :string ,
}
export const Table_Group="team"

export class GroupModel extends BaseModel {
  table=Table_Group
  model=<ICommon_Model_Group>{}
}