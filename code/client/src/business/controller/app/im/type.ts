import {ECommon_IM_Message_ContentType} from "../../../../../../common/model/im_user_message";
import {ICommon_Content_Line} from "../../../../../../common/model/content";

export interface IClient_Chat_Message_Item {
    messageId:string,
    name:string,
    id:string,
    photo:string,
    content:ICommon_Content_Line[],
    type:ECommon_IM_Message_ContentType,
    date:string
}