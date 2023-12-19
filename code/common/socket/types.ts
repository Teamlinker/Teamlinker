import {ECommon_IM_Message_EntityType, ICommon_Model_IM_UnRead_Message} from "../model/im_unread_message";
import {ECommon_IM_Message_ContentType, ICommon_Model_IM_User_Message} from "../model/im_user_message";
import {ICommon_Model_IM_Team_Message} from "../model/im_team_message";
import {DCSType, ECommon_Platform_Type, ECommon_User_Online_Status} from "../types";
import {ECommon_Meeting_Room_Permission} from "../model/meeting_room";
import {ICommon_Content_Line, ICommon_Model_Content} from "../model/content";
import {ICommon_Model_IM_Favorite_Message} from "../model/im_favorite_message";
import {ECommon_Model_Organization_Member_Type} from "../model/organization";

export enum ECommon_Socket_Type {
    CALENDAR = "calendar",
    IM = "im",
    MEETING="meeting",
    NOTIFICATION="notification"
}

export type ICommon_Socket_IM_Search_Message_User = {
    messageId: string,
    fromOrganizationUserId: string,
    toOrganizationUserId: string,
    date: number,
    type: ECommon_IM_Message_ContentType,
    content: string,
}

export type ICommon_Socket_IM_Search_Message_Team = {
    messageId:string,
    teamId:string,
    fromOrganizationUserId:string,
    date:number,
    type: ECommon_IM_Message_ContentType,
    content: string,
}

export type ICommon_Socket_IM_Search_Message = {
    users: {
        [fromOrganizationId:string]:ICommon_Socket_IM_Search_Message_User[]
    },
    teams: {
        [teamId:string]:ICommon_Socket_IM_Search_Message_Team[]
    }
}


export interface ICommon_Socket_ServerToClientEvents {
    //calendar
    calendar_event_reminder: (id: string, name: string, start_time: number) => void,
    //im
    im_user_relay_message: (fromOrganizationUserId: string, toOrganizationUserId: string, content: ICommon_Content_Line[],type:ECommon_IM_Message_ContentType,date:Date,messageId:string) => void,
    im_team_relay_message: (organizationUserId: string, teamId: string, content: ICommon_Content_Line[],type:ECommon_IM_Message_ContentType,date:Date,messageId:string) => void,
    im_organization_user_status_change:(organizationUserId:string, status:ECommon_User_Online_Status)=>void,
    im_organization_quit:(organizationId:string)=>void,
    //meeting
    meeting_presenter_change:(organizationUserId:string,permission:ECommon_Meeting_Room_Permission)=>void,
    meeting_invite:(fromOrganizationUserId:string,fromOrganizationUserName:string,roomId:string,password:string)=>void,
    meeting_rejected:(rejectOrganizationUserId:string,rejectOrganizationUserName:string,roomId:string)=>void,
    //notification
    notification_new:(notificationId:string)=>void,
    notification_logout:(platform:ECommon_Platform_Type)=>void,
}

export interface ICommon_Socket_ClientToServerEvents {
    //im
    im_user_send_message: (toOrganizationUserId: string, content: ICommon_Content_Line[],type:ECommon_IM_Message_ContentType, callback: (data:{
        code?:number,
        msg?:string,
        success:boolean
    }) => void) => void
    im_team_send_message: (teamId: string, content: ICommon_Content_Line[],type:ECommon_IM_Message_ContentType, callback: (data:{
        code?:number,
        msg?:string,
        success:boolean
    }) => void) => void
    im_unread_message_list: (callback: (list: ICommon_Model_IM_UnRead_Message[]) => void) => void
    im_user_message_list: (toOrganizationUserId: string, size: number, lastTime: number, callback: (list: ICommon_Model_IM_User_Message[]) => void) => void
    im_team_message_list: (teamId: string, size: number, lastTime: number, callback: (list: ICommon_Model_IM_Team_Message[]) => void) => void
    im_read_message:(entityId:string)=>void
    im_unread_message:(entityId:string,entityType:ECommon_IM_Message_EntityType,objAt?:{
        all:boolean,
        [param:string]:boolean
    })=>void
    im_favorite_message_list:(organizationUserId:string,size:number,lastTime:number,callback:(list:ICommon_Model_IM_Favorite_Message[])=>void)=>void
    im_favorite_message_add:(organizationUserId:string,type:ECommon_IM_Message_EntityType,entityId:string)=>void
    im_favorite_message_delete:(favoriteMessageId:string)=>void
    im_search_message:(keyword:string,callback:(info:ICommon_Socket_IM_Search_Message)=>void)=>void
    im_user_message_locate:(toOrganizationUserId:string,messageId:string,callback:(list: ICommon_Model_IM_User_Message[]) => void) => void
    im_team_message_locate:(teamId:string,messageId:string,callback:(list: ICommon_Model_IM_Team_Message[]) => void) => void
    //meeting
    meeting_change_presenter:(businessId:string,permission:ECommon_Meeting_Room_Permission,callback:(success:boolean)=>void)=>void
    meeting_get_presenters:(callback:(presenters:{
        [id:string]:ECommon_Meeting_Room_Permission
    })=>void)=>void
    meeting_invite:(inviteBusinessIds:{
        id:string,
        type:ECommon_Model_Organization_Member_Type
    }[])=>void
    meeting_message_list:(lastMessageId:string,callback:(list:DCSType<ICommon_Model_Content>[])=>void)=>void
    meeting_reject:(fromOrganizationUserId:string,roomId:string)=>void,
    notification_heartbeat:(token:string,callback:(success:boolean)=>void)=>void
}

export interface ICommon_Socket_InterServerEvents {
}

export interface ICommon_Socket_Data {
    userId: string,
    organizationUserId: string,
    organizationId:string,
    platform:ECommon_Platform_Type
}