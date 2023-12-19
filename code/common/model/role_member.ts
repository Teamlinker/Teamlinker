import {BaseModel} from "./base"
import {ECommon_Model_Organization_Member_Type} from "./organization"

export interface ICommon_Model_Role_Member {
    id :string,
  member_id :string,
  member_type :ECommon_Model_Organization_Member_Type,
  role_id:string,
  item_id:string
}
export const Table_Role_Member="role_member"

class RoleMemberModel extends BaseModel {
  table=Table_Role_Member
  model=<ICommon_Model_Role_Member>{}
}

export let roleMemberModel=new RoleMemberModel