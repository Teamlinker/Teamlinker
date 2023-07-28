import {ECommon_Services} from "../types"
import {ECommon_HttpApi_Method} from "./types"
import {ECommon_Calendar_Color, ICommon_Model_Calendar} from "../model/calendar";
import {
    ICommon_Route_Res_Calendar_Event_Filter,
    ICommon_Route_Res_Calendar_Event_Info,
    ICommon_Route_Res_Calendar_ListEvent_Item
} from "./response";
import {ECommon_Calendar_Recurring_Type} from "../model/calendar_event";
import {ECommon_Calendar_WeekDay, ICommon_Model_Calendar_Setting} from "../model/calendar_setting";
import {Permission_Types} from "../permission/permission";

const api= {
    baseUrl: "/calendar",
    service: ECommon_Services.Calendar,
    routes: {
        listCalendar: {
            method: ECommon_HttpApi_Method.GET,
            path: "/calendar/list",
            req: {},
            res: <ICommon_Model_Calendar[]>{},
            permission: [Permission_Types.Organization.READ]
        },
        addCalendar:{
            method: ECommon_HttpApi_Method.POST,
            path: "/calendar",
            req: <{
                name:string,
                color:ECommon_Calendar_Color,
            }>{},
            res: <ICommon_Model_Calendar>{},
            permission: [Permission_Types.Organization.READ]
        },
        editCalendar:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/calendar",
            req: <{
                calendarId:string,
                name?:string,
                color?:ECommon_Calendar_Color,
            }>{},
            res: <ICommon_Model_Calendar>{},
            permission: [Permission_Types.Organization.READ]
        },
        removeCalendar:{
            method: ECommon_HttpApi_Method.DELETE,
            path: "/calendar",
            req: <{
                calendarId:string
            }>{},
            res: {},
            permission: [Permission_Types.Organization.READ]
        },
        listCalendarEvent:{
            method: ECommon_HttpApi_Method.GET,
            path: "/calendar/event/list",
            req: <{
                calendarId:string,
                start:number,
                end:number
            }>{},
            res: <ICommon_Route_Res_Calendar_ListEvent_Item[]>{},
            permission: [Permission_Types.Organization.READ]
        },
        getCalendarEvent:{
            method: ECommon_HttpApi_Method.GET,
            path: "/calendar/event",
            req: <{
                calendarEventId:string
            }>{},
            res: <ICommon_Route_Res_Calendar_Event_Info>{},
            permission: [Permission_Types.Organization.READ]
        },
        addCalendarEvent:{
            method: ECommon_HttpApi_Method.POST,
            path: "/calendar/event",
            req: <{
                calendarId:string,
                name:string,
                agenda?:string,
                startTime:number,
                endTime?:number,
                all_day:number,
                recurring:ECommon_Calendar_Recurring_Type,
                recurring_day?:number,
                reminder_minutes?:number,
                location?:string,
                guestList?:string[],
                meeting:boolean
            }>{},
            res: <ICommon_Route_Res_Calendar_Event_Info>{},
            permission: [Permission_Types.Organization.READ]
        },
        editCalendarEvent:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/calendar/event",
            req: <{
                calendarEventId:string,
                name?:string,
                agenda?:string,
                startTime?:number,
                endTime?:number,
                all_day?:number,
                recurring?:ECommon_Calendar_Recurring_Type,
                recurring_day?:number,
                reminder_minutes?:number,
                location?:string,
                guestList?:string[]
                meeting?:boolean
            }>{},
            res: <ICommon_Route_Res_Calendar_Event_Info>{},
            permission: [Permission_Types.Organization.READ,Permission_Types.Common.SELF]
        },
        editCalendarEventDate:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/calendar/eventdate",
            req: <{
                calendarEventId:string,
                startTime?:number,
                endTime?:number
            }>{},
            res: <ICommon_Route_Res_Calendar_Event_Info>{},
            permission: [Permission_Types.Organization.READ,Permission_Types.Common.SELF]
        },
        removeCalendarEvent:{
            method: ECommon_HttpApi_Method.DELETE,
            path: "/calendar/event",
            req: <{
                calendarEventId:string
            }>{},
            res: {},
            permission: [Permission_Types.Organization.READ,Permission_Types.Common.SELF]
        },
        getCalendarSetting:{
            method: ECommon_HttpApi_Method.GET,
            path: "/calendar/setting",
            req: {},
            res: <ICommon_Model_Calendar_Setting>{},
            permission: [Permission_Types.Organization.READ]
        },
        editCalendarSetting:{
            method: ECommon_HttpApi_Method.PUT,
            path: "/calendar/setting",
            req: <{
                timezone?:string,
                startWeekDay?:ECommon_Calendar_WeekDay
            }>{},
            res: {},
            permission: [Permission_Types.Organization.READ]
        },
        getCalendar:{
            method: ECommon_HttpApi_Method.GET,
            path: "/calendar",
            req: <{
                calendarId:string
            }>{},
            res: <ICommon_Model_Calendar>{},
            permission: [Permission_Types.Organization.READ]
        },
        filterEvent:{
            method: ECommon_HttpApi_Method.GET,
            path: "/calendar/event/filter",
            req: <{
                calendarId?:string,
                name?:string,
                page:number,
                size:number
            }>{},
            res: <ICommon_Route_Res_Calendar_Event_Filter>{},
            permission: [Permission_Types.Organization.READ]
        },
        searchCalendarEvent:{
            method: ECommon_HttpApi_Method.GET,
            path: "/calendar/event/search",
            req: <{
                calendarId?:string,
                start?:number,
                end?:number,
                keyword?:string,
                location?:string
            }>{},
            res: <ICommon_Route_Res_Calendar_ListEvent_Item[]>{},
            permission: [Permission_Types.Organization.READ]
        },
        relatedMeeting:{
            method: ECommon_HttpApi_Method.GET,
            path: "/calendar/event/meeting",
            req: <{
                calendarEventId:string
            }>{},
            res: <{
                meetingId:string
            }>{},
            permission: [Permission_Types.Organization.READ]
        }
    }
}
export default api