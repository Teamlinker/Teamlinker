import {ICommon_Model_IM_UnRead_Message} from "../model/im_unread_message";
import {ICommon_Model_IM_User_Message} from "../model/im_user_message";
import {ICommon_Model_IM_Team_Message} from "../model/im_team_message";

export enum ECommon_Socket_Type {
    CALENDAR = "calendar",
    IM = "im"
}


export interface ICommon_Socket_ServerToClientEvents {
    //calendar
    calendar_event_reminder: (id: string, name: string, start_time: number) => void
    //im
    im_user_relay_text_message: (fromOrganizationUserId: string, toOrganizationUserId: string, content: string,date:Date) => void
    im_team_relay_text_message: (organizationUserId: string, teamId: string, content: string,date:Date) => void
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
    im_unread_messages: ( callback: (list: ICommon_Model_IM_UnRead_Message[]) => void) => void
    im_user_message_list: (toOrganizationUserId: string, size: number, lastTime: number, callback: (list: ICommon_Model_IM_User_Message[]) => void) => void
    im_team_message_list: (teamId: string, size: number, lastTime: number, callback: (list: ICommon_Model_IM_Team_Message[]) => void) => void
    im_read_message:(entityId:string)=>void
}

export interface ICommon_Socket_InterServerEvents {
}

export interface ICommon_Socket_Data {
    userId: string,
    organizationUserId: string
}