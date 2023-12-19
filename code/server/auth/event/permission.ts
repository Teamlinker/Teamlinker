import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {REDIS_AUTH} from "../../common/cache/keys/auth";


@DComponent
class PermissionClear {
    @DEventListener("organizationUserAdd")
    async organizationUserAdd(organizationId:string,organizationUserId:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener("organizationUserEdit")
    async organizationUserEdit(organizationId:string,organizationUserId:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener("organizationUserDelete")
    async organizationUserDelete(organizationId:string,organizationUserId:string) {
        let obj=new REDIS_AUTH.Permission.Organization.OrganizationUsers(organizationId);
        await obj.del()
    }

    @DEventListener("projectMemberAdd")
    async projectMemberAdd(projectId:string,memberId:string) {
        if(memberId) {
            await Promise.all([(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectOrganizationUsers(projectId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectTeams(projectId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectTags(projectId);
                await obj.del();
            })()])
        } else {
            let obj=new REDIS_AUTH.Permission.Project.ProjectTourist(projectId);
            await obj.del()
        }
    }

    @DEventListener("projectMemberEdit")
    async projectMemberEdit(projectId:string,memberId:string) {
        if(memberId) {
            await Promise.all([(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectOrganizationUsers(projectId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectTeams(projectId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectTags(projectId);
                await obj.del();
            })()])
        } else {
            let obj=new REDIS_AUTH.Permission.Project.ProjectTourist(projectId);
            await obj.del()
        }
    }

    @DEventListener("projectMemberDelete")
    async projectMemberDelete(projectId:string,memberId:string) {
        if(memberId) {
            await Promise.all([(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectOrganizationUsers(projectId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectTeams(projectId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Project.ProjectTags(projectId);
                await obj.del();
            })()])
        } else {
            let obj=new REDIS_AUTH.Permission.Project.ProjectTourist(projectId);
            await obj.del()
        }
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

    @DEventListener("roleChange")
    async roleChange(roleId:string) {
        let obj=new REDIS_AUTH.Permission.Role.RoleInfo(roleId)
        await obj.del()
    }

    @DEventListener("wikiMemberAdd")
    async wikiMemberAdd(wikiId:string,memberId:string) {
        if(memberId) {
            await Promise.all([(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiOrganizationUsers(wikiId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiTeams(wikiId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiTags(wikiId);
                await obj.del();
            })()])
        } else {
            let obj=new REDIS_AUTH.Permission.Wiki.WikiTourist(wikiId);
            await obj.del()
        }
    }

    @DEventListener("wikiMemberEdit")
    async wikiMemberEdit(wikiId:string,memberId:string) {
        if(memberId) {
            await Promise.all([(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiOrganizationUsers(wikiId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiTeams(wikiId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiTags(wikiId);
                await obj.del();
            })()])
        } else {
            let obj=new REDIS_AUTH.Permission.Wiki.WikiTourist(wikiId);
            await obj.del()
        }
    }

    @DEventListener("wikiMemberDelete")
    async wikiMemberDelete(wikiId:string,memberId:string) {
        if(memberId) {
            await Promise.all([(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiOrganizationUsers(wikiId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiTeams(wikiId);
                await obj.del();
            })(),(async ()=>{
                let obj=new REDIS_AUTH.Permission.Wiki.WikiTags(wikiId);
                await obj.del();
            })()])
        } else {
            let obj=new REDIS_AUTH.Permission.Wiki.WikiTourist(wikiId);
            await obj.del()
        }
    }

}