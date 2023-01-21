import {BaseModel} from "./base"

export enum ECommon_Model_Project_Release_Status {
  UNRELEASE,
  RELEASE,
  ARCHIVED
}
export interface ICommon_Model_Project_Release {
    id :string ,
  name :string,
  start_time :string,
  release_time :string,
  description :string,
  created_time :Date,
  modified_time :Date,
  created_by :string ,
  status :ECommon_Model_Project_Release_Status,
  project_id :string,
}
export const Table_Project_Release="project_release"

class ProjectReleaseModel extends BaseModel {
  table=Table_Project_Release
  model=<ICommon_Model_Project_Release>{}
}

export let projectReleaseModel=new ProjectReleaseModel