import { BaseModel } from "./base"

export interface ICommon_Model_User {
    id :string,
  username :string,
  email :string,
  phone :string,
  created_time :Date,
  modified_time :Date,
  password :string,
  sign :string,
  location :string,
  title :string,
}
export const Table_User="user"

export class UserModel extends BaseModel {
  table=Table_User
  model=<ICommon_Model_User>{}
}