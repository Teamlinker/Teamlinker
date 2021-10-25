import { BaseModel } from "./base"

export interface ICommon_Model_Team_Role {
    id :string,
  name :string,
  description:string,
  group_id:string
}
export const Table_Team_Role="team_role"

class TeamRoleModel extends BaseModel {
  table=Table_Team_Role
  model=<ICommon_Model_Team_Role>{}
}

export let teamRoleModel=new TeamRoleModel