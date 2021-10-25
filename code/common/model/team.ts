import { BaseModel } from "./base"

export interface ICommon_Model_Team {
    id :string ,
  name :string,
  created_time :Date,
  modified_time :Date,
  created_by :string ,
}
export const Table_Team="team"

class TeamModel extends BaseModel {
  table=Table_Team
  model=<ICommon_Model_Team>{}
}

export let teamModel=new TeamModel