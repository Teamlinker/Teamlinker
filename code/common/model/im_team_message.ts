import {BaseModel} from "./base"
import type {ECommon_IM_Message_ContentType} from "./im_user_message";


export interface ICommon_Model_IM_Team_Message {
    id:string,
    from_organization_user_id:string,
    team_id:string,
    created_time:Date,
    content:string,
    content_type:ECommon_IM_Message_ContentType,
    organization_id:string
}
export const Table_IM_Team_Message="im_team_message"

class IMTeamMessageModel extends BaseModel {
    table=Table_IM_Team_Message
    model=<ICommon_Model_IM_Team_Message>{}
}

export let iMTeamMessageModel=new IMTeamMessageModel