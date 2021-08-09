export default interface IServer_DB_Model_Issue_Type {
    id:bigint,
    name:string,
    icon:bigint,
    description:string,
    multi:number
}
export const Table_Issue_Type="issue_type"