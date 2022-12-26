import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {EServer_Common_Event_Types} from "../../common/event/types";
import {REDIS_AUTH} from "../../common/cache/keys/auth";


@DComponent
class PermissionClear {
    @DEventListener(EServer_Common_Event_Types.Auth.ORGANIZATION_USER_ADD)
    async organizationUserAdd(organizationId:string,user:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener(EServer_Common_Event_Types.Auth.ORGANIZATION_USER_EDIT)
    async organizationUserEdit(organizationId:string,user:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener(EServer_Common_Event_Types.Auth.ORGANIZATION_USER_DELETE)
    async organizationUserDelete(organizationId:string,user:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener(EServer_Common_Event_Types.Auth.PROJECT_MEMBER_ADD)
    async projectMemberAdd(projectId:string,memberId:string) {
        await Promise.all([(async ()=>{
            let obj=new REDIS_AUTH.Permission.Project.ProjectOrganizationUsers(projectId);
            let exists=await obj.check(memberId);
            if(exists) {
                await obj.del();
            }
        })(),(async ()=>{
            let obj=new REDIS_AUTH.Permission.Project.ProjectTeams(projectId);
            let exists=await obj.check(memberId);
            if(exists) {
                await obj.del();
            }
        })(),async ()=>{

        }])
    }

    @DEventListener(EServer_Common_Event_Types.Auth.PROJECT_MEMBER_EDIT)
    async projectMemberEdit(projectId:string,memberId:string) {
        await Promise.all([(async ()=>{
            let obj=new REDIS_AUTH.Permission.Project.ProjectOrganizationUsers(projectId);
            let exists=await obj.check(memberId);
            if(exists) {
                await obj.del();
            }
        })(),(async ()=>{
            let obj=new REDIS_AUTH.Permission.Project.ProjectTeams(projectId);
            let exists=await obj.check(memberId);
            if(exists) {
                await obj.del();
            }
        })(),async ()=>{

        }])
    }

    @DEventListener(EServer_Common_Event_Types.Auth.PROJECT_MEMBER_DELETE)
    async projectMemberDelete(projectId:string,memberId:string) {
        await Promise.all([(async ()=>{
            let obj=new REDIS_AUTH.Permission.Project.ProjectOrganizationUsers(projectId);
            let exists=await obj.check(memberId);
            if(exists) {
                await obj.del();
            }
        })(),(async ()=>{
            let obj=new REDIS_AUTH.Permission.Project.ProjectTeams(projectId);
            let exists=await obj.check(memberId);
            if(exists) {
                await obj.del();
            }
        })(),async ()=>{

        }])
    }

    @DEventListener(EServer_Common_Event_Types.Auth.TEAM_USER_ADD)
    async teamUserAdd(teamId:string,userId:string) {
        let obj=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
        await obj.del()
    }

    @DEventListener(EServer_Common_Event_Types.Auth.TEAM_USER_EDIT)
    async teamUserEdit(teamId:string,userId:string) {
        let obj=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
        await obj.del()
    }

    @DEventListener(EServer_Common_Event_Types.Auth.TEAM_USER_DELETE)
    async teamUserDelete(teamId:string,userId:string) {
        let obj=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
        await obj.del()
    }

}