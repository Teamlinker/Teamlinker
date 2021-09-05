export interface ICommon_Model_Comment {
    id:bigint,
    type:number,
    type_id:bigint,
    user_id:bigint,
    content:string,
    created_time:Date,
    modified_time:Date
}
export const Table_Comment="comment"