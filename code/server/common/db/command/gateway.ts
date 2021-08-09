import IServer_DB_Model_Issue_Type, { Table_Issue_Type } from './../model/mysql/issue_type';
import { getMysqlInstance } from "../mysql";

export async function getIssueTypeListMapper() {
    var mysql=getMysqlInstance()
    var ret=await mysql.execute<IServer_DB_Model_Issue_Type[]>(`select * from ${Table_Issue_Type}`)
    return ret
}