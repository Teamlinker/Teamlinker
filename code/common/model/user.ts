import {BaseModel} from "./base"

export enum ECommon_User_Type {
  USER,
  ADMIN,
  DELETED
}
export interface ICommon_Model_User {
    id :string,
  username :string,
  photo:string,
  created_time :Date,
  modified_time :Date,
  password :string,
  sign :string,
  active:number,
  role:ECommon_User_Type,
  count:number
}
export const Table_User="user"

class UserModel extends BaseModel {
  table=Table_User
  model=<ICommon_Model_User>{}
}

export  let userModel=new UserModel