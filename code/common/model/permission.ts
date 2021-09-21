import { BaseModel } from "./base"

export interface ICommon_Model_Permission {
    id: string,
  name :string,
  created_time :Date,
  modified_time :Date,
  type :string,
  value :string,
}
export const Table_Permission="permission"

export class PermissionModel extends BaseModel {
  table=Table_Permission
  model=<ICommon_Model_Permission>{}
}