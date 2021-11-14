import { BaseModel } from "./base"

export interface ICommon_Model_Project_Module {
    id :string,
    name:string,
    project_id:string
    parent_module_id:string
}
export const Table_Project_Module="project_module"

class ProjectModuleModel extends BaseModel {
    table=Table_Project_Module
    model=<ICommon_Model_Project_Module>{}
  }
  
export let projectModuleModel=new ProjectModuleModel