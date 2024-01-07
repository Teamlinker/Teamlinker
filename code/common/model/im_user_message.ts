import {BaseModel} from "./base"

export enum ECommon_IM_Message_ContentType {
    RICH_TEXT,
}
export interface ICommon_Model_IM_User_Message {
    id:string,
    from_organization_user_id:string,
    to_organization_user_id:string,
    created_time:Date,
    content:string,
    content_type:ECommon_IM_Message_ContentType,
    organization_id:string
}
export const Table_IM_User_Message="im_user_message"

class IMUserMessageModel extends BaseModel {
    table=Table_IM_User_Message
    model=<ICommon_Model_IM_User_Message>{}
}

export let iMUserMessageModel=new IMUserMessageModel