import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { generateCreateSql, generateDeleteSql, generateQuerySql, generateSnowId, generateUpdateSql } from "../../common/util/sql";
import { userModel, ICommon_Model_User } from './../../../common/model/user';
export namespace adminMapper {
    
    export async function createUser(info:ICommon_Model_User):Promise<void> {
        if(!info || !info.username || !info.password ||info.id){
            throw  Err.Common.paramError
        }
        info.id=await generateSnowId()
        info.admin=1
        var mysql=getMysqlInstance() 
        await mysql.execute(generateCreateSql(userModel,info))
    }
 
    export async function getUserById(id:string):Promise<ICommon_Model_User> {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(userModel,[],{id}))
        return ret
    }

    export async function updateUser(info:ICommon_Model_User):Promise<void> {
        if(!info.id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let id=info.id;
        delete info.id,info.created_time,info.modified_time
        await mysql.execute(generateUpdateSql(userModel,info,{id}))
    }

    export async function deleteUser(id):Promise<void> {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateDeleteSql(userModel,{id}))
    }

    export async function getUserByName(name:string):Promise<ICommon_Model_User> {
        if(!name) {
            throw  Err.User.userNameNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(userModel,[],{username:name}))
        return ret
    }
}
