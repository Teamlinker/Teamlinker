import { ICommon_Model_Team, teamModel } from '../../../common/model/team';
import { ICommon_Model_Team_Role, teamRoleModel } from '../../../common/model/team_role';
import { teamUserModel } from '../../../common/model/team_user';
import { userModel } from '../../../common/model/user';
import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { generateCreateSql, generateDeleteSql, generateLeftJoin2Sql, generateQuerySql, generateSnowId, generateUpdateSql } from "../../common/util/sql";
export namespace teamMapper {
    export async function checkGroup(name:string):Promise<boolean> {
        if(!name) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance() 
        let ret=await mysql.executeOne(generateQuerySql(teamModel,null,{name}))
        return !!ret;
    }

    
    export async function createGroup(info:ICommon_Model_Team):Promise<void> {
        if(!info || !info.name  ||info.id){
            throw  Err.Common.paramError
        }
        let isExists=await checkGroup(info.name);
        if(isExists) {
            throw Err.Team.teamExists
        }
        info.id=await generateSnowId()
        var mysql=getMysqlInstance() 
        await mysql.execute(generateCreateSql(teamModel,info))
    }
 
    export async function getGroupById(id:string):Promise<ICommon_Model_Team> {
        if(!id) {
            throw  Err.Team.teamNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(teamModel,[],{id}))
        return ret
    }

    export async function updateGroup(info:ICommon_Model_Team):Promise<void> {
        if(!info.id) {
            throw  Err.Team.teamNotFound
        }
        var mysql=getMysqlInstance();
        let id=info.id;
        delete info.id,info.created_time,info.modified_time
        await mysql.execute(generateUpdateSql(teamModel,info,{id}))
    }

    export async function deleteGroup(id:string):Promise<void> {
        if(!id) {
            throw  Err.Team.teamNotFound
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateDeleteSql(teamModel,{id}))
    }

    export async function getRoles(teamId:string):Promise<ICommon_Model_Team_Role[]> {
        if(!teamId) {
            throw  Err.Team.teamNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.execute(generateQuerySql(teamRoleModel,null,{
            group_id:{
                value:[teamId,null],
                exp:"in"
            }
        }))
        return ret
    }

    export async function members(teamId:string):Promise<{
        id:string,
        name:string,
        photo:string,
        role:Omit<ICommon_Model_Team_Role,"group_id">
    }[]> {
        if(!teamId) {
            throw  Err.Team.teamNotFound
        }
        var mysql=getMysqlInstance();
        let sql=generateLeftJoin2Sql({
            model:teamUserModel
        },{
            model:userModel,
            columns:["id","username","photo"],
            expression:{
                id:{
                    model:teamUserModel,
                    filed:"user_id"
                }
            },
            rename:{
                fields:["username"],
                newFields:["name"]
            }
        },{
            model:teamRoleModel,
            columns:["id","name","description"],
            aggregation:"role",
            expression:{
                id:{
                    model:teamUserModel,
                    filed:"role"
                }
            }
        },{
            group_id:{
                value:teamId,
                model:teamUserModel
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }
}
