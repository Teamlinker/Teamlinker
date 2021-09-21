import { BaseModel } from "./base"

export interface ICommon_Model_Admin {
    id:string,
    name:string,
    password:string,
    description:string,
    created_time:Date,
    modified_time:Date
}
export const Table_Admin="admin"

export class AdminModel extends BaseModel {
    table=Table_Admin
    model=<ICommon_Model_Admin>{}
}