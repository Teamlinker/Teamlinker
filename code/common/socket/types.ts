import {ECommon_IM_Message_EntityType, ICommon_Model_IM_UnRead_Message} from "../model/im_unread_message";
import {ICommon_Model_IM_User_Message} from "../model/im_user_message";
import {ICommon_Model_IM_Team_Message} from "../model/im_team_message";
import {ECommon_User_Online_Status} from "../types";
import {ECommon_Meeting_Room_Permission} from "../model/meeting_room";

export enum ECommon_Socket_Type {
    CALENDAR = "calendar",
    IM = "im",
    MEETING="meeting",
    NOTIFICATION="notification"
}


export interface ICommon_Socket_ServerToClientEvents {
    //calendar
    calendar_event_reminder: (id: string, name: string, start_time: number) => void
    //im
    im_user_relay_text_message: (fromOrganizationUserId: string, toOrganizationUserId: string, content: string,date:Date) => void
    im_team_relay_text_message: (organizationUserId: string, teamId: string, content: string,date:Date) => void
    im_user_relay_image_message: (fromOrganizationUserId: string, toOrganizationUserId: string, fileId: string,date:Date) => void
    im_team_relay_image_message: (organizationUserId: string, teamId: string, fileId: string,date:Date) => void
    im_organization_user_status_change:(organizationUserId:string, status:ECommon_User_Online_Status)=>void
    //meeting
    meeting_presenter_change:(organizationUserId:string,permission:ECommon_Meeting_Room_Permission)=>void
    meeting_invite:(fromOrganizationUserId:string,fromOrganizationUserName:string,roomId:string,password:string)=>void,
    //notification
    notification_new:(notificationId:string)=>void
}

export interface ICommon_Socket_ClientToServerEvents {
    //im
    im_user_send_text_message: (toOrganizationUserId: string, content: string, callback: (data:{
        code?:number,
        msg?:string,
        success:boolean
    }) => void) => void
    im_team_send_text_message: (teamId: string, content: string, callback: (data:{
        code?:number,
        msg?:string,
        success:boolean
    }) => void) => void
    im_user_send_image_message: (toOrganizationUserId: string, fileId: string, callback: (data:{
        code?:number,
        msg?:string,
        success:boolean
    }) => void) => void
    im_team_send_image_message: (teamId: string, fileId: string, callback: (data:{
        code?:number,
        msg?:string,
        success:boolean
    }) => void) => void
    im_unread_message_list: (callback: (list: ICommon_Model_IM_UnRead_Message[]) => void) => void
    im_user_message_list: (toOrganizationUserId: string, size: number, lastTime: number, callback: (list: ICommon_Model_IM_User_Message[]) => void) => void
    im_team_message_list: (teamId: string, size: number, lastTime: number, callback: (list: ICommon_Model_IM_Team_Message[]) => void) => void
    im_read_message:(entityId:string)=>void
    im_unread_message:(entityId:string,entityType:ECommon_IM_Message_EntityType)=>void
    im_heartbeat:()=>void
    //meeting
    meeting_change_presenter:(businessId:string,permission:ECommon_Meeting_Room_Permission,callback:(success:boolean)=>void)=>void
    meeting_get_presenters:(callback:(presenters:{
        [id:string]:ECommon_Meeting_Room_Permission
    })=>void)=>void
    meeting_invite:(inviteBusinessIds:string[])=>void
}

export interface ICommon_Socket_InterServerEvents {
}

export interface ICommon_Socket_Data {
    userId: string,
    organizationUserId: string,
    organizationId:string
}