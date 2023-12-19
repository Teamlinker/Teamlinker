import organizationApi from "../../../common/routes/organization";
import {Err} from "../../../common/status/error";
import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import {UserService} from "../service/user";
import {MemberTagService, OrganizationService, OrganizationUserService} from './../service/organization';
import {IUserSession} from "../types/config";
import rpcAuthApi from "../../auth/rpc/auth"
import {ECommon_Model_Role_Type} from "../../../common/model/role";
import {ECommon_IM_Message_EntityType} from "../../../common/model/im_unread_message";
import {TeamService} from "../service/team";
import {ECommon_Application_Mode, ECommon_User_Online_Status} from "../../../common/types";
import Application from "../../common/app/app";
import rpcUserApi from "../../user/rpc/user"
import rpcNotificationApi from "../../notification/rpc/notification"
import {ECommon_Model_Notification_Type} from "../../../common/model/notification";

@DComponent
@DHttpController(organizationApi)
class OrganizationController {

    @DHttpApi(organizationApi.routes.list)
    async list(@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.list.res>{
        let ret=await OrganizationService.list(user.userId)
        return ret;
    }

    @DHttpApi(organizationApi.routes.info)
    async info(@DHttpReqParamRequired("organizationId") organizationId:string) :Promise<typeof organizationApi.routes.info.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        return obj.getItem();
    }

    @DHttpApi(organizationApi.routes.update)
    async update(@DHttpReqParamRequired("organizationId") organizationId:string,
    @DHttpReqParam("name")  name:string,
    @DHttpReqParam("description")   description:string,
    @DHttpReqParam("photo") photo:string,
    @DHttpReqParam("active")     active:number) :Promise<typeof organizationApi.routes.update.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        obj.assignItem({
            name,
            description,
            photo,
            active
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(organizationApi.routes.remove)
    async remove(@DHttpReqParamRequired("organizationId") organizationId:string) :Promise<typeof organizationApi.routes.remove.res>{
        if(Application.mode===ECommon_Application_Mode.OFFLINE) {
            throw Err.Common.interfaceForbidden
        }
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(organizationApi.routes.listUser)
    async listUser(@DHttpReqParamRequired("page") page:number,
    @DHttpReqParamRequired("size") size:number,
    @DHttpReqParam("keyword") keyword:string,
    @DHttpReqParam("organizationId") organizationId:string,
    @DHttpReqParam("organizationUserIds") organizationUserIds:string[],
    @DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.listUser.res>{
        let obj=await OrganizationService.getItemById(organizationId??user.organizationInfo.organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let ret=await obj.listUser(page,size,keyword,organizationUserIds)
        return ret;
    }

    @DHttpApi(organizationApi.routes.updateUser)
    async updateUser(@DHttpReqParam("organizationUserId") organizationUserId:string,
    @DHttpReqParam("roleId") roleId:string,
    @DHttpReqParam("nickname") nickname:string,
    @DHttpReqParam("active") active:number,
    @DHttpReqParam("department") department:string,
    @DHttpReqParam("job") job:string,
    @DHttpReqParam("email") email:string,
    @DHttpReqParam("phone") phone:string,
    @DHttpReqParam("location") location:string,
    @DHttpReqParam("remark") remark:string,@DHttpUser userInfo:IUserSession) :Promise<typeof organizationApi.routes.updateUser.res>{
        if(nickname === "") {
            throw Err.Organization.nicknameEmpty
        }
        let objOrganizationUser=await OrganizationUserService.getItemById(organizationUserId || userInfo.organizationInfo.organizationUserId);
        if(!objOrganizationUser) {
            throw Err.Organization.userNotFound
        }
        let [organization,user,objOriginalRole,objRole]=await Promise.all([
            OrganizationService.getItemById(objOrganizationUser.getItem().organization_id).then(obj=>{
                if(!obj) {
                    throw Err.Organization.organizationNotFound
                }
                return obj
            }),
            UserService.getItemById(objOrganizationUser.getItem().user_id).then(user=>{
                if(!user) {
                    throw Err.User.userNotFound;
                }
                return user;
            }),
            rpcAuthApi.getRoleMemberService({
                member_id:objOrganizationUser.getId(),
                item_id:objOrganizationUser.getItem().organization_id
            }).then(async objRoleMember=>{
                if(!objRoleMember) {
                    throw Err.Role.roleMemberEmpty
                } else {
                    let ret=await rpcAuthApi.getRoleServiceById(objRoleMember.getItem().role_id)
                    return ret
                }
            }),
            roleId?rpcAuthApi.getRoleServiceById(roleId).then(objRole=>{
                if(!objRole) {
                    throw Err.Role.roleNotFound
                }
                return objRole;
            }):null
        ])
        if(organizationUserId && objOrganizationUser.getItem().user_id===organization.getItem().created_by_pure && roleId && objOriginalRole.getId()!==roleId) {
            throw Err.Common.requestForbidden
        }
        let retUser=await organization.updateUser(roleId,objOrganizationUser.getId(),nickname,active,department,job,email,phone,location,remark)
        if(roleId!==objOriginalRole.getId()) {
            rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ORGANIZATION_USER_ROLE_CHANGE,organization.getId(),organizationUserId || userInfo.organizationInfo.organizationUserId,userInfo.organizationInfo.organizationUserId)
        }
        return {
            organizationUser:retUser,
            user:user.getItem(),
            role:roleId?objRole.getItem():objOriginalRole.getItem()
        };
    }

    @DHttpApi(organizationApi.routes.deleteUser)
    async deleteUser(@DHttpReqParamRequired("organizationUserId") organizationUserId:string,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.deleteUser.res>{
        let obj=await OrganizationUserService.getItemById(organizationUserId)
        if(!obj) {
            throw Err.Organization.userNotFound
        }
        let objOrganization=await OrganizationService.getItemById(obj.getItem().organization_id)
        if(objOrganization.getItem().created_by_pure===obj.getItem().user_id) {
            throw Err.Organization.ownerDeleteForbidden
        }
        await objOrganization.removeUser(organizationUserId);
        rpcNotificationApi.createNotification(ECommon_Model_Notification_Type.ORGANIZATION_USER_REMOVE,user.organizationInfo.organizationId,organizationUserId,user.organizationInfo.organizationUserId)
        return;
    }

    @DHttpApi(organizationApi.routes.user)
    async user(@DHttpReqParamRequired("organizationUserId") organizationUserId:string) :Promise<typeof organizationApi.routes.user.res>{
        let obj=await OrganizationUserService.getItemById(organizationUserId)
        if(!obj) {
            throw Err.Organization.userNotFound
        }
        let objUser=await rpcUserApi.getUser(obj.getItem().user_id)
        delete objUser.password
        return {
            ...obj.getItem(),
            user:objUser
        };
    }

    @DHttpApi(organizationApi.routes.enter)
    async enter(@DHttpReqParamRequired("organizationId") organizationId:string,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.enter.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let organizationUserId=await obj.enter(user.platform,user.userId,user.organizationInfo?.organizationUserId);
        return {
            organizationUserId
        };
    }

    @DHttpApi(organizationApi.routes.listRole)
    async listRole(@DHttpReqParamRequired("organizationId") organizationId:string) :Promise<typeof organizationApi.routes.listRole.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let ret=await obj.listRole();
        return ret;
    }

    @DHttpApi(organizationApi.routes.addRole)
    async addRole(@DHttpReqParamRequired("organizationId") organizationId:string,
                  @DHttpReqParamRequired("name") name :string,
                  @DHttpReqParamRequired("value") value:number,
                  @DHttpReqParam("description") description?:string) :Promise<typeof organizationApi.routes.addRole.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let ret=await obj.createRole(name,description,value);
        return ret;
    }

    @DHttpApi(organizationApi.routes.editRole)
    async editRole(@DHttpReqParamRequired("roleId") roleId:string,
                  @DHttpReqParam("name") name :string,
                  @DHttpReqParam("value") value:number,
                  @DHttpReqParam("description") description:string,
                   @DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.editRole.res>{
        let obj=await OrganizationService.getItemById(user.organizationInfo.organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let ret=await obj.editRole(roleId,name,description,value);
        return ret;
    }

    @DHttpApi(organizationApi.routes.removeRole)
    async removeRole(@DHttpReqParamRequired("roleId") roleId:string, @DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.removeRole.res>{
        let obj=await OrganizationService.getItemById(user.organizationInfo.organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        await obj.removeRole(roleId)
        return;
    }

    @DHttpApi(organizationApi.routes.listTag)
    async listTag(@DHttpReqParam("keyword") keyword:string,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.listTag.res>{
        let obj=await OrganizationService.getItemById(user.organizationInfo.organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let ret=await obj.listTag(keyword)
        return ret;
    }


    @DHttpApi(organizationApi.routes.addTag)
    async addTag(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("description") description:string,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.addTag.res>{
        let obj=await OrganizationService.getItemById(user.organizationInfo.organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let objTag=new MemberTagService()
        objTag.assignItem({
            name,
            description,
            organization_id:user.organizationInfo.organizationId
        })
        let ret=await objTag.create();
        return ret;
    }

    @DHttpApi(organizationApi.routes.getTag)
    async getTag(@DHttpReqParam("memberTagId") memberTagId:string) :Promise<typeof organizationApi.routes.getTag.res>{
        let obj=await MemberTagService.getItemById(memberTagId)
        if(!obj) {
            throw Err.Organization.memberTagNotFound
        }
        return obj.getItem();
    }

    @DHttpApi(organizationApi.routes.editTag)
    async editTag(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("description") description:string,@DHttpReqParam("memberTagId") memberTagId:string) :Promise<typeof organizationApi.routes.editTag.res>{
        let obj=await MemberTagService.getItemById(memberTagId)
        if(!obj) {
            throw Err.Organization.memberTagNotFound
        }
        obj.assignItem({
            name,
            description
        })
        let ret=await obj.update();
        return ret;
    }

    @DHttpApi(organizationApi.routes.removeTag)
    async removeTag(@DHttpReqParam("memberTagId") memberTagId:string) :Promise<typeof organizationApi.routes.removeTag.res>{
        let obj=await MemberTagService.getItemById(memberTagId)
        if(!obj) {
            throw Err.Organization.memberTagNotFound
        }
        await obj.delete();
        return;
    }

    @DHttpApi(organizationApi.routes.listTagMember)
    async listTagMember(@DHttpReqParamRequired("memberTagId") memberTagId:string,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.listTagMember.res>{
        let obj=await MemberTagService.getItemById(memberTagId)
        if(!obj) {
            throw Err.Organization.memberTagNotFound
        }
        let ret=await obj.listTagMember()
        return ret;
    }

    @DHttpApi(organizationApi.routes.addTagMember)
    async addTagMember(@DHttpReqParamRequired("memberTagId") memberTagId:string,@DHttpReqParamRequired("memberId") memberId:string) :Promise<typeof organizationApi.routes.addTagMember.res>{
        let obj=await MemberTagService.getItemById(memberTagId)
        if(!obj) {
            throw Err.Organization.memberTagNotFound
        }
        let ret=await obj.addTagMember(memberId)
        return ret;
    }

    @DHttpApi(organizationApi.routes.removeTagMember)
    async removeTagMember(@DHttpReqParamRequired("memberTagId") memberTagId:string,@DHttpReqParamRequired("memberId") memberId:string) :Promise<typeof organizationApi.routes.removeTagMember.res>{
        let obj=await MemberTagService.getItemById(memberTagId)
        if(!obj) {
            throw Err.Organization.memberTagNotFound
        }
        await obj.removeTagMember(memberId)
        return;
    }

    @DHttpApi(organizationApi.routes.setTagMember)
    async setTagMember(@DHttpReqParamRequired("memberTagIds") memberTagIds:string,@DHttpReqParamRequired("memberId") memberId:string) :Promise<typeof organizationApi.routes.setTagMember.res>{
        await MemberTagService.setTagMember(memberTagIds,memberId)
        return;
    }

    @DHttpApi(organizationApi.routes.listMemberTag)
    async listMemberTag(@DHttpReqParamRequired("memberId") memberId:string) :Promise<typeof organizationApi.routes.listMemberTag.res>{
        let ret=await MemberTagService.listMemberTag(memberId)
        return ret;
    }


    @DHttpApi(organizationApi.routes.getPermission)
    async getPermission(@DHttpReqParamRequired("organizationId") organizationId:string,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.getPermission.res>{
        let value=await rpcAuthApi.getPermissionByMemberId(organizationId,user.organizationInfo.organizationUserId,ECommon_Model_Role_Type.ORGANIZATION);
        return {
            value
        };
    }

    @DHttpApi(organizationApi.routes.userProfile)
    async userProfile(@DHttpReqParamRequired("organizationUserId") organizationUserId:string,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.userProfile.res>{
        let organizationUser=await OrganizationUserService.getItemById(organizationUserId);
        if(!organizationUser) {
            throw Err.Organization.userNotFound
        }
        let ret=await organizationUser.info()
        return ret;
    }

    @DHttpApi(organizationApi.routes.userTeamInfos)
    async userTeamInfos(@DHttpReqParamRequired("ids") ids:{
        id:string,
        type:ECommon_IM_Message_EntityType
    }[]) :Promise<typeof organizationApi.routes.userTeamInfos.res>{
        let userIds=ids.filter(item=>{
            return item.type===ECommon_IM_Message_EntityType.USER
        }).map(item=>item.id)
        let teamIds=ids.filter((item=>{
            return item.type===ECommon_IM_Message_EntityType.TEAM
        })).map(item=>item.id)
        let ret:typeof organizationApi.routes.userTeamInfos.res={}
        let [userList,teamList]=await Promise.all([
            OrganizationUserService.organizationUserInfos(userIds.join(","),true,true),
            TeamService.infos(teamIds)
        ])
        userList.forEach(item=>{
            ret[item.id]={
                id:item.organizationUserId,
                name:item.nickname,
                photo:item.photo,
                type:ECommon_IM_Message_EntityType.USER,
                status:item.status
            }
        })
        teamList.forEach(item=>{
            ret[item.id]={
                id:item.id,
                name:item.name,
                photo:item.photo,
                type:ECommon_IM_Message_EntityType.TEAM
            }
        })
        return ret
    }

    @DHttpApi(organizationApi.routes.filterAvailableUserAndTeam)
    async filterUserAndTeam(@DHttpReqParamRequired("keyword") keyword:string,@DHttpReqParamRequired("exceptMe") exceptMe:number,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.filterAvailableUserAndTeam.res>{
        let organizationUser=await OrganizationUserService.getItemById(user.organizationInfo.organizationUserId);
        if(!organizationUser) {
            throw Err.Organization.userNotFound
        }
        let ret=await organizationUser.filterAvailableUserAndTeam(keyword)
        if(exceptMe) {
            ret.users=ret.users.filter(item=>{
                return item.id!=user.organizationInfo.organizationUserId
            })
        }
        return ret;
    }
    @DHttpApi(organizationApi.routes.changeUserStatus)
    async changeUserStatus(@DHttpReqParam("status") status:ECommon_User_Online_Status.ONLINE|ECommon_User_Online_Status.BUSY,@DHttpUser userInfo:IUserSession) :Promise<typeof organizationApi.routes.changeUserStatus.res>{
        let user=await OrganizationUserService.getItemById(userInfo.organizationInfo.organizationUserId)
        if(!user) {
            throw Err.Organization.userNotFound
        }
        await user.changeOnlineStatus(status)
        return;
    }

    @DHttpApi(organizationApi.routes.getUserStatus)
    async getUserStatus(@DHttpReqParam("organizationUserId") organizationUserId:string,@DHttpUser userInfo:IUserSession) :Promise<typeof organizationApi.routes.getUserStatus.res>{
        if(userInfo.organizationInfo?.organizationUserId || organizationUserId) {
            let user=await OrganizationUserService.getItemById(organizationUserId || userInfo.organizationInfo.organizationUserId)
            if(!user) {
                throw Err.Organization.userNotFound
            }
            let ret=await user.getOnlineStatus()
            return {
                status:ret
            };
        } else {
            return {
                status:ECommon_User_Online_Status.OFFLINE
            }
        }

    }

    @DHttpApi(organizationApi.routes.getUserStatusList)
    async getUserStatusList(@DHttpReqParam("organizationUserIds") organizationUserIds:string[],@DHttpUser userInfo:IUserSession) :Promise<typeof organizationApi.routes.getUserStatusList.res>{
        let ret=await OrganizationUserService.getOnlineStatusList(organizationUserIds)
        let obj:{
            [id:string]:ECommon_User_Online_Status
        }={}
        organizationUserIds.forEach((value, index) => {
            obj[value]=ret[index]
        })
        return obj;
    }

    @DHttpApi(organizationApi.routes.createUser)
    async createUser(@DHttpReqParamRequired("organizationId") organizationId:string,                                 @DHttpReqParamRequired("password") password:string,
                  @DHttpReqParamRequired("username") username:string,
                  @DHttpReqParamRequired("roleId") roleId:string,
                  @DHttpReqParamRequired("nickname") nickname:string,
                  @DHttpReqParamRequired("active") active:number,
                  @DHttpReqParam("title") title:string,
                  @DHttpReqParam("job") job:string,
                  @DHttpReqParam("email") email:string,
                  @DHttpReqParam("phone") phone:string,
                  @DHttpReqParam("remark") remark:string,
                  @DHttpReqParam("location") location:string) :Promise<typeof organizationApi.routes.createUser.res>{
        if(Application.mode!==ECommon_Application_Mode.OFFLINE) {
            throw Err.Common.interfaceForbidden
        }
        let user=await UserService.getItemByName(username)
        if(user) {
            throw Err.User.userExists
        } else {
            user=new UserService()
            user.assignItem({
                username,
                password
            })
            await user.create()
        }
        let [organization,_,objRole]=await Promise.all([
            OrganizationService.getItemById(organizationId).then(obj=>{
                if(!obj) {
                    throw Err.Organization.organizationNotFound
                }
                return obj
            }),
            OrganizationUserService.getItemByExp({
                organization_id:organizationId,
                user_id:user.getId()
            }).then(obj=>{
                if(obj) {
                    throw Err.Organization.userAlreadyExists
                }
            }),
            rpcAuthApi.getRoleServiceById(roleId).then(objRole=>{
                if(!objRole) {
                    throw Err.Role.roleNotFound
                }
                return objRole;
            })
        ])
        let retUser=await organization.addUser(roleId,user.getId(),nickname,active,title,job,email,phone,location,remark);
        return {
            organizationUser:retUser,
            user:user.getItem(),
            role:objRole.getItem()
        };
    }

    @DHttpApi(organizationApi.routes.resetUserPassword)
    async resetUserPassword(@DHttpReqParamRequired("organizationUserId") organizationUserId:string,@DHttpReqParamRequired("password") password:string) :Promise<typeof organizationApi.routes.resetUserPassword.res>{
        if(Application.mode!==ECommon_Application_Mode.OFFLINE) {
            throw Err.Common.interfaceForbidden
        }
        let obj=await OrganizationUserService.getItemById(organizationUserId)
        if(!obj) {
            throw Err.Organization.userNotFound
        }
        let user=await UserService.getItemById(obj.getItem().user_id)
        user.assignItem({
            password
        })
        await user.update()
        return
    }

    @DHttpApi(organizationApi.routes.deleteUserForOffline)
    async deleteUserForOffline(@DHttpReqParamRequired("organizationUserId") organizationUserId:string) :Promise<typeof organizationApi.routes.deleteUserForOffline.res>{
        if(Application.mode!==ECommon_Application_Mode.OFFLINE) {
            throw Err.Common.interfaceForbidden
        }
        let obj=await OrganizationUserService.getItemById(organizationUserId)
        if(!obj) {
            throw Err.Organization.userNotFound
        }
        let user=await UserService.getItemById(obj.getItem().user_id)
        await user.delete("userDelete")
        return
    }

    @DHttpApi(organizationApi.routes.statics)
    async statics(@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.statics.res>{
        let obj=await OrganizationService.getItemById(user.organizationInfo.organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let ret=await obj.statics()
        return ret;
    }
}