import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateQuerySql } from "../../common/util/sql";
import { ECommon_User_Type, ICommon_Model_User, userModel } from './../../../common/model/user';
class AdminMapper extends Mapper<typeof userModel> {
    constructor(){
        super(userModel)
    }
    override async createConfig(info:ICommon_Model_User) {
        info.role=ECommon_User_Type.ADMIN
    }
    override async updateConfig(info:ICommon_Model_User) {
        info.role=ECommon_User_Type.ADMIN
    }
    async getUserByName(name:string):Promise<ICommon_Model_User> {
        if(!name) {
            throw  Err.User.userNameNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(userModel,[],{username:name,role:ECommon_User_Type.ADMIN}))
        return ret
    }
}
export let adminMapper=new AdminMapper
