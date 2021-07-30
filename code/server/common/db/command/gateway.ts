import IServer_Mysql_Model_Issue_Type, { Issue_Type_Table } from './../model/mysql/issue_type';
import { getMysqlInstance } from "../mysql";

export async function getIssueTypeListMapper() {
    var mysql=getMysqlInstance()
    var ret=await mysql.execute<IServer_Mysql_Model_Issue_Type[]>(`select * from ${Issue_Type_Table}`)
    return ret
}