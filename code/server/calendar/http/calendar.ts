import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import calendarApi from "../../../common/routes/calendar";
import {ECommon_Calendar_Recurring_Type} from "../../../common/model/calendar_event";
import {IUserSession} from "../../user/types/config";
import {CalendarEventService, CalendarService, CalendarSettingService} from "../service/calendar";
import {Err} from "../../../common/status/error";
import {ECommon_Calendar_Color, ECommon_Calendar_Type} from "../../../common/model/calendar";
import * as moment from "moment";

@DComponent
@DHttpController(calendarApi)
class CalendarController {
    @DHttpApi(calendarApi.routes.listCalendar)
    async listCalendar(@DHttpUser user:IUserSession):Promise<typeof calendarApi.routes.listCalendar.res> {
        let ret=await CalendarService.listCalendar(user.organizationInfo.organizationUserId)
        return ret;
    }

    @DHttpApi(calendarApi.routes.addCalendar)
    async addCalendar(@DHttpReqParamRequired("name") name:string,@DHttpReqParamRequired("color") color:ECommon_Calendar_Color,@DHttpUser user:IUserSession):Promise<typeof calendarApi.routes.addCalendar.res> {
        let obj=new CalendarService()
        obj.assignItem({
            name,
            color,
            organization_user_id:user.organizationInfo.organizationUserId,
            type:ECommon_Calendar_Type.NATIVE
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(calendarApi.routes.editCalendar)
    async editCalendar(@DHttpReqParamRequired("calendarId") calendarId:string,@DHttpReqParam("name") name:string,@DHttpReqParam("color") color:ECommon_Calendar_Color):Promise<typeof calendarApi.routes.editCalendar.res> {
        let obj=await CalendarService.getItemById(calendarId)
        if(!obj) {
            throw Err.Calendar.calendarNotFound
        }
        obj.assignItem({
            name,
            color
        })
        let ret=await obj.update();
        return ret;
    }

    @DHttpApi(calendarApi.routes.removeCalendar)
    async removeCalendar(@DHttpReqParamRequired("calendarId") calendarId:string):Promise<typeof calendarApi.routes.removeCalendar.res> {
        let obj=await CalendarService.getItemById(calendarId)
        if(!obj) {
            throw Err.Calendar.calendarNotFound
        } else if(obj.getItem().reserved) {
            throw Err.Calendar.removeForbidden
        }
        await obj.delete();
        return
    }

    @DHttpApi(calendarApi.routes.listCalendarEvent)
    async listCalendarEvent(@DHttpReqParamRequired("calendarId") calendarId:string,@DHttpReqParamRequired("start") start:number,@DHttpReqParamRequired("end") end:number):Promise<typeof calendarApi.routes.listCalendarEvent.res> {
        let obj=await CalendarService.getItemById(calendarId)
        if(!obj) {
            throw Err.Calendar.calendarNotFound
        }
        let ret=await obj.listEvent(start,end)
        return ret;
    }

    @DHttpApi(calendarApi.routes.getCalendarEvent)
    async getCalendarEvent(@DHttpReqParamRequired("calendarEventId") calendarEventId:string):Promise<typeof calendarApi.routes.getCalendarEvent.res> {
        let obj=await CalendarEventService.getItemById(calendarEventId)
        if(!obj) {
            throw Err.Calendar.calendarEventNotFound
        }
        let ret=await obj.getInfo()
        return ret;
    }

    @DHttpApi(calendarApi.routes.addCalendarEvent)
    async addCalendarEvent(@DHttpReqParamRequired("calendarId") calendarId:string,
                           @DHttpReqParamRequired("name") name:string,
                           @DHttpReqParam("agenda") agenda:string,
                           @DHttpReqParamRequired("startTime") startTime:number,
                           @DHttpReqParam("endTime") endTime:number,
                           @DHttpReqParamRequired("all_day") all_day:number,
                           @DHttpReqParamRequired("recurring") recurring:ECommon_Calendar_Recurring_Type,
                           @DHttpReqParam("recurring_day") recurring_day:number,
                           @DHttpReqParam("reminder_minutes") reminder_minutes:number,
                           @DHttpReqParam("location") location:string,
                           @DHttpReqParam("guestList") guestList:string[]):Promise<typeof calendarApi.routes.addCalendarEvent.res> {
        let obj=new CalendarEventService()
        obj.assignItem({
            calendar_id:calendarId,
            name,
            agenda,
            location,
            all_day,
            recurring_day,
            recurring,
            start_time:new Date(startTime),
            end_time:new Date(endTime),
            reminder_minutes
        })
        await obj.create()
        await obj.handleGuestList(guestList)
        let ret=await obj.getInfo()
        return ret;
    }

    @DHttpApi(calendarApi.routes.editCalendarEvent)
    async editCalendarEvent(@DHttpReqParamRequired("calendarEventId") calendarEventId:string,
                            @DHttpReqParam("name") name:string,
                            @DHttpReqParam("agenda") agenda:string,
                            @DHttpReqParam("startTime") startTime:number,
                            @DHttpReqParam("endTime") endTime:number,
                            @DHttpReqParam("all_day") all_day:number,
                            @DHttpReqParam("recurring") recurring:ECommon_Calendar_Recurring_Type,
                            @DHttpReqParam("recurring_day") recurring_day:number,
                            @DHttpReqParam("reminder_minutes") reminder_minutes:number,
                            @DHttpReqParam("location") location:string,
                            @DHttpReqParam("guestList") guestList:string[]):Promise<typeof calendarApi.routes.editCalendarEvent.res> {
        let obj=await CalendarEventService.getItemById(calendarEventId)
        if(!obj) {
            throw Err.Calendar.calendarEventNotFound
        }
        let objStart:Date,objEnd:Date
        if(obj.getItem().recurring!==ECommon_Calendar_Recurring_Type.NONE && (recurring===undefined || obj.getItem().recurring===recurring) && startTime && endTime && (startTime!==obj.getItem().start_time.getTime() || endTime!==obj.getItem().end_time.getTime())) {
            let objStartEdit=moment(startTime)
            objStart=moment(obj.getItem().start_time).set({
                hour:objStartEdit.hour(),
                minute:objStartEdit.minute()
            }).toDate()
            let objEndEdit=moment(endTime)
            objEnd=moment(obj.getItem().end_time).set({
                hour:objEndEdit.hour(),
                minute:objEndEdit.minute()
            }).toDate()
        } else {
            if(startTime) {
                objStart=new Date(startTime)
            }
            if(endTime) {
                objEnd=new Date(endTime)
            }
        }
        obj.assignItem({
            name,
            agenda,
            start_time:objStart,
            end_time:objEnd,
            all_day,
            recurring,
            recurring_day,
            location,
            reminder_minutes
        })
        await obj.update()
        await obj.handleGuestList(guestList)
        let ret=await obj.getInfo()
        return ret;
    }

    @DHttpApi(calendarApi.routes.removeCalendarEvent)
    async removeCalendarEvent(@DHttpReqParamRequired("calendarEventId") calendarEventId:string):Promise<typeof calendarApi.routes.removeCalendarEvent.res> {
        let obj=await CalendarEventService.getItemById(calendarEventId)
        if(!obj) {
            throw Err.Calendar.calendarEventNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(calendarApi.routes.getCalendarSetting)
    async getCalendarSetting(@DHttpUser user:IUserSession):Promise<typeof calendarApi.routes.getCalendarSetting.res> {
        let obj=await CalendarSettingService.getItemByExp({
            organization_user_id:user.organizationInfo.organizationUserId
        })
        if(!obj) {
            throw Err.Calendar.settingNotFound
        }
        return obj.getItem()
    }

    @DHttpApi(calendarApi.routes.editCalendarSetting)
    async editCalendarSetting(@DHttpReqParam("timezone") timezone:string,@DHttpReqParam("startWeekDay") startWeekDay:number,@DHttpUser user:IUserSession):Promise<typeof calendarApi.routes.editCalendarSetting.res> {
        let obj=await CalendarSettingService.getItemByExp({
            organization_user_id:user.organizationInfo.organizationUserId
        })
        if(!obj) {
            throw Err.Calendar.settingNotFound
        }
        obj.assignItem({
            timezone,
            start_week_day:startWeekDay
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(calendarApi.routes.getCalendar)
    async getCalendar(@DHttpReqParamRequired("calendarId") calendarId:string):Promise<typeof calendarApi.routes.getCalendar.res> {
        let obj=await CalendarService.getItemById(calendarId)
        if(!obj) {
            throw Err.Calendar.calendarNotFound
        }
        return obj.getItem()
    }
}