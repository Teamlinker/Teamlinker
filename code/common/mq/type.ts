
export enum ECommon_Mq_Calendar {
    REMINDER="reminder"
}

export interface ICommon_Mq_Calendar {
    [ECommon_Mq_Calendar.REMINDER]:{
        id:string,
        unique_id:string,
        calendar_id:string,
        start_time?:number
    }
}