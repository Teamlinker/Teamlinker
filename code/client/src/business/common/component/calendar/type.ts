export interface IClient_Calendar_Date {
    year:number,
    month:number,
    day:number,
    hour:number,
    minute:number
}

export interface IClient_Calendar_Info {
    id:string,
    name:string,
    startDate:IClient_Calendar_Date,
    endDate:IClient_Calendar_Date,
    isAllDay:boolean,
    color:string,
    resource:{
        id:string,
        name:string
    },
    reminder?:number,
    created_by:any,
    fixed:boolean,
    extra?:any
}