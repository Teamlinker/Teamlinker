import { GroupRoleModel, ICommon_Model_Group_Role } from './../../../common/model/group_role';
import { Table_Group, ICommon_Model_Group, GroupModel } from './../../../common/model/group';
import { getMysqlInstance } from "../../common/db/mysql"
import {Err} from "../../../common/status/error"
import {generateCreateSql, generateDeleteSql, generateQuerySql, generateSnowId, generateUpdateSql} from "../../common/util/sql"
export namespace groupMapper {
    export async function checkGroup(name:string):Promise<boolean> {
        if(!name) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance() 
        let ret=await mysql.executeOne<ICommon_Model_Group>(generateQuerySql(new GroupModel,[],{name}))
        return !!ret;
    }

    
    export async function createGroup(info:ICommon_Model_Group):Promise<void> {
        if(!info || !info.name  ||info.id){
            throw  Err.Common.paramError
        }
        let isExists=await checkGroup(info.name);
        if(isExists) {
            throw Err.Group.groupExists
        }
        info.id=await generateSnowId()
        var mysql=getMysqlInstance() 
        await mysql.execute(generateCreateSql(new GroupModel,info))
    }
 
    export async function getGroupById(id:string):Promise<ICommon_Model_Group> {
        if(!id) {
            throw  Err.Group.groupNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne<ICommon_Model_Group>(generateQuerySql(new GroupModel,[],{id}))
        return ret
    }

    export async function updateGroup(info:ICommon_Model_Group):Promise<void> {
        if(!info.id) {
            throw  Err.Group.groupNotFound
        }
        var mysql=getMysqlInstance();
        let id=info.id;
        delete info.id,info.created_time,info.modified_time
        await mysql.execute(generateUpdateSql(new GroupModel,info,{id}))
    }

    export async function deleteGroup(id:string):Promise<void> {
        if(!id) {
            throw  Err.Group.groupNotFound
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateDeleteSql(new GroupModel,{id}))
    }

    export async function getRoles(groupId:string):Promise<ICommon_Model_Group_Role[]> {
        if(!groupId) {
            throw  Err.Group.groupNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.execute(generateQuerySql(new GroupRoleModel,null,{
            group_id:{
                value:[groupId,null],
                exp:"in"
            }
        }))
        return ret
    }

    // export async function members(groupId:string):Promise<{
    //     id:string,
    //     name:string,
    //     photo:string,
    //     role:ICommon_Model_Group_Role
    // }[]> {
    //     if(!groupId) {
    //         throw  Err.Group.groupNotFound
    //     }
    //     var mysql=getMysqlInstance();

    // }
}
