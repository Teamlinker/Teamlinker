import {cacheRedisType} from "../../types/cache";
import StringUtil from "../../../../common/util/string";
import {
    BaseRedisHashCache,
    BaseRedisSetCache,
    BaseRedisStringCache,
    RedisHashKey,
    RedisSetKey,
    RedisStringKey
} from './base';
import {ICommon_Model_Role, roleModel} from "../../../../common/model/role";
import {generateLeftJoin2Sql, generateLeftJoinSql, generateQuerySql} from "../../util/sql";
import {contentModel} from "../../../../common/model/content";
import {projectIssueModel} from "../../../../common/model/project_issue";
import {getMysqlInstance} from "../../db/mysql";
import {projectLabelModel} from "../../../../common/model/project_label";
import {projectModuleModel} from "../../../../common/model/project_module";
import {projectReleaseModel} from "../../../../common/model/project_release";
import {roleMemberModel} from "../../../../common/model/role_member";
import {ECommon_Model_Organization_Member_Type} from "../../../../common/model/organization";
import {Err} from "../../../../common/status/error";
import {userModel} from "../../../../common/model/user";
import {organizationUserModel} from "../../../../common/model/organization_user";
import {memberTagMemberModel} from "../../../../common/model/member_tag_member";
import {wikiModel} from "../../../../common/model/wiki";
import {wikiItemModel} from "../../../../common/model/wiki_item";
import {meetingRoomModel} from "../../../../common/model/meeting_room";
import {calendarEventModel} from "../../../../common/model/calendar_event";
import {boardModel} from "../../../../common/model/board";
import {boardSprintModel} from "../../../../common/model/board_sprint";
import {boardSprintSwimLaneModel} from "../../../../common/model/board_sprint_swimlane";
import {boardColumnModel} from "../../../../common/model/board_column";
import {planModel} from "../../../../common/model/plan";
import {projectModel} from "../../../../common/model/project";
import {planTableModel} from "../../../../common/model/plan_table";

export namespace REDIS_AUTH {
    export namespace Resource {
        let RESOURCE_ORGANIZATION=`resource:{0}:organization`
        export function resourceOrganization(resourceId:string)
        {
            let obj=new RedisStringKey(StringUtil.format(RESOURCE_ORGANIZATION,resourceId),cacheRedisType<string>().String,3600)
            return obj
        }
    }
    export namespace Permission {
        export namespace Project {
            export function calPermission(projectId:string,organizationUserId:string)
            {
                let key="permission:project:{0}:organizationUser:{1}:calPermission"
                let obj=new RedisStringKey(StringUtil.format(key,projectId,organizationUserId),cacheRedisType<number>().Number,60)
                return obj
            }
            export class createdByPureFromProjectIssueComment extends BaseRedisStringCache<string> {
                key="permission:projectIssueComment:{0}:createdByPure"
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
                        let sql=generateLeftJoin2Sql({
                            model:contentModel
                        },{
                            model:organizationUserModel,
                            expression:{
                                id:{
                                    model:contentModel,
                                    field:"created_by"
                                }
                            }
                        },{
                            model:userModel,
                            columns:["id"],
                            expression:{
                                id:{
                                    model:organizationUserModel,
                                    field:"user_id"
                                }
                            }
                        },{
                            id:{
                                model:contentModel,
                                value:this.commentId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            value=ret.id
                            await this.objRedis.set(value)
                        } else {
                            throw Err.Content.contentNotFound
                        }
                    }
                    return value;
                }
            }
            export class createdByPureFromProjectIssue extends BaseRedisStringCache<string> {
                key="permission:projectIssue:{0}:createdByPure"
                constructor(private projectIssueId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,projectIssueId),cacheRedisType<string>().String,1000*10);
                }
                override async getValue(): Promise<string> {
                    let value:string;
                    let mysql=getMysqlInstance()
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        value=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoin2Sql({
                            model:projectIssueModel
                        },{
                            model:organizationUserModel,
                            expression:{
                                id:{
                                    model:projectIssueModel,
                                    field:"created_by"
                                }
                            }
                        },{
                            model:userModel,
                            columns:["id"],
                            expression:{
                                id:{
                                    model:organizationUserModel,
                                    field:"user_id"
                                }
                            }
                        },{
                            id:{
                                model:projectIssueModel,
                                value:this.projectIssueId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            value=ret.id
                            await this.objRedis.set(value)
                        } else {
                            throw Err.Project.ProjectIssue.projectIssueNotFound
                        }
                    }
                    return value;
                }
            }
            export class createdByPureFromProjectRelease extends BaseRedisStringCache<string> {
                key="permission:projectRelease:{0}:createdByPure"
                constructor(private projectReleaseId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,projectReleaseId),cacheRedisType<string>().String,1000*10);
                }
                override async getValue(): Promise<string> {
                    let value:string;
                    let mysql=getMysqlInstance()
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        value=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoin2Sql({
                            model:projectReleaseModel
                        },{
                            model:organizationUserModel,
                            expression:{
                                id:{
                                    model:projectReleaseModel,
                                    field:"created_by"
                                }
                            }
                        },{
                            model:userModel,
                            columns:["id"],
                            expression:{
                                id:{
                                    model:organizationUserModel,
                                    field:"user_id"
                                }
                            }
                        },{
                            id:{
                                model:projectReleaseModel,
                                value:this.projectReleaseId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            value=ret.id
                            await this.objRedis.set(value)
                        } else {
                            throw Err.Project.Release.releaseNotFound
                        }
                    }
                    return value;
                }
            }
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
                            model:contentModel
                        },{
                            model:projectIssueModel,
                            columns:["project_id"],
                            expression:{
                                id:{
                                    model:contentModel,
                                    field:"ref_id"
                                }
                            }
                        },{
                            id:{
                                model:contentModel,
                                value:this.commentId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            value=ret.project_id
                            await this.objRedis.set(value)
                        } else {
                            throw Err.Content.contentNotFound
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
            export class ProjectIdFromBoard extends BaseRedisStringCache<string> {
                key="permission:projectBoard:{0}"
                constructor(private boardId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,boardId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let ret=await mysql.executeOne(generateQuerySql(boardModel,["project_id"],{
                            id:this.boardId
                        }))
                        if(ret) {
                            projectId=ret.project_id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.Board.boardNotFound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectIdFromBoardSprint extends BaseRedisStringCache<string> {
                key="permission:projectBoardSprint:{0}"
                constructor(private boardSprintId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,boardSprintId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoinSql({
                            model:boardSprintModel
                        },{
                            model:boardModel,
                            columns:["project_id"],
                            expression:{
                                id:{
                                    model:boardSprintModel,
                                    field:"board_id"
                                }
                            }
                        },{
                            id:{
                                model:boardSprintModel,
                                value:this.boardSprintId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            projectId=ret.project_id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.Board.boardSprintNotFound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectIdFromBoardSprintSwimLane extends BaseRedisStringCache<string> {
                key="permission:projectBoardSprintSwimLane:{0}"
                constructor(private boardSprintSwimLaneId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,boardSprintSwimLaneId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoinSql({
                            model:boardSprintSwimLaneModel
                        },{
                            model:boardModel,
                            columns:["project_id"],
                            expression:{
                                id:{
                                    model:boardSprintSwimLaneModel,
                                    field:"board_id"
                                }
                            }
                        },{
                            id:{
                                model:boardSprintSwimLaneModel,
                                value:this.boardSprintSwimLaneId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            projectId=ret.project_id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.Board.boardSprintSwimLaneNotFound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectIdFromBoardColumn extends BaseRedisStringCache<string> {
                key="permission:projectBoardColumn:{0}"
                constructor(private boardColumnId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,boardColumnId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoinSql({
                            model:boardColumnModel
                        },{
                            model:boardModel,
                            columns:["project_id"],
                            expression:{
                                id:{
                                    model:boardColumnModel,
                                    field:"board_id"
                                }
                            }
                        },{
                            id:{
                                model:boardColumnModel,
                                value:this.boardColumnId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            projectId=ret.project_id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.Board.boardColumnNotFound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectIdFromPlan extends BaseRedisStringCache<string> {
                key="permission:projectPlan:{0}"
                constructor(private planId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,planId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoinSql({
                            model:planModel
                        },{
                            model:projectModel,
                            columns:["id"],
                            expression:{
                                id:{
                                    model:planModel,
                                    field:"project_id"
                                }
                            }
                        },{
                            id:{
                                model:planModel,
                                value:this.planId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            projectId=ret.id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.Plan.planNotFound
                        }
                    }
                    return projectId;
                }
            }
            export class ProjectIdFromPlanItem extends BaseRedisStringCache<string> {
                key="permission:projectPlanItem:{0}"
                constructor(private planItemId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,planItemId),cacheRedisType<string>().String,1000*10);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let projectId:string
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        projectId=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoinSql({
                            model:planTableModel
                        },{
                            model:projectModel,
                            columns:["id"],
                            expression:{
                                id:{
                                    model:planTableModel,
                                    field:"project_id"
                                }
                            }
                        },{
                            id:{
                                model:planTableModel,
                                value:this.planItemId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            projectId=ret.id
                            await this.objRedis.set(projectId)
                        } else {
                            throw Err.Project.Plan.planItemNotFound
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
            export class ProjectTags extends BaseRedisHashCache<object> {
                key="permission:project:{0}:tag"
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
                            member_type: ECommon_Model_Organization_Member_Type.MEMBERTAG
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
        export namespace Wiki {
            export function calPermission(wikiId:string,organizationUserId:string)
            {
                let key="permission:wiki:{0}:organizationUser:{1}:calPermission"
                let obj=new RedisStringKey(StringUtil.format(key,wikiId,organizationUserId),cacheRedisType<number>().Number,60)
                return obj
            }
            export class WikiIdFromWikiItem extends BaseRedisStringCache<string> {
                key="permission:wikiItem:{0}"
                constructor(private wikiItemId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,wikiItemId),cacheRedisType<string>().String,1000*10);
                }
                override async getValue(): Promise<string> {
                    let value:string;
                    let mysql=getMysqlInstance()
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        value=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoinSql({
                            model:wikiItemModel
                        },{
                            model:wikiModel,
                            columns:["id"],
                            expression:{
                                id:{
                                    model:wikiItemModel,
                                    field:"wiki_id"
                                }
                            }
                        },{
                            id:{
                                model:wikiItemModel,
                                value:this.wikiItemId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            value=ret.id
                            await this.objRedis.set(value)
                        } else {
                            throw Err.Wiki.wikiNotFound
                        }
                    }
                    return value;
                }
            }
            export class WikiOrganizationUsers extends BaseRedisHashCache<string> {
                key="permission:wiki:{0}:organizationUser"
                constructor(private wikiId:string) {
                    super()
                    this.objRedis=new RedisHashKey(StringUtil.format(this.key,wikiId),3600);
                }
                async getValue(userId:string):Promise<string> {
                    let mysql=getMysqlInstance()
                    let exist = await this.objRedis.exists();
                    if (!exist) {
                        let ret = await mysql.execute(generateQuerySql(roleMemberModel, ["member_id", "role_id"], {
                            item_id: this.wikiId,
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
            export class WikiTeams extends BaseRedisHashCache<object> {
                key="permission:wiki:{0}:team"
                constructor(private wikiId:string) {
                    super()
                    this.objRedis=new RedisHashKey(StringUtil.format(this.key,wikiId),3600);
                }
                async getValue():Promise<object> {
                    let mysql=getMysqlInstance()
                    let exist = await this.objRedis.exists();
                    if (!exist) {
                        let ret = await mysql.execute(generateQuerySql(roleMemberModel, ["member_id", "role_id"], {
                            item_id: this.wikiId,
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
            export class WikiTags extends BaseRedisHashCache<object> {
                key="permission:project:{0}:tag"
                constructor(private wikiId:string) {
                    super()
                    this.objRedis=new RedisHashKey(StringUtil.format(this.key,wikiId),3600);
                }
                async getValue():Promise<object> {
                    let mysql=getMysqlInstance()
                    let exist = await this.objRedis.exists();
                    if (!exist) {
                        let ret = await mysql.execute(generateQuerySql(roleMemberModel, ["member_id", "role_id"], {
                            item_id: this.wikiId,
                            member_type: ECommon_Model_Organization_Member_Type.MEMBERTAG
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
            export class WikiTourist extends BaseRedisStringCache<string> {
                key="permission:wiki:{0}:default"
                constructor(private wikiId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,wikiId),cacheRedisType<string>().String,3600);
                }
                async getValue():Promise<string> {
                    let mysql=getMysqlInstance()
                    let exist = await this.objRedis.exists();
                    if (!exist) {
                        let ret = await mysql.executeOne(generateQuerySql(roleMemberModel, ["item_id", "role_id"], {
                            item_id: this.wikiId,
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
        export namespace Tag {
            export class TagOrganizationUsers extends BaseRedisSetCache<boolean>{
                key="permission:tag:{0}:organizationUsers"
                override objRedis:RedisSetKey;
                constructor(private tagId:string) {
                    super();
                    this.objRedis=new RedisSetKey(StringUtil.format(this.key,tagId),3600);
                }
                async getValue(userId:string):Promise<boolean> {
                    let exist=await this.objRedis.exists()
                    if(!exist) {
                        let mysql=getMysqlInstance();
                        let ret=await mysql.execute(generateQuerySql(memberTagMemberModel,null,{
                            member_tag_id:this.tagId
                        }))
                        let arr=[]
                        for(let obj of ret) {
                            arr.push(obj.organization_user_id)
                        }
                        await this.objRedis.set(arr);
                    }
                    let value=await this.objRedis.check(userId)
                    return value;
                }
            }
        }
        export namespace Organization {
            export class OrganizationUsers extends BaseRedisHashCache<string>{
                key="permission:organization:{0}:organizationUsers"
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
        export namespace Meeting {
            export class createdByPureFromMeetingRoom extends BaseRedisStringCache<string> {
                key="permission:meeting:room:{0}:createdByPure"
                constructor(private meetingRoomId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,meetingRoomId),cacheRedisType<string>().String,1000*10);
                }
                override async getValue(): Promise<string> {
                    let value:string;
                    let mysql=getMysqlInstance()
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        value=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoin2Sql({
                            model:meetingRoomModel
                        },{
                            model:organizationUserModel,
                            expression:{
                                id:{
                                    model:meetingRoomModel,
                                    field:"created_by"
                                }
                            }
                        },{
                            model:userModel,
                            columns:["id"],
                            expression:{
                                id:{
                                    model:organizationUserModel,
                                    field:"user_id"
                                }
                            }
                        },{
                            id:{
                                model:meetingRoomModel,
                                value:this.meetingRoomId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            value=ret.id
                            await this.objRedis.set(value)
                        } else {
                            throw Err.Meeting.roomNotFound
                        }
                    }
                    return value;
                }
            }
        }
        export namespace Calendar {
            export class createdByPureFromCalendarEvent extends BaseRedisStringCache<string> {
                key="permission:calendar:event:{0}:createdByPure"
                constructor(private calendarEventId:string) {
                    super()
                    this.objRedis=new RedisStringKey(StringUtil.format(this.key,calendarEventId),cacheRedisType<string>().String,1000*10);
                }
                override async getValue(): Promise<string> {
                    let value:string;
                    let mysql=getMysqlInstance()
                    let exists=await this.objRedis.exists()
                    if(exists) {
                        value=await this.objRedis.get()
                    } else {
                        let sql=generateLeftJoin2Sql({
                            model:calendarEventModel
                        },{
                            model:organizationUserModel,
                            expression:{
                                id:{
                                    model:calendarEventModel,
                                    field:"created_by"
                                }
                            }
                        },{
                            model:userModel,
                            columns:["id"],
                            expression:{
                                id:{
                                    model:organizationUserModel,
                                    field:"user_id"
                                }
                            }
                        },{
                            id:{
                                model:calendarEventModel,
                                value:this.calendarEventId
                            }
                        })
                        let ret=await mysql.executeOne(sql)
                        if(ret) {
                            value=ret.id
                            await this.objRedis.set(value)
                        } else {
                            throw Err.Calendar.calendarEventNotFound
                        }
                    }
                    return value;
                }
            }
        }
    }
}