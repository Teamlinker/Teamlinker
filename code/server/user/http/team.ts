import teamApi from "../../../common/routes/team";
import {Err} from '../../../common/status/error';
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {TeamService} from "../service/team";
import {OrganizationService, OrganizationUserService} from './../service/organization';
import {IUserSession} from "../types/config";
import rpcAuthApi from "../../auth/rpc/auth";
import {ECommon_Model_Role_Type} from "../../../common/model/role";
import rpcNotificationApi from "../../notification/rpc/notification"
import {ECommon_Model_Notification_Type} from "../../../common/model/notification";

@DComponent
@DHttpController(teamApi)
class TeamController {
    @DHttpApi(teamApi.routes.create)
    async create(@DHttpReqParamRequired("name") name:string,@DHttpUser user:IUserSession,@DHttpReqParam("photo") photo:string,@DHttpReqParam("description") description:string):Promise<typeof teamApi.routes.create.res>{
        let organization = OrganizationService.getItemById(user.organizationInfo.organizationId)
        if(!organization) {
            throw Err.Organization.organizationNotFound
        }
        let team=new TeamService
        team.assignItem({
            name,
            created_by:user.organizationInfo.organizationUserId,
            organization_id:user.organizationInfo.organizationId,
            description,
            photo
        });
        let obj=await team.create()
        return obj
    }

    @DHttpApi(teamApi.routes.info)
    async info(@DHttpReqParamRequired("teamId") teamId:string):Promise<typeof teamApi.routes.create.res> {
        let team = await TeamService.getItemById(teamId)
        if(!team) {
            throw Err.Team.teamNotFound
        }
        return team.getItem()
    }

    @DHttpApi(teamApi.routes.update)
    async update(@DHttpReqParamRequired("teamId") teamId:string,@DHttpReqParam("name") name:string,@DHttpReqParam("photo") photo:string,@DHttpReqParam("description") description:string):Promise<typeof teamApi.routes.create.res> {
        let team = await TeamService.getItemById(teamId)
        if(!team) {
            throw Err.Team.teamNotFound
        }
        team.assignItem({
            name,
            description,
            photo
        })
        let ret=await team.update()
        return ret
    }

    @DHttpApi(teamApi.routes.remove)
    async remove(@DHttpReqParamRequired("teamId") teamId:string,@DHttpUser user:IUserSession) {
        let team=await TeamService.getItemById(teamId)
        if(!team) {
            throw Err.Team.teamNotFound
        }
        await team.delete("teamDelete")
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.TEAM_DISMISS,teamId,null,user.organizationInfo.organizationUserId,team.getItem().name)
    }
    
    @DHttpApi(teamApi.routes.roles)
    async roles(@DHttpReqParam("teamId") teamId:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.roles.res> {
        if(teamId) {
            let team=await TeamService.getItemById(teamId)
            if(!team) {
                throw Err.Team.teamNotFound
            }
            let ret=await team.getRoles()
            return ret;
        } else {
            let ret=await TeamService.getGlobalRoles(user.organizationInfo.organizationId);
            return ret;
        }

    }

    @DHttpApi(teamApi.routes.members)
    async members(@DHttpReqParamRequired("teamId") teamId:string,@DHttpReqParamRequired("page") page:number, @DHttpReqParamRequired("size") size:number, @DHttpReqParam("keyword") keyword:string) :Promise<typeof teamApi.routes.members.res> {
        let team=await TeamService.getItemById(teamId)
        if(!team) {
            throw Err.Team.teamNotFound
        }
        let ret=await team.members(page,size,keyword)
        return ret;
    }

    @DHttpApi(teamApi.routes.listUser)
    async listUser(@DHttpReqParamRequired("teamId") teamId:string,@DHttpReqParamRequired("page") page:number, @DHttpReqParamRequired("size") size:number, @DHttpReqParam("keyword") keyword:string,@DHttpReqParam("roleId") roleId:string) :Promise<typeof teamApi.routes.listUser.res> {
        let team=await TeamService.getItemById(teamId)
        if(!team) {
            throw Err.Team.teamNotFound
        }
        let ret=await team.listUser(page,size,keyword,roleId)
        return ret;
    }

    @DHttpApi(teamApi.routes.addMember)
    async addMember(@DHttpReqParamRequired("teamId") teamId:string,@DHttpReqParamRequired("organizationUserId") organizationUserId:string,@DHttpReqParamRequired("roleId") roleId:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.addMember.res> {
        let team=await TeamService.getItemById(teamId)
        if(!team) {
            throw Err.Team.teamNotFound
        }
        let ret=await team.addMember(organizationUserId,roleId)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.TEAM_USER_ADD,teamId,organizationUserId,user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(teamApi.routes.removeMember)
    async removeMember(@DHttpReqParamRequired("teamId") teamId:string,@DHttpReqParamRequired("organizationUserId") organizationUserId:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.removeMember.res> {
        let team=await TeamService.getItemById(teamId)
        if(!team) {
            throw Err.Team.teamNotFound
        } else if(team.getItem().created_by==organizationUserId) {
            throw Err.Team.removeForbidden
        }
        let arr=await OrganizationUserService.organizationUserInfos(organizationUserId)
        if(!arr || arr.length==0) {
            throw Err.Organization.userNotFound
        }
        await team.removeMember(organizationUserId)
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.TEAM_USER_REMOVE,teamId,organizationUserId,user.organizationInfo.organizationUserId)
        return;
    }

    @DHttpApi(teamApi.routes.changeRole)
    async changeRole(@DHttpReqParamRequired("teamId") teamId:string,@DHttpReqParamRequired("organizationUserId") organizationUserId:string,@DHttpReqParamRequired("roleId") roleId:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.changeRole.res> {
        let team=await TeamService.getItemById(teamId)
        if(!team) {
            throw Err.Team.teamNotFound
        }
        let arr=await OrganizationUserService.organizationUserInfos(organizationUserId)
        if(!arr || arr.length==0) {
            throw Err.Organization.userNotFound
        }
        if(team.getItem().created_by===arr[0].organizationUserId) {
            throw Err.Role.roleChangeForbidden
        }
        let ret=await team.changeRole(organizationUserId,roleId)
        if(roleId) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.TEAM_USER_ROLE_CHANGE,teamId,organizationUserId,user.organizationInfo.organizationUserId)
        }
        return ret;
    }

    @DHttpApi(teamApi.routes.list)
    async list(@DHttpReqParam("keyword") keyword:string,@DHttpReqParamRequired("page") page:number,@DHttpReqParamRequired("size") size:number,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.list.res>{
        let organization = OrganizationService.getItemById(user.organizationInfo.organizationId)
        if(!organization) {
            throw Err.Organization.organizationNotFound
        }
        let list=await TeamService.list(user.organizationInfo.organizationId ,page,size,keyword)
        return list
    }

    @DHttpApi(teamApi.routes.filterTeam)
    async filterTeam(@DHttpReqParamRequired("name") name:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.filterTeam.res>{
        let organization = OrganizationService.getItemById(user.organizationInfo.organizationId)
        if(!organization) {
            throw Err.Organization.organizationNotFound
        }
        let ret=await TeamService.filter(user.organizationInfo.organizationId,name,10);
        return ret;
    }

    @DHttpApi(teamApi.routes.addRole)
    async addRole(@DHttpReqParam("teamId") teamId:string,
                  @DHttpReqParamRequired("name") name :string,
                  @DHttpReqParamRequired("value") value:number,
                  @DHttpReqParam("description") description:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.addRole.res>{
        if(teamId) {
            let obj=await TeamService.getItemById(teamId)
            if(!obj) {
                throw Err.Team.teamNotFound
            }
            let ret=await obj.createRole(name,description,value);
            return ret;
        } else {
            let obj=await TeamService.createGlobalRole(user.organizationInfo.organizationId,name,description,value)
            return obj;
        }

    }

    @DHttpApi(teamApi.routes.editRole)
    async editRole(@DHttpReqParamRequired("roleId") roleId:string,
                   @DHttpReqParam("name") name :string,
                   @DHttpReqParam("value") value:number,
                   @DHttpReqParam("description") description:string,
                   @DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.editRole.res>{
        let ret=await rpcAuthApi.updateRole({
            id:roleId,
            name,
            description,
            value:value
        });
        return ret;
    }

    @DHttpApi(teamApi.routes.removeRole)
    async removeRole(@DHttpReqParamRequired("roleId") roleId:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.removeRole.res>{
        await rpcAuthApi.removeRole(roleId);
        return;
    }

    @DHttpApi(teamApi.routes.getPermission)
    async getPermission(@DHttpReqParamRequired("teamId") teamId:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.getPermission.res>{
        let value=await rpcAuthApi.getPermissionByMemberId(teamId,user.organizationInfo.organizationUserId,ECommon_Model_Role_Type.TEAM);
        return {
            value
        };
    }

    @DHttpApi(teamApi.routes.quit)
    async quit(@DHttpReqParamRequired("teamId") teamId:string,@DHttpUser user:IUserSession) :Promise<typeof teamApi.routes.quit.res>{
        let obj=await TeamService.getItemById(teamId)
        if(!obj) {
            throw Err.Team.teamNotFound
        }
        let ret=await obj.quit(user.organizationInfo.organizationUserId)
        if(ret) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.TEAM_USER_QUIT,teamId,user.organizationInfo.organizationUserId,user.organizationInfo.organizationUserId)
        }
        return
    }

}