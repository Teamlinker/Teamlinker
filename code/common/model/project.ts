import { BaseModel } from "./base"

export interface ICommon_Model_Project {
    id :string,
  keyword :string,
  name :string,
  created_time :Date,
  modified_time :Date,
  photo :string,
  created_by :string ,
  description :string,
  organization_id:string
}
export const Table_Project="project"

class ProjectModel extends BaseModel {
  table=Table_Project
  model=<ICommon_Model_Project>{}
}

export let projectModel=new ProjectModel