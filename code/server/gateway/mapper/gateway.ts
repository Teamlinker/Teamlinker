import  { Table_Issue_Type ,ICommon_Model_Issue_Type} from '../../../common/model/issue_type';
import { getMysqlInstance } from "../../common/db/mysql";

export async function getIssueTypeListMapper() {
    var mysql=getMysqlInstance()
    var ret=await mysql.execute<ICommon_Model_Issue_Type[]>(`select * from ${Table_Issue_Type}`)
    return ret
}