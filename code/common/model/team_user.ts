import { BaseModel } from "./base"

export interface ICommon_Model_Team_User {
    user_id :string,
  team_id :string,
  role_id:string,
  id :string ,
}
export const Table_Team_User="team_user"

class TeamUserModel extends BaseModel {
  table=Table_Team_User
  model=<ICommon_Model_Team_User>{}
}

export  let teamUserModel=new TeamUserModel