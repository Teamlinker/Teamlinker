import {BaseModel} from "./base"

export enum ECommon_Calendar_WeekDay {
    Sun,
    Mon,
    Tue,
    Wed,
    Thu,
    Fri,
    Sat
}
export const calendarWeekDayName=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

export interface ICommon_Model_Calendar_Setting {
    id:string,
    timezone:string,
    start_week_day:ECommon_Calendar_WeekDay,
    organization_user_id:string,
    organization_id:string
}
export const Table_Calendar_Setting="calendar_setting"

class CalendarSettingModel extends BaseModel {
    table=Table_Calendar_Setting
    model=<ICommon_Model_Calendar_Setting>{}
}

export let calendarSettingModel=new CalendarSettingModel