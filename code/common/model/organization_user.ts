import { BaseModel } from "./base"
export enum ECommon_Organization_User_Role {
  USER,
  ADMIN
}
export interface ICommon_Model_Organization_User {
    id :string,
  organization_id :string,
  user_id:string,
  email :string,
  phone :string,
  created_time :Date,
  modified_time :Date,
  location :string,
  title :string,
  active:number,
  role:ECommon_Organization_User_Role,
  job:string,
  nickname:string
}
export const Table_Organization_User="organization_user"

class OrganizationUserModel extends BaseModel {
    table=Table_Organization_User
    model=<ICommon_Model_Organization_User>{}
  }
  
export let organizationUserModel=new OrganizationUserModel