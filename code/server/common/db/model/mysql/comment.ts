export default interface IServer_DB_Model_Comment {
    id:bigint,
    type:number,
    type_id:bigint,
    user_id:bigint,
    content:string,
    created_time:number,
    modified_time:number
}
export const Table_Comment="comment"