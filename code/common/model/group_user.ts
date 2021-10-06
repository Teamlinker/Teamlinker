import { BaseModel } from "./base"

export interface ICommon_Model_Group_User {
    user_id :string,
  group_id :string,
  role:string,
  id :string ,
}
export const Table_Group_User="team_user"

export class GroupUserModel extends BaseModel {
  table=Table_Group_User
  model=<ICommon_Model_Group_User>{}
}