import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateQuerySql, generateUpdateSql } from "../../common/util/sql";
import { ICommon_Model_User, userModel } from './../../../common/model/user';
class UserMapper extends Mapper<typeof userModel> {
    constructor(){
        super(userModel)
    }
    async checkUserValid(username:string):Promise<boolean> {
        if(!username){
            return false
        }
        var mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(userModel,["username"],{
            username:username
        }))
        return !!ret
    }
    
    async getUserByName(name:string):Promise<ICommon_Model_User> {
        if(!name) {
            throw  Err.User.userNameNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(userModel,[],{username:name}))
        return ret
    }


    async active(id:string,active:number) {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateUpdateSql(userModel,{active},{id}))
    }
}
export let userMapper=new UserMapper()
