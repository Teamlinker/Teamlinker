export interface ICommon_Model_Admin {
    id:bigint,
    name:string,
    password:string,
    description:string,
    created_time:Date,
    modified_time:Date
}
export const Table_Admin="admin"