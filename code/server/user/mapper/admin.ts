import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { generateCreateSql, generateDeleteSql, generateQuerySql, generateSnowId, generateUpdateSql } from "../../common/util/sql";
import { adminModel, ICommon_Model_Admin } from './../../../common/model/admin';
export namespace adminMapper {
    
    export async function createUser(info:ICommon_Model_Admin):Promise<void> {
        if(!info || !info.name || !info.password ||info.id){
            throw  Err.Common.paramError
        }
        info.id=await generateSnowId()
        var mysql=getMysqlInstance() 
        await mysql.execute(generateCreateSql(adminModel,info))
    }
 
    export async function getUserById(id:string):Promise<ICommon_Model_Admin> {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(adminModel,[],{id}))
        return ret
    }

    export async function updateUser(info:ICommon_Model_Admin):Promise<void> {
        if(!info.id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let id=info.id;
        delete info.id,info.created_time,info.modified_time
        await mysql.execute(generateUpdateSql(adminModel,info,{id}))
    }

    export async function deleteUser(id):Promise<void> {
        if(!id) {
            throw  Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateDeleteSql(adminModel,{id}))
    }

    export async function getUserByName(name:string):Promise<ICommon_Model_Admin> {
        if(!name) {
            throw  Err.User.userNameNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(adminModel,[],{name:name}))
        return ret
    }
}
