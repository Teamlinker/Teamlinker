import { ECommon_Model_Project_Member_Type, projectMemberModel } from '../../../common/model/project_member';
import { Permission_Types } from '../../../common/permission/permission';
import { REDIS_GATEWAY } from '../cache/keys/gateway';
import { getRedisInstance } from '../cache/redis';
import { getMysqlInstance } from '../db/mysql';
import { DComponent, getComponent } from '../decorate/component';
import { generateLeftJoinSql, generateQuerySql } from '../util/sql';
import StringUtil from '../util/string';
import { commentModel } from './../../../common/model/comment';
import { projectIssueModel } from './../../../common/model/project_issue';
import { projectLabelModel } from './../../../common/model/project_label';
import { projectModuleModel } from './../../../common/model/project_module';
import { projectReleaseModel } from './../../../common/model/project_release';
import { DPermission, PermissionBase } from './base';
import { PermissionTeam } from './team';

export type IPermission_Project =string[]

abstract class PermissionProject extends PermissionBase<IPermission_Project> {
    fieldName="projectId"
    keys=["permission:project:{0}:user","permission:project:{0}:team","permission:user:{0}:project:{1}"]
    async translateToField({commentId,projectIssueId,tagId,moduleId,projectReleaseId}: { [param: string]: any; isAdmin?: boolean;commentId:string,projectIssueId:string,tagId:string,moduleId:string,projectReleaseId:string }): Promise<string> {
        let mysql=getMysqlInstance()
        let projectId:string
        if(commentId) {
            let objRedis=REDIS_GATEWAY.Permission.projectIdFromProjectIssueComment(commentId)
            let exists=await objRedis.exists()
            if(exists) {
                projectId=await objRedis.get()
            } else {
                let sql=generateLeftJoinSql({
                    model:commentModel
                },{
                    model:projectIssueModel,
                    columns:["project_id"],
                    expression:{
                        id:{
                            model:commentModel,
                            field:"type_id"
                        }
                    }
                },{
                    id:{
                        model:commentModel,
                        value:commentId
                    }
                })
                let ret=await mysql.executeOne(sql)
                if(ret) {
                    projectId=ret.project_id
                    await objRedis.set(projectId)
                }
            }
            return projectId;
        } else if(projectIssueId) {
            let objRedis=REDIS_GATEWAY.Permission.projectIdFromProjectIssue(projectIssueId)
            let exists=await objRedis.exists()
            if(exists) {
                projectId=await objRedis.get()
            } else {
                let ret=await mysql.executeOne(generateQuerySql(projectIssueModel,["project_id"],{
                    id:projectIssueId
                }))
                if(ret) {
                    projectId=ret.project_id
                    await objRedis.set(projectId)
                }
            } 
            return projectId;
        } else if(tagId) {
            let objRedis=REDIS_GATEWAY.Permission.projectIdFromLabel(tagId)
            let exists=await objRedis.exists()
            if(exists) {
                projectId=await objRedis.get()
            } else {
                let ret=await mysql.executeOne(generateQuerySql(projectLabelModel,["project_id"],{
                    id:tagId
                }))
                if(ret) {
                    projectId=ret.project_id
                    await objRedis.set(projectId)
                }
            } 
            return projectId;
        } else if(moduleId) {
            let objRedis=REDIS_GATEWAY.Permission.projectIdFromProjectModule(moduleId)
            let exists=await objRedis.exists()
            if(exists) {
                projectId=await objRedis.get()
            } else {
                let ret=await mysql.executeOne(generateQuerySql(projectModuleModel,["project_id"],{
                    id:moduleId
                }))
                if(ret) {
                    projectId=ret.project_id
                    await objRedis.set(projectId)
                }
            } 
            return projectId;
        } else if(projectReleaseId) {
            let objRedis=REDIS_GATEWAY.Permission.projectIdFromProjectRelease(projectReleaseId)
            let exists=await objRedis.exists()
            if(exists) {
                projectId=await objRedis.get()
            } else {
                let ret=await mysql.executeOne(generateQuerySql(projectReleaseModel,["project_id"],{
                    id:projectReleaseId
                }))
                if(ret) {
                    projectId=ret.project_id
                    await objRedis.set(projectId)
                }
            } 
            return projectId;
        } 
    }
    buildKey({userId,projectId}: { [param: string]: any; userId: string; isAdmin: boolean;project:string }) {
        if(StringUtil.isEmpty(projectId)) {
            return null;
        }
        return this.keys.map((key,index)=>{
            if(index==0 || index==1) {
                return StringUtil.format(key,projectId)
            } else {
                return StringUtil.format(key,userId,projectId)
            }
        })
    }
    async generatorValue({userId,projectId}: { [param: string]: any; userId?: string; isAdmin?: boolean;project:string }, keys: string[]): Promise<IPermission_Project> {
        try {
            await this.tryLock(keys.map(item=>item.replace(/\:/g,"")));
            let redis = getRedisInstance()
            let mysql = getMysqlInstance()
            let permissionsSet = new Set<string>();
            let exist = await redis.exists(keys[2])
            if (exist) {
                let arr = await redis.sGet(keys[2])
                await this.unlock()
                return arr;
            }
            exist = await redis.exists(keys[0])
            if (!exist) {
                let ret = await mysql.execute(generateQuerySql(projectMemberModel, ["member_id", "role_id"], {
                    project_id: projectId,
                    type: ECommon_Model_Project_Member_Type.USER
                }))
                let map = {}
                for (let obj of ret) {
                    map[obj.member_id] = obj.role_id
                }
                await redis.hSet(keys[0], map)
            }
            let roleId = await redis.hGet(keys[0], userId)
            if (roleId) {
                let role = await this.getRolePermissionList(roleId)
                for (let o of role) {
                    permissionsSet.add(o)
                }
            }
            exist = await redis.exists(keys[1])
            if (!exist) {
                let ret = await mysql.execute(generateQuerySql(projectMemberModel, ["member_id", "role_id"], {
                    project_id: projectId,
                    type: ECommon_Model_Project_Member_Type.TEAM
                }))
                let map = {}
                for (let obj of ret) {
                    map[obj.member_id] = obj.role_id
                }
                await redis.hSet(keys[1], map)
            }
            let teamPermission = getComponent<PermissionTeam>(PermissionTeam.name)
            let relationship = await redis.hGetAll(keys[1])
            for (let teamId in relationship) {
                let keys = await teamPermission.buildKey({ teamId })
                let obj = await teamPermission.generatorValue({ teamId, userId }, keys)
                if (obj && obj.length > 0) {
                    for (let o of obj) {
                        permissionsSet.add(o)
                    }
                }
            }
            let arr = Array.from(permissionsSet)
            await redis.sSet(keys[2], arr, 3600 * 24)
            await this.unlock()
            return arr;
        } catch (err) {
            console.error("generatorValue error:" + err)
            await this.unlock()
        };
        
    }

}

@DPermission(Permission_Types.Project.READ)
@DComponent
export class PermissionProjectRead extends PermissionProject {
    check(obj:IPermission_Project):boolean {
        return obj.includes(Permission_Types.Project.READ.value);
    }
    
} 

@DPermission(Permission_Types.Project.EDIT)
@DComponent
export class PermissionProjectEdit extends PermissionProject {
    check(obj:IPermission_Project):boolean {
        return obj.includes(Permission_Types.Project.EDIT.value);
    }
    
} 

@DPermission(Permission_Types.Project.CREATE)
@DComponent
export class PermissionProjectCreate extends PermissionProject {
    check(obj:IPermission_Project):boolean {
        return obj.includes(Permission_Types.Project.CREATE.value);
    }
    
} 

@DPermission(Permission_Types.Project.DELETE)
@DComponent
export class PermissionProjectDelete extends PermissionProject {
    check(obj:IPermission_Project):boolean {
        return obj.includes(Permission_Types.Project.DELETE.value);
    }
    
} 