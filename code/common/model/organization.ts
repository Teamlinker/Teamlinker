import {BaseModel} from "./base"

export enum ECommon_Model_Organization_Member_Type {
    USER,
    TEAM,
    MEMBERTAG,
    DEFAULT
}
export interface ICommon_Model_Organization {
    id:string,
    name:string,
    description:string,
    photo:string,
    created_time:Date,
    modified_time:Date,
    active:number,
    created_by_pure:string,
}
export const Table_Organization="organization"

class OrganizationModel extends BaseModel {
    table=Table_Organization
    model=<ICommon_Model_Organization>{}
  }
  
export let organizationModel=new OrganizationModel