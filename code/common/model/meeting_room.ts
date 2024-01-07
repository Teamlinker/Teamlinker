import {BaseModel} from "./base"

export enum ECommon_Model_Meeting_Room_Type {
    PRIVATE,
    SCHEDULE,
    CALENDAR
}

export enum ECommon_Meeting_Room_Permission {
    NORMAL="normal",
    PRESENTER="presenter"
}

export interface ICommon_Model_Meeting_Room {
    id:string,
    name:string,
    description:string,
    created_by:string,
    type:ECommon_Model_Meeting_Room_Type,
    related_id:string,
    start_time:Date,
    end_time:Date,
    password:string,
    organization_id:string
}
export const Table_Meeting_Room="meeting_room"

class MeetingRoomModel extends BaseModel {
    table=Table_Meeting_Room
    model=<ICommon_Model_Meeting_Room>{}
}

export let meetingRoomModel=new MeetingRoomModel