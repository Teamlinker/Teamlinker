export interface ICommon_Model_Comment {
    id:string,
    type:number,
    type_id:string,
    user_id:string,
    content:string,
    created_time:Date,
    modified_time:Date
}
export const Table_Comment="comment"