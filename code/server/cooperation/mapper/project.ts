import { ICommon_Model_Project, projectModel } from '../../../common/model/project';
import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { generateCreateSql, generateDeleteSql, generateQuerySql, generateSnowId, generateUpdateSql } from "../../common/util/sql";
export namespace projectMapper {
    
    export async function createProject(info:ICommon_Model_Project):Promise<void> {
        if(!info || !info.name || !info.keyword || info.id){
            throw  Err.Common.paramError
        }
        info.id=await generateSnowId();
        var mysql=getMysqlInstance() 
        await mysql.execute(generateCreateSql(projectModel,info))
    }
 
    export async function getProjecById(id:string):Promise<ICommon_Model_Project> {
        if(!id) {
            throw  Err.Project.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(projectModel,[],{id}))
        return ret
    }

    export async function updateProject(info:ICommon_Model_Project):Promise<void> {
        if(!info.id) {
            throw  Err.Project.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let id=info.id;
        delete info.id,info.created_time,info.modified_time
        await mysql.execute(generateUpdateSql(projectModel,info,{id}))
    }

    export async function deleteProject(id):Promise<void> {
        if(!id) {
            throw  Err.Project.userIdNotExists
        }
        var mysql=getMysqlInstance();
        await mysql.execute(generateDeleteSql(projectModel,{id}))
    }
}