import { BaseModel } from "./base"

export interface ICommon_Model_Group_Role {
    id :string,
  name :string,
  description:string,
  group_id:string
}
export const Table_Group_Role="team_role"

export class GroupRoleModel extends BaseModel {
  table=Table_Group_Role
  model=<ICommon_Model_Group_Role>{}
}