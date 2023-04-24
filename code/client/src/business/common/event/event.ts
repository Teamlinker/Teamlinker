import EventEmitter from "eventemitter3"
import {ECommon_IM_Message_EntityType} from "../../../../../common/model/im_unread_message";
import {ECommon_IM_Message_ContentType} from "../../../../../common/model/im_user_message";

export enum EClient_EVENTBUS_TYPE {
    OPEN_PEOPLE_PROFILE="open_people_profile",
    OPEN_TEAM_PROFILE="open_team_profile",
    OPEN_PROJECT_PROFILE="open_project_profile",
    OPEN_PROJECT_ISSUE_PROFILE="open_project_issue_profile",
    OPEN_PROJECT_RELEASE_PROFILE="open_project_release_profile",
    OPEN_WIKI_PROFILE="open_wiki_profile",
    OPEN_WIKI_ITEM="open_wiki_item",
    UPDATE_USER_INFO="update_user_info",
    RECEIVE_IM_MESSAGE="receive_im_message"
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
    [EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE]:(chatType:ECommon_IM_Message_EntityType,fromOrganizationUserId:string,content:string,contentType:ECommon_IM_Message_ContentType,date:Date,toOrganizationUserId?:string,teamId?:string)=>void
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
