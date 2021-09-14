import { Table_User, ICommon_Model_User } from './../../../common/model/user';
import { getMysqlInstance } from "../../common/db/mysql"
import {Err} from "../../../common/status/error"
import {generateCreateSql, generateDeleteSql, generateQuerySql, generateUpdateSql} from "../../common/util/sql"
export namespace userMapper {
    export async function checkUserValid(username:string):Promise<boolean> {
        if(!username){
            return false
        }
        var mysql=getMysqlInstance()
        let ret=await mysql.execute<{
            username:string
        }>(generateQuerySql(Table_User,["username"],{
            username:username
        }),true)
        return !!ret
    }
    
    export async function createUser(info:ICommon_Model_User):Promise<void> {
        if(!info || !info.username || !info.password ||!info.id){
            throw  Err.Common.paramError
        }
        var mysql=getMysqlInstance() 
        await mysql.execute<Extract<typeof createUser,ICommon_Model_User>>(generateCreateSql(Table_User,info))
    }

    export async function getUserById(id:string):Promise<ICommon_Model_User> {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.execute<ICommon_Model_User>(generateQuerySql(Table_User,[],{id}),true)
        return ret
    }

    export async function getUserByName(name:string):Promise<ICommon_Model_User> {
        if(!name) {
            throw  Err.User.userNameNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.execute<ICommon_Model_User>(generateQuerySql(Table_User,[],{username:name}),true)
        return ret
    }

    export async function updateUser(info:ICommon_Model_User):Promise<void> {
        if(!info.id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let id=info.id;
        delete info.id,info.created_time,info.modified_time
        await mysql.execute(generateUpdateSql(Table_User,info,{id}))
    }

    export async function deleteUser(id):Promise<void> {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateDeleteSql(Table_User,{id}))
    }
}
