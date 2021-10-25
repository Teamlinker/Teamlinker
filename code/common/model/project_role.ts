import { BaseModel } from "./base"

export interface ICommon_Model_Project_Role {
    id :string,
  name :string,
  created_time :Date,
  modified_time :Date,
  description:string,
  project_id:string
}
export const Table_Project_Role="project_role"

class ProjectRoleModel extends BaseModel {
  table=Table_Project_Role
  model=<ICommon_Model_Project_Role>{}
}

export let projectRoleModel=new ProjectRoleModel