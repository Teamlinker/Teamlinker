import {REDIS_AUTH} from '../../common/cache/keys/auth';
import {DComponent} from '../../common/decorate/component';
import {PermissionBase} from './base';
import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type} from "../../../common/model/role";
import {Err} from "../../../common/status/error";
import {Permission_Types} from "../../../common/permission/permission";
import rpcCooperationApi from "../../cooperation/rpc/cooperation"

@DComponent
class PermissionProject extends PermissionBase {
    fieldName="projectId"
    async translateToField({commentId,projectIssueId,labelId,moduleId,projectReleaseId,roleId,boardId,boardSprintId,boardSprintSwimLaneId,boardColumnId,planId,planItemId}: { [param: string]: any; isAdmin?: boolean;commentId:string,projectIssueId:string,labelId:string,moduleId:string,projectReleaseId:string ,roleId:string}): Promise<string> {
        let projectId:string
        if(commentId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromProjectIssueComment(commentId);
            projectId=await obj.getValue();
            return projectId;
        } else if(projectIssueId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromProjectIssue(projectIssueId);
            projectId=await obj.getValue();
            return projectId;
        } else if(labelId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromLabel(labelId);
            projectId=await obj.getValue();
            return projectId;
        } else if(moduleId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromProjectModule(moduleId);
            projectId=await obj.getValue();
            return projectId;
        } else if(projectReleaseId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromProjectRelease(projectReleaseId);
            projectId=await obj.getValue();
            return projectId;
        } else if(roleId) {
            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId);
            let value=await objRole.getValue()
            if(value?.type===ECommon_Model_Role_Type.PROJECT) {
                return value.item_id
            }
        } else if(boardId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromBoard(boardId);
            projectId=await obj.getValue();
            return projectId;
        } else if(boardSprintId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromBoardSprint(boardSprintId);
            projectId=await obj.getValue();
            return projectId;
        } else if(boardSprintSwimLaneId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromBoardSprintSwimLane(boardSprintSwimLaneId);
            projectId=await obj.getValue();
            return projectId;
        } else if(boardColumnId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromBoardColumn(boardColumnId);
            projectId=await obj.getValue();
            return projectId;
        } else if(planId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromPlan(planId);
            projectId=await obj.getValue();
            return projectId;
        } else if(planItemId) {
            let obj=new REDIS_AUTH.Permission.Project.ProjectIdFromPlanItem(planItemId);
            projectId=await obj.getValue();
            return projectId;
        }
    }

    async generatorValue({organizationUserId,projectId}: { [param: string]: any; organizationUserId?: string; isAdmin?: boolean;projectId:string }):Promise<number> {
        let objProjectTourist=new REDIS_AUTH.Permission.Project.ProjectTourist(projectId);
        let objProjectOrganizationUsers=new REDIS_AUTH.Permission.Project.ProjectOrganizationUsers(projectId);
        let objProjectTeams=new REDIS_AUTH.Permission.Project.ProjectTeams(projectId);
        let objProjectTags=new REDIS_AUTH.Permission.Project.ProjectTags(projectId);
        await this.tryLock([objProjectOrganizationUsers.getKey().replace(/\:/g,""),objProjectTeams.getKey().replace(/\:/g,""),objProjectTags.getKey().replace(/\:/g,"")]);
        let permissionsSet = new Set<number>();
        let isAdmin:boolean=false;
        try {
            await Promise.all([(async ()=>{
                let roleId = await objProjectTourist.getValue();
                if(roleId) {
                    let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId);
                    let value=await objRole.getValue();
                    if(value) {
                        permissionsSet.add(Number(value.value))
                        if(value.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                            throw Err.Common.admin;
                        }
                    }
                }
            })(),(async ()=>{
                let roleId = await objProjectOrganizationUsers.getValue(organizationUserId)
                if(roleId) {
                    let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId);
                    let value=await objRole.getValue();
                    if(value) {
                        permissionsSet.add(Number(value.value))
                        if(value.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                            throw Err.Common.admin;
                        }
                    }
                }
            })(),(async ()=>{
                let teams=await objProjectTeams.getValue();
                let arrPromise=[];
                for(let teamId in teams) {
                    arrPromise.push((async ()=>{
                        let objTeam=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
                        let roleId=await objTeam.getValue(organizationUserId)
                        if(roleId) {
                            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(teams[teamId])
                            let value=await objRole.getValue();
                            if(value) {
                                permissionsSet.add(Number(value.value))
                                if(value.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                                    throw Err.Common.admin;
                                }
                            }
                        }
                    })())
                }
                await Promise.all(arrPromise);
            })(),(async ()=>{
                let tags=await objProjectTags.getValue();
                let arrPromise=[];
                for(let tagId in tags) {
                    arrPromise.push((async ()=>{
                        let objTag=new REDIS_AUTH.Permission.Tag.TagOrganizationUsers(tagId);
                        let isExists=await objTag.getValue(organizationUserId)
                        if(isExists) {
                            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(tags[tagId])
                            let value=await objRole.getValue();
                            if(value) {
                                permissionsSet.add(Number(value.value))
                                if(value.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                                    throw Err.Common.admin;
                                }
                            }
                        }
                    })())
                }
                await Promise.all(arrPromise);
            })()])
        } catch (err) {
            if(err.code===Err.Common.admin.code) {
                isAdmin=true
            } else {
                await this.unlock()
                throw err;
            }
        }
        await this.unlock()
        let ret=isAdmin?Permission_Types.Project.ADMIN.value:Array.from(permissionsSet).reduce((previousValue, currentValue, currentIndex, array)=>{
            return previousValue | currentValue;
        },0)
        let obj=REDIS_AUTH.Permission.Project.calPermission(projectId,organizationUserId)
        await obj.set(ret);
        return ret;
    }

    override async checkOrganizationId(projectId: string, currentOrganizationId: string): Promise<boolean> {
        let objRedis=REDIS_AUTH.Resource.resourceOrganization(projectId)
        let organizationId=await objRedis.get()
        if(!organizationId) {
            let obj=await rpcCooperationApi.project(projectId)
            if(obj) {
                organizationId=obj.organization_id
                await objRedis.set(organizationId)
            }
        }
        return organizationId===currentOrganizationId
    }

}

