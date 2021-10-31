import { BaseModel } from "./base"
export interface ICommon_Model_Project_Member {
    id :string,
  role_id :string ,
  created_time :Date,
  modified_time :Date,
  project_id :string ,
  member_id :string ,
  type:number
}
export const Table_Project_Member="project_member"


class ProjectMemberModel extends BaseModel {
  table=Table_Project_Member
  model=<ICommon_Model_Project_Member>{}
}

export let projectMemberModel=new ProjectMemberModel