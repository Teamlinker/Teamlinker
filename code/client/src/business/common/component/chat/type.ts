import {ECommon_IM_Message_ContentType} from "../../../../../../common/model/im_user_message";

export interface IClient_Chat_Message_Item {
    name:string,
    id:string,
    photo:string,
    content:string,
    type:ECommon_IM_Message_ContentType,
    date:string
}