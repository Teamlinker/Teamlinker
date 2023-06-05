import {ECommon_User_Online_Status} from "../../../common/types";

export interface IServer_Common_Event_Types {
    userDelete:(userId:string)=>void
    projectDelete:(projectId:string)=>void
    teamDelete:(teamId:string)=>void
    fileRef:(fileId:string)=>void
    fileUnref:(fileId:string)=>void
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
}