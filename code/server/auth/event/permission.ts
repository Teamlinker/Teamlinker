import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {REDIS_AUTH} from "../../common/cache/keys/auth";


@DComponent
class PermissionClear {
    @DEventListener("organizationUserAdd")
    async organizationUserAdd(organizationId:string,user:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener("organizationUserEdit")
    async organizationUserEdit(organizationId:string,user:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener("organizationUserDelete")
    async organizationUserDelete(organizationId:string,user:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener("projectMemberAdd")
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

    @DEventListener("projectMemberEdit")
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

    @DEventListener("projectMemberDelete")
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

    @DEventListener("teamUserAdd")
    async teamUserAdd(teamId:string,userId:string) {
        let obj=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
        await obj.del()
    }

    @DEventListener("teamUserEdit")
    async teamUserEdit(teamId:string,userId:string) {
        let obj=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
        await obj.del()
    }

    @DEventListener("teamUserDelete")
    async teamUserDelete(teamId:string,userId:string) {
        let obj=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
        await obj.del()
    }

}