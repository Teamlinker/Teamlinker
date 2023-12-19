import {ECommon_Calendar_Color, ECommon_Calendar_Type} from "../../../common/model/calendar";
import {CalendarEventService, CalendarService, CalendarSettingService} from "../service/calendar";
import {Err} from "../../../common/status/error";
import {ECommon_Calendar_WeekDay} from "../../../common/model/calendar_setting";

class RpcCalendarApi {
    async addCalendar(organizationUserId:string,name:string,color:ECommon_Calendar_Color,isDefault:number,organizationId:string) {
        if(isDefault) {
            let obj=await CalendarService.getItemByExp({
                organization_user_id:organizationUserId,
                reserved:isDefault
            })
            if(obj) {
                throw Err.Calendar.defaultCalendarDuplicate
            }
        }
        let obj=new CalendarService()
        obj.assignItem({
            organization_user_id:organizationUserId,
            reserved:isDefault,
            name,
            color,
            type:ECommon_Calendar_Type.NATIVE,
            organization_id:organizationId
        })
        let ret=await obj.create();
        let objSetting=await CalendarSettingService.getItemByExp({
            organization_user_id:organizationUserId,
            organization_id:organizationId
        })
        if(!objSetting) {
            await this.addCalendarSetting(organizationUserId,organizationId)
        }
        return ret;
    }

    async clearCalendar(organizationUserId:string) {
        await CalendarService.clearCalendar(organizationUserId)
        await this.removeCalendarSetting(organizationUserId)
    }

    async clearCalendarByOrganizationId(organizationId:string) {
        await CalendarService.clearCalendarByOrganizationId(organizationId)
    }

    async addCalendarSetting(organizationUserId:string,organizationId:string) {
        let obj=await CalendarSettingService.getItemByExp({
            organization_user_id:organizationUserId
        })
        if(obj) {
            throw Err.Calendar.settingAlreadyExists
        }
        obj=new CalendarSettingService()
        obj.assignItem({
            organization_user_id:organizationUserId,
            start_week_day:ECommon_Calendar_WeekDay.Sun,
            organization_id:organizationId
        })
        await obj.create()
    }

    async removeCalendarSetting(organizationUserId:string) {
        let obj=await CalendarSettingService.getItemByExp({
            organization_user_id:organizationUserId
        })
        if(!obj) {
            throw Err.Calendar.settingNotFound
        }
        await obj.delete()
    }

    async calendarEvent(calendarEventId:string) {
        let obj=await CalendarEventService.getItemById(calendarEventId)
        if(!obj) {
            throw Err.Calendar.calendarEventNotFound
        }
        return obj.getItem()
    }

    async calendar(calendarId:string) {
        let obj=await CalendarService.getItemById(calendarId)
        if(!obj) {
            throw Err.Calendar.calendarNotFound
        }
        return obj.getItem()
    }

    async searchEvent(organizationUserId:string,calendarId?:string,start?:number,end?:number,keyword?:string,location?:string) {
        let ret=await CalendarEventService.searchEvent(organizationUserId,calendarId,start,end,keyword,location)
        return ret;
    }
}

export default new RpcCalendarApi()