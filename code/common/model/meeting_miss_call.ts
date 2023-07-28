import {BaseModel} from "./base";

export interface ICommon_Model_Meeting_Miss_Call {
    id:string,
    from_organization_user_id:string,
    to_organization_user_id:string,
    created_time:Date,
    is_read:number
}
export const Table_Meeting_Miss_Call="meeting_miss_call"

class MeetingMissCallModel extends BaseModel {
    table=Table_Meeting_Miss_Call
    model=<ICommon_Model_Meeting_Miss_Call>{}
}

export let meetingMissCallModel=new MeetingMissCallModel