import {BaseModel} from "./base"

export enum ECommon_Calendar_Type {
    NATIVE
}

export enum ECommon_Calendar_Color {
    BLUE="rgb(0,120,212)",
    ROSE="rgb(241,75,169)",
    RED="rgb(255,0,0)",
    ORANGE="rgb(255,136,0)",
    YELLOW="rgb(255,198,10)",
    LIGHTGREEN="rgb(52,199,36)",
    LIGHTBLUE="rgb(20,192,255)",
    PURPLE="rgb(147,90,246)",
    GRAY="rgb(143,149,158)",
    BROWN="rgb(142,86,46)",
    PINK="rgb(246,173,185)",
    BLACK="rgb(0,0,0)",
    GREEN="rgb(11,128,67)"
}
export interface ICommon_Model_Calendar {
    id:string,
    name:string,
    color:ECommon_Calendar_Color,
    reserved:number,
    organization_user_id:string,
    type:ECommon_Calendar_Type,
    organization_id:string
}
export const Table_Calendar="calendar"

class CalendarModel extends BaseModel {
    table=Table_Calendar
    model=<ICommon_Model_Calendar>{}
}

export let calendarModel=new CalendarModel