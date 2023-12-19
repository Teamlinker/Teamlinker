export enum ECommon_Services {
    GateWay="gateway",
    User="user",
    Cooperation="cooperation",
    File="file",
    AUTH="auth",
    Wiki="wiki",
    Calendar="calendar",
    Meeting="meeting",
    Finder="finder",
    Notification="notification",
    Comment="comment"
}

export enum ECommon_User_Online_Status {
    OFFLINE,
    ONLINE,
    BUSY,
    MEETING
}

export enum ECommon_Application_Mode {
    ONLINE,
    OFFLINE
}

export enum ECommon_Platform_Type {
    WEB,
    MOBILE
}

export type DCSType<T>={
    [key in keyof T]:key extends "created_by"|"modified_by"|"assigner_id"|"reporter_id"|"created_by_pure"?{
        id:string,
        username:string,
        photo?:string,
        nickname?:string,
        organizationUserId?:string
    }:key extends "created_time"|"modified_time"|"start_time"|"end_time"?string:T[key] extends object?DCSType<T[key]>:T[key]
}