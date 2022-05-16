import { BaseModel } from "./base"

export interface ICommon_Model_Organization {
    id:string,
    name:string,
    description:string,
    photo:string,
    created_time:Date,
    modified_time:Date,
    active:number,
    user_id:string,
}
export const Table_Organization="organization"

class OrganizationModel extends BaseModel {
    table=Table_Organization
    model=<ICommon_Model_Organization>{}
  }
  
export let organizationModel=new OrganizationModel