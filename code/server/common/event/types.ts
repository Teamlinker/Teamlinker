import {ECommon_User_Online_Status} from "../../../common/types";
import {ICommon_Model_Notification} from "../../../common/model/notification";

export interface IServer_Common_Event_Types {
    userDelete:(userId:string)=>void
    projectDelete:(projectId:string)=>void
    teamDelete:(teamId:string)=>void
    fileRef:(fileId:string,count?:number)=>void
    fileUnref:(fileId:string,count?:number)=>void
    fileUpload:(meta:string,fileId:string)=>void
    issueTypeDelete:(issueTypeId:string)=>void
    organizationUserAdd:(organizationId:string,organizationUserId:string)=>void
    organizationUserEdit:(organizationId:string,organizationUserId:string)=>void
    organizationUserDelete:(organizationId:string,organizationUserId:string)=>void
    organizationUserStatusChange:(organizationId:string,organizationUserId:string,status:ECommon_User_Online_Status)=>void
    projectMemberAdd:(projectId:string,memberId:string)=>void
    projectMemberEdit:(projectId:string,memberId:string)=>void
    projectMemberDelete:(projectId:string,memberId:string)=>void
    teamUserAdd:(teamId:string,organizationUserId:string)=>void
    teamUserEdit:(teamId:string,organizationUserId:string)=>void
    teamUserDelete:(teamId:string,organizationUserId:string)=>void
    roleChange:(roleId:string)=>void
    notificationResolved:(param:ICommon_Model_Notification)=>void
    wikiMemberAdd:(wikiId:string,memberId:string)=>void
    wikiMemberEdit:(wikiId:string,memberId:string)=>void
    wikiMemberDelete:(wikiId:string,memberId:string)=>void
}