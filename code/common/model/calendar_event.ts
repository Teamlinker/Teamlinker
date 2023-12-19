import {BaseModel} from "./base"

export enum ECommon_Calendar_Recurring_Type {
    NONE,
    DAY,
    WORKDAY,
    WEEK,
    MONTH
}

export interface ICommon_Model_Calendar_Event {
    id:string,
    name:string,
    start_time:Date,
    end_time:Date,
    all_day:number,
    recurring:ECommon_Calendar_Recurring_Type,
    recurring_day:number,
    reminder_minutes:number,
    calendar_id:string,
    location:string,
    unique_id:string,
    is_reminder:number,
    created_by:string
}
export const Table_Calendar_Event="calendar_event"

class CalendarEventModel extends BaseModel {
    table=Table_Calendar_Event
    model=<ICommon_Model_Calendar_Event>{}
}

export let calendarEventModel=new CalendarEventModel