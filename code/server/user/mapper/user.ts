import { Table_User, ICommon_Model_User, UserModel } from './../../../common/model/user';
import { getMysqlInstance } from "../../common/db/mysql"
import {Err} from "../../../common/status/error"
import {generateCreateSql, generateDeleteSql, generateQuerySql, generateSnowId, generateUpdateSql} from "../../common/util/sql"
export namespace userMapper {
    export async function checkUserValid(username:string):Promise<boolean> {
        if(!username){
            return false
        }
        var mysql=getMysqlInstance()
        let ret=await mysql.executeOne<{
            username:string
        }>(generateQuerySql(new UserModel,["username"],{
            username:username
        }))
        return !!ret
    }
    
    export async function createUser(info:ICommon_Model_User):Promise<void> {
        if(!info || !info.username || !info.password ||info.id){
            throw  Err.Common.paramError
        }
        info.id=await generateSnowId()
        var mysql=getMysqlInstance() 
        await mysql.execute(generateCreateSql(new UserModel,info))
    }
 
    export async function getUserById(id:string):Promise<ICommon_Model_User> {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne<ICommon_Model_User>(generateQuerySql(new UserModel,[],{id}))
        return ret
    }

    export async function getUserByName(name:string):Promise<ICommon_Model_User> {
        if(!name) {
            throw  Err.User.userNameNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne<ICommon_Model_User>(generateQuerySql(new UserModel,[],{username:name}))
        return ret
    }

    export async function updateUser(info:ICommon_Model_User):Promise<void> {
        if(!info.id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let id=info.id;
        delete info.id,info.created_time,info.modified_time
        await mysql.execute(generateUpdateSql(new UserModel,info,{id}))
    }

    export async function deleteUser(id):Promise<void> {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateDeleteSql(new UserModel,{id}))
    }
}
