import {BaseModel} from "./base"

export interface ICommon_Model_Organization_User {
    id: string,
    organization_id: string,
    user_id: string,
    email: string,
    phone: string,
    created_time: Date,
    modified_time: Date,
    location: string,
    department: string,
    active: number,
    job: string,
    nickname: string,
    remark: string
}
export const Table_Organization_User="organization_user"

class OrganizationUserModel extends BaseModel {
    table = Table_Organization_User
    model = <ICommon_Model_Organization_User>{}
}
  
export let organizationUserModel=new OrganizationUserModel