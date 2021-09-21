import { BaseModel } from "./base"

export interface ICommon_Model_Role_Permission {
    role_id :string,
  permission_id :string,
  id :string ,
}
export const Table_Role_Permission="role_permission"

export class RolelPermissionModel extends BaseModel {
  table=Table_Role_Permission
  model=<ICommon_Model_Role_Permission>{}
}