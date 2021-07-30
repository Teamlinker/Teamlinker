export default interface IServer_Mysql_Model_Issue_Type {
    id:bigint,
    name:string,
    icon:bigint,
    description:string,
    multi:number
}
export const Issue_Type_Table="issue_type"