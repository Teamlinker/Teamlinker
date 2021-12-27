import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateQuerySql } from "../../common/util/sql";
import { ICommon_Model_Issue_Type, issueTypeModel } from './../../../common/model/issue_type';
class IssueTypeMapper extends Mapper<typeof issueTypeModel> {
    constructor() {
        super(issueTypeModel)
    }
    async list():Promise<ICommon_Model_Issue_Type[]>
    {
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(issueTypeModel,[],null,null,{
            field:"name",
            type:"asc"
        }))
        return ret;
    }
}
export let issueTypeMapper=new IssueTypeMapper
