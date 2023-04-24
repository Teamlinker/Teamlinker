import {BaseModel} from "./base"

export enum ECommon_Model_Role_Type {
  PROJECT,
  TEAM,
  ORGANIZATION,
  WIKI
}
export enum ECommon_Model_Role_Reserved {
  NORMAL,
  ADMIN
}
export interface ICommon_Model_Role {
    id :string,
  name :string,
  created_time :Date,
  modified_time :Date,
  description:string,
  item_id:string,
  organization_id:string,
  type:ECommon_Model_Role_Type
  value:number,
  reserved:ECommon_Model_Role_Reserved
}
export const Table_Role="role"

class RoleModel extends BaseModel {
  table=Table_Role
  model=<ICommon_Model_Role>{}
}

export let roleModel=new RoleModel