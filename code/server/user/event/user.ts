import {DComponent} from "../../common/decorate/component";
import {DEventListener} from "../../common/event/event";
import {OrganizationService, OrganizationUserService} from "../service/organization";
import {ECommon_Model_Notification_Type, ICommon_Model_Notification} from "../../../common/model/notification";
import {Err} from "../../../common/status/error";
import {UserService} from "../service/user";
import rpcAuthApi from "../../auth/rpc/auth";


@DComponent
class EventUser {
    @DEventListener("userDelete")
    async delete(userId:string) {
        try {
            let arr=await OrganizationUserService.getItemsByExp({
                user_id:userId
            })
            for(let obj of arr) {
                OrganizationService.getItemById(obj.getItem().organization_id).then(value => {
                    value.removeUser(obj.getId())
                })
            }
        } catch (err) {
            console.log(err)
        }

    }

    @DEventListener("notificationResolved")
    async notificationResolved(param:ICommon_Model_Notification) {
        if(param.type===ECommon_Model_Notification_Type.ORGANIZATION_INVITATION) {
            let objExtra=JSON.parse(param.extra)
            let {userId,roleId,nickname,active,title,job,email,phone,location,remark}=objExtra
            let user=await UserService.getItemById(userId).then(user=>{
                if(!user) {
                    throw Err.User.userNotFound;
                }
                return user;
            })
            let [organization,_,objRole]=await Promise.all([
                OrganizationService.getItemById(param.organization_id).then(obj=>{
                    if(!obj) {
                        throw Err.Organization.organizationNotFound
                    }
                    return obj
                }),
                OrganizationUserService.getItemByExp({
                    organization_id:param.organization_id,
                    user_id:userId
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
            await organization.addUser(roleId,userId,nickname,active,title,job,email,phone,location,remark);
        }
    }
}