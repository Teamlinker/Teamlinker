import {ECommon_Calendar_Color, ECommon_Calendar_Type} from "../../../common/model/calendar";
import {CalendarService, CalendarSettingService} from "../service/calendar";
import {Err} from "../../../common/status/error";
import {ECommon_Calendar_WeekDay} from "../../../common/model/calendar_setting";

class RpcCalendarApi {
    async addCalendar(organizationUserId:string,name:string,color:ECommon_Calendar_Color,isDefault:number) {
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
            type:ECommon_Calendar_Type.NATIVE
        })
        let ret=await obj.create();
        let objSetting=await CalendarSettingService.getItemByExp({
            organization_user_id:organizationUserId
        })
        if(!objSetting) {
            await this.addCalendarSetting(organizationUserId)
        }
        return ret;
    }

    async clearCalendar(organizationUserId:string) {
        await CalendarService.clearCalendar(organizationUserId)
        await this.removeCalendarSetting(organizationUserId)
    }

    async addCalendarSetting(organizationUserId:string) {
        let obj=await CalendarSettingService.getItemByExp({
            organization_user_id:organizationUserId
        })
        if(obj) {
            throw Err.Calendar.settingAlreadyExists
        }
        obj=new CalendarSettingService()
        obj.assignItem({
            organization_user_id:organizationUserId,
            start_week_day:ECommon_Calendar_WeekDay.Sun
        })
        await obj.create()
    }

    async removeCalendarSetting(organizationUserId:string) {
        let obj=await CalendarSettingService.getItemByExp({
            organization_user_id:organizationUserId
        })
        if(obj) {
            throw Err.Calendar.settingNotFound
        }
        await obj.delete()
    }
}

export default new RpcCalendarApi()