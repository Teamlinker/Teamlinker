import {
    ECommon_Model_Notification_Status,
    ECommon_Model_Notification_Type,
    ICommon_Model_Notification
} from "../../../common/model/notification";
import rpcCooperationApi from "../../cooperation/rpc/cooperation"
import rpcUserApi from "../../user/rpc/user"
import {NotificationService} from "../service/notification";
import rpcAuthApi from "../../auth/rpc/auth"
import {ECommon_Model_Role_Type} from "../../../common/model/role";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {getSocketEmitterInstance} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";

class RpcNotificationApi  {
    async createNotification(type:ECommon_Model_Notification_Type,refId:string,organizationOrUserId?:string,operationOrganizationUserId?:string,extra?:string) {
        try {
            let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.NOTIFICATION);
            let status:ECommon_Model_Notification_Status=ECommon_Model_Notification_Status.NONE;
            let notificationUserList:string[]=[]
            let organizationId:string
            if(operationOrganizationUserId) {
                try {
                    let objOrganizationUser=await rpcUserApi.organizationUser(operationOrganizationUserId)
                    organizationId=objOrganizationUser.organization_id
                }catch {}
            }
            switch (type) {
                case ECommon_Model_Notification_Type.ISSUE_REMOVE:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
                case ECommon_Model_Notification_Type.WIKI_ITEM_AT:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.TEAM_USER_ROLE_CHANGE:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.TEAM_USER_QUIT:{
                    let roleId=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.TEAM)
                    let list=await rpcAuthApi.listRoleMember(refId,ECommon_Model_Role_Type.TEAM ,ECommon_Model_Organization_Member_Type.USER,0,10000,null,roleId)
                    notificationUserList=list.data.map(item=>item.user.id)
                    break
                }
                case ECommon_Model_Notification_Type.TEAM_USER_REMOVE:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.ORGANIZATION_USER_ROLE_CHANGE:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.ORGANIZATION_USER_REMOVE:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.ORGANIZATION_INVITATION:{
                    status=ECommon_Model_Notification_Status.PENDING
                    notificationUserList=[organizationOrUserId]
                    break
                }
                case ECommon_Model_Notification_Type.TEAM_USER_ADD:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_WORKFLOW_CHANGE:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_COMMENT_AT:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_COMMENT_ADD:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
                case ECommon_Model_Notification_Type.CALENDAR_EVENT_INVITATION:{
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo([organizationOrUserId])
                    if(userInfos?.length>0) {
                        notificationUserList=[userInfos[0].id]
                    }
                    break
                }
                case ECommon_Model_Notification_Type.TEAM_DISMISS:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
                case ECommon_Model_Notification_Type.ORGANIZATION_USER_QUIT:{
                    organizationId=refId;
                    let roleId=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.ORGANIZATION)
                    let userInfos=await rpcAuthApi.listRoleMember(organizationId,ECommon_Model_Role_Type.ORGANIZATION,ECommon_Model_Organization_Member_Type.USER,0,10000,null,roleId)
                    notificationUserList=userInfos.data.map(item=>item.user.id)
                }
                case ECommon_Model_Notification_Type.ISSUE_APPROVAL_REJECT:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_APPROVAL_RESOLVE:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_ASSIGN_RELEASE:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
                case ECommon_Model_Notification_Type.ISSUE_ASSIGN_SPRINT:{
                    let organizationUserIds=await rpcCooperationApi.getIssueRelatedOrganizationUserIds(refId)
                    let userInfos=await rpcUserApi.getOrganizationUsersInfo(organizationUserIds)
                    notificationUserList=userInfos.map(item=>item.id)
                    break
                }
            }
            for(let id of notificationUserList) {
                let objNotification:ICommon_Model_Notification
                let obj=await NotificationService.getItemByExp({
                    type,
                    ref_id:refId,
                    user_id:id,
                })
                if(obj && obj.getItem().type===ECommon_Model_Notification_Type.ORGANIZATION_INVITATION && obj.getItem().status!==ECommon_Model_Notification_Status.PENDING) {
                    obj=null
                }
                if(obj) {
                    if(obj.getItem().status===ECommon_Model_Notification_Status.PENDING || obj.getItem().status===ECommon_Model_Notification_Status.PENDING) {
                        obj.assignItem({
                            operation_organization_user_id:operationOrganizationUserId,
                            extra
                        })
                        objNotification=await obj.update()
                    } else {
                        return
                    }
                } else {
                    obj=new NotificationService()
                    obj.assignItem({
                        type,
                        ref_id:refId,
                        user_id:id,
                        operation_organization_user_id:operationOrganizationUserId,
                        organization_id:organizationId,
                        status,
                        extra
                    })
                    objNotification=await obj.create()
                }
                emit.to(id).emit("notification_new",objNotification.id)
            }
        } catch (err) {
            console.error(__filename,err)
        }
    }

    async removeNotification(type:ECommon_Model_Notification_Type,refId:string,organizationUserId:string) {
        let emit=getSocketEmitterInstance().of("/"+ECommon_Socket_Type.NOTIFICATION);
        let objOrganizationUser=await rpcUserApi.organizationUser(organizationUserId)
        if(objOrganizationUser) {
            let objNotification=await NotificationService.getItemByExp({
                type,
                ref_id:refId,
                user_id:objOrganizationUser.user_id
            })
            if(objNotification) {
                await objNotification.delete()
                emit.to(objOrganizationUser.user_id).emit("notification_new",null)
            }
        }
    }

    async clearByOrganizationId(organizationId:string) {
        await NotificationService.clearByOrganizationId(organizationId)
    }

    async clearByUserId(userId:string) {
        await NotificationService.clearByUserId(userId)
    }

    async clearMember(organizationUserId:string) {
        await NotificationService.clearMember(organizationUserId)
    }
}

export default new RpcNotificationApi()