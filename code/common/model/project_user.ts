import {BaseModel} from "./base"
export interface ICommon_Model_Project_User {
    id :string,
  role :string ,
  created_time :Date,
  modified_time :Date,
  project_id :string ,
  user_id :string ,
}
export const Table_Project_User="project_user"


export class ProjectUserModel extends BaseModel {
  table=Table_Project_User
  model=<ICommon_Model_Project_User>{}
}