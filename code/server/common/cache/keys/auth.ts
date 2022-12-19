import {cacheRedisType} from "../../types/cache";
import StringUtil from "../../util/string";
import {BaseRedisHashCache, BaseRedisStringCache, RedisHashKey, RedisStringKey} from './base';
import {ICommon_Model_Role, roleModel} from "../../../../common/model/role";
import {generateLeftJoinSql, generateQuerySql} from "../../util/sql";
import {commentModel} from "../../../../common/model/comment";
import {projectIssueModel} from "../../../../common/model/project_issue";
import {getMysqlInstance} from "../../db/mysql";
import {projectLabelModel} from "../../../../common/model/project_label";
import {projectModuleModel} from "../../../../common/model/project_module";
import {projectReleaseModel} from "../../../../common/model/project_release";
import {roleMemberModel} from "../../../../common/model/role_member";
import {ECommon_Model_Organization_Member_Type} from "../../../../common/model/organization";
import {Err} from "../../../../common/status/error";

export namespace REDIS_AUTH {
    export namespace Permission {
        export namespace Project {
            export class ProjectIdFromProjectIssueComment extends BaseRedisStringCache<string> {
                key="permission:projectIssueComment:{0}"
                constructor(private commentId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,commentId),cacheRedisType<string>().String,1000*10);
                }
                override async getValue(): Promise<string> {
                    let value:string;
                    let mysql=getMysqlInstance()
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        value=await this.objRedis.get()
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
                                value:this.commentId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            value=ret.project_id
                            await this.objRedis.set(value)
                        } else {
                            throw Err.Comment.commentNotFound
                        }
                    }
                    return value;
                }
            }
            export class ProjectIdFromProjectIssue extends BaseRedisStringCache<string> {
                key="permission:projectIssue:{0}"
                constructor(private projectIssueId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,projectIssueId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let ret=await mysql.executeOne(generateQuerySql(projectIssueModel,["project_id"],{
                            id:this.projectIssueId
                        }))
                        if(ret) {
                            projectId=ret.project_id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.ProjectIssue.projectIssueNotFound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectIdFromLabel extends BaseRedisStringCache<string> {
                key="permission:projectLabel:{0}"
                constructor(private labelId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,labelId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let ret=await mysql.executeOne(generateQuerySql(projectLabelModel,["project_id"],{
                            id:this.labelId
                        }))
                        if(ret) {
                            projectId=ret.project_id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.Label.labelNotfound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectIdFromProjectModule extends BaseRedisStringCache<string> {
                key="permission:projectModule:{0}"
                constructor(private moduleId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,moduleId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let ret=await mysql.executeOne(generateQuerySql(projectModuleModel,["project_id"],{
                            id:this.moduleId
                        }))
                        if(ret) {
                            projectId=ret.project_id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.Module.moduleNotFound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectIdFromProjectRelease extends BaseRedisStringCache<string> {
                key="permission:projectRelease:{0}"
                constructor(private releaseId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,releaseId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let ret=await mysql.executeOne(generateQuerySql(projectReleaseModel,["project_id"],{
                            id:this.releaseId
                        }))
                        if(ret) {
                            projectId=ret.project_id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.ProjectIssue.projectIssueNotFound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectOrganizationUsers extends BaseRedisHashCache<string> {
                key="permission:project:{0}:organizationUser"
                constructor(private projectId:string) {
                    super()
                    this.objRedis=new RedisHashKey(StringUtil.format(this.key,projectId),3600);
                }
                async getValue(userId:string):Promise<string> {
                    let mysql=getMysqlInstance()
                    let exist = await this.objRedis.exists();
                    if (!exist) {
                        let ret = await mysql.execute(generateQuerySql(roleMemberModel, ["member_id", "role_id"], {
                            item_id: this.projectId,
                            member_type: ECommon_Model_Organization_Member_Type.USER
                        }))
                        let map = {}
                        for (let obj of ret) {
                            map[obj.member_id] = obj.role_id
                        }
                        map["_"]=null;
                        await this.objRedis.set(map);
                    }
                    let roleId = await this.objRedis.get(userId)
                    if (roleId) {
                        let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId);
                        let role = await objRole.getValue();
                        return role.id
                    }
                    return null;
                }
            }
            export class ProjectTeams extends BaseRedisHashCache<object> {
                key="permission:project:{0}:team"
                constructor(private projectId:string) {
                    super()
                    this.objRedis=new RedisHashKey(StringUtil.format(this.key,projectId),3600);
                }
                async getValue():Promise<object> {
                    let mysql=getMysqlInstance()
                    let exist = await this.objRedis.exists();
                    if (!exist) {
                        let ret = await mysql.execute(generateQuerySql(roleMemberModel, ["member_id", "role_id"], {
                            item_id: this.projectId,
                            member_type: ECommon_Model_Organization_Member_Type.TEAM
                        }))
                        let map = {}
                        for (let obj of ret) {
                            map[obj.member_id] = obj.role_id
                        }
                        map["_"]=null;
                        await this.objRedis.set(map)
                    }
                    let relationship = await this.objRedis.getAll();
                    delete relationship["_"];
                    return relationship
                }
            }
            export class ProjectTourist extends BaseRedisStringCache<string> {
                key="permission:project:{0}:default"
                constructor(private projectId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,projectId),cacheRedisType<string>().String,3600);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let exist = await this.objRedis.exists();
                    if (!exist) {
                        let ret = await mysql.executeOne(generateQuerySql(roleMemberModel, ["item_id", "role_id"], {
                            item_id: this.projectId,
                            member_type:ECommon_Model_Organization_Member_Type.DEFAULT
                        }))
                        if(ret) {
                            await this.objRedis.set(ret.role_id);
                        }
                    }
                    let value = await this.objRedis.get();
                    return value
                }
            }
        }
        export namespace Role {
            export class RoleInfo extends BaseRedisStringCache<ICommon_Model_Role>{
                key="permission:role:{0}"
                override objRedis:RedisStringKey<ICommon_Model_Role>;
                constructor(private roleId:string) {
                    super();
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,roleId),cacheRedisType<ICommon_Model_Role>().Object,3600);
                }
                async getValue():Promise<ICommon_Model_Role> {
                    let value=await this.objRedis.get()
                    if(value===null) {
                        let mysql=getMysqlInstance()
                        let ret=await mysql.executeOne(generateQuerySql(roleModel,null,{
                            id:this.roleId
                        }))
                        if(ret) {
                            await this.objRedis.set(ret,24*3600);
                        }
                        return ret;
                    } else {
                        return value;
                    }
                }
            }
        }
        export namespace Team {
            export class OrganizationUsers extends BaseRedisHashCache<string>{
                key="permission:team:{0}:organizationUsers"
                override objRedis:RedisHashKey;
                constructor(private teamId:string) {
                    super();
                    this.objRedis=new RedisHashKey(StringUtil.format(this.key,teamId),3600);
                }
                async getValue(userId:string):Promise<string> {
                    let exist=await this.objRedis.exists()
                    if(!exist) {
                        let mysql=getMysqlInstance();
                        let ret=await mysql.execute(generateQuerySql(roleMemberModel,["member_id","role_id"],{
                            item_id:this.teamId
                        }))
                        let map={}
                        for(let obj of ret) {
                            map[obj.member_id]=obj.role_id
                        }
                        map["_"]=null;
                        await this.objRedis.set(map);
                    }
                    let value=await this.objRedis.get(userId)
                    return value;
                }
            }
        }
        export namespace Organization {
            export class Users extends BaseRedisHashCache<string>{
                key="permission:organization:{0}:users"
                override objRedis:RedisHashKey;
                constructor(private organizationId:string) {
                    super();
                    this.objRedis=new RedisHashKey(StringUtil.format(this.key,organizationId),3600);
                }
                async getValue(userId:string):Promise<string> {
                    let exist=await this.objRedis.exists()
                    if(!exist) {
                        let mysql=getMysqlInstance();
                        let ret=await mysql.execute(generateQuerySql(roleMemberModel,["member_id","role_id"],{
                            item_id:this.organizationId
                        }))
                        let map={}
                        for(let obj of ret) {
                            map[obj.member_id]=obj.role_id
                        }
                        map["_"]=null;
                        await this.objRedis.set(map);
                    }
                    let value=await this.objRedis.get(userId)
                    return value;
                }
            }
        }

    }
}