import {BaseModel} from "./base"

export interface ICommon_Model_Calendar_Event_Guest {
    id:string,
    calendar_event_id:string,
    organization_user_id:string
}
export const Table_Calendar_Event_Guest="calendar_event_guest"

class CalendarEventGuestModel extends BaseModel {
    table=Table_Calendar_Event_Guest
    model=<ICommon_Model_Calendar_Event_Guest>{}
}

export let calendarEventGuestModel=new CalendarEventGuestModel