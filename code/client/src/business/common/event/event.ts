import EventEmitter from "eventemitter3"
import {ECommon_IM_Message_EntityType} from "../../../../../common/model/im_unread_message";
import {ECommon_IM_Message_ContentType} from "../../../../../common/model/im_user_message";
import {ECommon_User_Online_Status} from "../../../../../common/types";
import {ICommon_Content_Line} from "../../../../../common/model/content";
import {
    ICommon_Socket_IM_Search_Message_Team,
    ICommon_Socket_IM_Search_Message_User
} from "../../../../../common/socket/types";
import {ECommon_Model_Organization_Member_Type} from "../../../../../common/model/organization";

export enum EClient_EVENTBUS_TYPE {
    OPEN_PEOPLE_PROFILE="open_people_profile",
    OPEN_TEAM_PROFILE="open_team_profile",
    OPEN_PROJECT_PROFILE="open_project_profile",
    OPEN_PROJECT_ISSUE_PROFILE="open_project_issue_profile",
    OPEN_PROJECT_BOARD_PROFILE="open_project_sprint_board",
    OPEN_PROJECT_SPRINT_KANBAN_PROFILE="open_project_sprint_kanban_profile",
    OPEN_PROJECT_RELEASE_PROFILE="open_project_release_profile",
    OPEN_PROJECT_PLAN_PROFILE="open_project_plan_profile",
    OPEN_WIKI_PROFILE="open_wiki_profile",
    OPEN_WIKI_ITEM="open_wiki_item",
    UPDATE_USER_INFO="update_user_info",
    RECEIVE_IM_MESSAGE="receive_im_message",
    OPEN_IM_CHAT="open_im_chat",
    LOCATE_IM_MESSAGE="locate_im_message",
    UPDATE_ORGANIZATION_USER_STATUS="update_organization_user_status",
    OPEN_MEETING="open_meeting",
    MEETING_INVITE="meeting_invite",
    LEAVE_MEETING="leave_meeting",
    OPEN_CALENDAR_EVENT="open_calendar_event",
    FINDER_NEW_FOLDER="finder_new_folder",
    FINDER_RENAME="finder_rename",
    FINDER_DELETE="finder_delete",
    FINDER_REFRESH="finder_refresh",
    FINDER_UPLOAD="finder_upload",
    FINDER_OPEN_WINDOW="finder_open_window",
    REFRESH_ORGANIZATION_LIST="refresh_organization_list",
    REFRESH_NOTIFICATION_UNREAD="refresh_notification_unread",
    REFRESH_MISS_CALL_UNREAD="refresh_miss_call_unread",
    USER_LOGIN_EXPIRED="user_login_expired",
    GUIDE="guide",
    ORGANIZATION_REMOVE="organization_remove"
}

interface IClient_EventBus_Func {
    [EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE]:(organizationUserId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_TEAM_PROFILE]:(teamId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_PROJECT_PROFILE]:(projectId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE]:(projectId:string,projectIssueId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE]:(projectId:string,projectReleaseId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_WIKI_PROFILE]:(wikiId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM]:(wikiId:string,wikiItemId:string)=>void
    [EClient_EVENTBUS_TYPE.UPDATE_USER_INFO]:(id:string,info:{
        id:string,
        name:string,
        photo:string,
        type:ECommon_IM_Message_EntityType
    })=>void
    [EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE]:(messageId:string,chatType:ECommon_IM_Message_EntityType,fromOrganizationUserId:string,content:ICommon_Content_Line[],contentType:ECommon_IM_Message_ContentType,date:Date,toOrganizationUserId?:string,teamId?:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_IM_CHAT]:(id:string,chatType:ECommon_IM_Message_EntityType)=>void
    [EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS]:(organizationUserId:string,status:ECommon_User_Online_Status)=>void
    [EClient_EVENTBUS_TYPE.OPEN_MEETING]:(meetingId:string,password:string,inviteBusinessIds?:{
        id:string,
        type:ECommon_Model_Organization_Member_Type
    }[])=>void
    [EClient_EVENTBUS_TYPE.MEETING_INVITE]:(inviteBusinessIds:{
        id:string,
        type:ECommon_Model_Organization_Member_Type
    }[])=>void
    [EClient_EVENTBUS_TYPE.LEAVE_MEETING]:()=>void
    [EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT]:(calendarEventId:string)=>void
    [EClient_EVENTBUS_TYPE.FINDER_NEW_FOLDER]:(needRefreshFolderId:string,newFolderId:string)=>void
    [EClient_EVENTBUS_TYPE.FINDER_RENAME]:(finderItemId:string,name:string)=>void
    [EClient_EVENTBUS_TYPE.FINDER_DELETE]:(finderItemIds:string[])=>void
    [EClient_EVENTBUS_TYPE.FINDER_REFRESH]:(folderId:string)=>void
    [EClient_EVENTBUS_TYPE.FINDER_UPLOAD]:(fileItemId:string)=>void
    [EClient_EVENTBUS_TYPE.FINDER_OPEN_WINDOW]:(folderId:string)=>void
    [EClient_EVENTBUS_TYPE.REFRESH_ORGANIZATION_LIST]:()=>void
    [EClient_EVENTBUS_TYPE.REFRESH_NOTIFICATION_UNREAD]:()=>void
    [EClient_EVENTBUS_TYPE.LOCATE_IM_MESSAGE]:(item:ICommon_Socket_IM_Search_Message_User|ICommon_Socket_IM_Search_Message_Team)=>void
    [EClient_EVENTBUS_TYPE.REFRESH_MISS_CALL_UNREAD]:()=>void
    [EClient_EVENTBUS_TYPE.OPEN_PROJECT_SPRINT_KANBAN_PROFILE]:(projectId:string,boardId:string,boardSprintId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_PROJECT_BOARD_PROFILE]:(projectId:string,boardId:string)=>void
    [EClient_EVENTBUS_TYPE.USER_LOGIN_EXPIRED]:()=>void
    [EClient_EVENTBUS_TYPE.GUIDE]:()=>void
    [EClient_EVENTBUS_TYPE.ORGANIZATION_REMOVE]:(organizationId:string)=>void
    [EClient_EVENTBUS_TYPE.OPEN_PROJECT_PLAN_PROFILE]:(projectId:string,planId:string)=>void
}

interface IClient_EventBus_Emit_Func {
    on<U extends keyof IClient_EventBus_Func>(event:U,listener: IClient_EventBus_Func[U]):this;
    emit<U extends keyof IClient_EventBus_Func>(event:U,...args:Parameters<IClient_EventBus_Func[U]>):boolean;
    off<U extends keyof IClient_EventBus_Func>(event:U,listener: IClient_EventBus_Func[U]):this;
}

class Event extends EventEmitter implements IClient_EventBus_Emit_Func{
    constructor() {
        super();
    }
}

let obj=new Event()

export const eventBus:IClient_EventBus_Emit_Func=obj
