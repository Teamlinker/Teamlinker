import {BaseModel} from "./base"

export enum ECommon_IM_Message_EntityType {
    USER,
    TEAM
}

export enum ECommon_IM_Message_At {
    NONE,
    ALL,
    SPECIFIC
}

export interface ICommon_Model_IM_UnRead_Message {
    id:string,
    organization_user_id:string,
    modified_time:Date,
    entity_id:string,
    entity_type:ECommon_IM_Message_EntityType,
    count:number,
    unique_id:string,
    at:number,
    organization_id:string
}
export const Table_IM_UnRead_Message="im_unread_message"

class IMUnReadMessageModel extends BaseModel {
    table=Table_IM_UnRead_Message
    model=<ICommon_Model_IM_UnRead_Message>{}
}

export let iMUnReadMessageModel=new IMUnReadMessageModel