import { BaseModel } from "./base"
import { ECommon_Model_Project_Member_Type } from "./project_member"
export enum ECommon_Model_Role_Memeber_Type {
    Project,
    Team
}
export interface ICommon_Model_Role_Memeber {
    id :string,
  member_id :string,
  member_type :ECommon_Model_Project_Member_Type,
  role_id:string,
  item_id:string,
  item_type:ECommon_Model_Role_Memeber_Type
}
export const Table_Role_Member="role_member"

class RoleMemberModel extends BaseModel {
  table=Table_Role_Member
  model=<ICommon_Model_Role_Memeber>{}
}

export let roleMemberModel=new RoleMemberModel