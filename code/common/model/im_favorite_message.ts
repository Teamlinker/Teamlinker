import {BaseModel} from "./base"
import {ECommon_IM_Message_ContentType} from "./im_user_message";

export interface ICommon_Model_IM_Favorite_Message {
    id :string,
    created_time :Date,
    organization_user_id:string,
    content:string,
    content_type:ECommon_IM_Message_ContentType,
    from_name:string,
    organization_id:string,
    ref_id:string
}
export const Table_IM_Favorite_Message="im_favorite_message"


class IMFavoriteMessageModel extends BaseModel {
    table=Table_IM_Favorite_Message
    model=<ICommon_Model_IM_Favorite_Message>{}
}

export let iMFavoriteMessageModel=new IMFavoriteMessageModel