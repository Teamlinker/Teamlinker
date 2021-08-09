export default interface IServer_DB_Model_Field {
    id:bigint,
    type_id:bigint,
    system:number,
    description:string,
    created_time:number,
    modified_time:number,
    created_by:bigint,
    modified_by:bigint,
    name:string
}
export const Table_Field="field"