import { BaseModel } from "./base"

export interface ICommon_Model_User {
    id :string,
  username :string,
  photo:string,
  email :string,
  phone :string,
  created_time :Date,
  modified_time :Date,
  password :string,
  sign :string,
  location :string,
  title :string,
  active:number
}
export const Table_User="user"

class UserModel extends BaseModel {
  table=Table_User
  model=<ICommon_Model_User>{}
}

export  let userModel=new UserModel