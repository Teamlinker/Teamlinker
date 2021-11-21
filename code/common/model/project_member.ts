import { BaseModel } from "./base"
export interface ICommon_Model_Project_Member {
    id :string,
  role_id :string ,
  created_time :Date,
  modified_time :Date,
  project_id :string ,
  member_id :string ,
  type:ECommon_Model_Project_Member_Type
}
export const Table_Project_Member="project_member"
export enum ECommon_Model_Project_Member_Type {
  USER,
  TEAM
}

class ProjectMemberModel extends BaseModel {
  table=Table_Project_Member
  model=<ICommon_Model_Project_Member>{}
}

export let projectMemberModel=new ProjectMemberModel