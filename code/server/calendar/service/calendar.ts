import {Entity} from "../../common/entity/entity";
import {calendarModel} from "../../../common/model/calendar";
import {calendarEventMapper, calendarMapper, calendarSettingMapper} from "../mapper/calendar";
import {calendarSettingModel} from "../../../common/model/calendar_setting";
import {IServer_Common_Event_Types} from "../../common/event/types";
import {calendarEventModel, ECommon_Calendar_Recurring_Type} from "../../../common/model/calendar_event";
import userRpcApi from "../../user/rpc/user"
import {generateSnowId} from "../../common/util/sql";
import * as moment from "moment";
import {calendarMq} from "../mq/calendar";
import rpcContentApi from "../../content/rpc/content"
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import rpcMeetingApi from "../../meeting/rpc/meeting"

export class CalendarService extends Entity<typeof calendarModel,typeof calendarMapper> {
    constructor() {
        super(calendarMapper)
    }
    static async listCalendar(organizationUserId:string) {
        let ret=await calendarMapper.listCalendar(organizationUserId)
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await calendarMapper.clearEvent(this.getId())
    }

    static async clearCalendar(organizationUserId:string) {
        await calendarMapper.clearCalendar(organizationUserId)
    }

    static async clearCalendarByOrganizationId(organizationId:string) {
        await calendarMapper.clearCalendarByOrganizationId(organizationId)
    }

    async listEvent(start:number,end:number) {
        let ret=await calendarMapper.listCalendarEvent(this.getItem().organization_user_id,this.getId(),start,end,this.getItem().reserved)
        return ret;
    }



}

export class CalendarEventService extends Entity<typeof calendarEventModel,typeof calendarEventMapper> {
    constructor() {
        super(calendarEventMapper)
    }

    async listGuest() {
        let arrGuest=await calendarEventMapper.listGuest(this.getId())
        return arrGuest
    }

    async getInfo() {
        let [arrGuest,objAgenda,objMeeting]=await Promise.all([
            calendarEventMapper.listGuest(this.getId()),
            rpcContentApi.get(this.getId(),ECommon_Model_Content_Type.CALENDAR_EVENT_AGENDA),
            rpcMeetingApi.meetingRoomByRelatedId(this.getId()).catch(()=>{
                return null;
            })
        ])
        return {
            ...this.getItem(),
            guestList:(await userRpcApi.getOrganizationUsersInfo(arrGuest.map(item=>item.organization_user_id))).map(item=>{
                return {
                    userId:item.id,
                    organizationUserId:item.organizationUserId,
                    nickname:item.nickname,
                    photo:item.photo
                }
            }),
            agenda:objAgenda?.content,
            meeting:objMeeting?.id
        }
    }

    async handleGuestList(guestIds:string[]) {
        await calendarEventMapper.handleGuestList(this.getId(),guestIds)
    }

    override async create(): Promise<typeof calendarEventModel["model"]> {
        this.getItem().unique_id=await generateSnowId()
        let obj=await super.create();
        if(obj.reminder_minutes) {
            this.handleReminder()
        }
        return obj;
    }

    override async update(): Promise<typeof calendarEventModel["model"]> {
        let objBack=this.getBackItem()
        let isChange=false
        if(Number(objBack.start_time)!==Number(this.getItem().start_time) || Number(objBack.end_time)!==Number(this.getItem().end_time) || objBack.reminder_minutes!==this.getItem().reminder_minutes || objBack.all_day!==this.getItem().all_day || objBack.recurring!==this.getItem().recurring || (objBack.recurring===this.getItem().recurring && objBack.recurring_day!==this.getItem().recurring_day)) {
            this.getItem().unique_id=await generateSnowId()
            this.getItem().is_reminder=0
            isChange=true
        }
        let obj=await super.update();
        if(isChange && obj.reminder_minutes) {
            this.handleReminder()
        }
        return obj
    }

    private handleReminder() {
        let obj=this.getItem()
        let objNow=moment()
        let objStart=moment(obj.start_time)
        if(obj.recurring!==ECommon_Calendar_Recurring_Type.NONE) {
            let isMatch=calendarEventMapper.checkRecurringEvent(obj.recurring,obj.recurring_day,obj.start_time,objNow)
            if(isMatch) {
                let objTemp=moment({
                    year:objNow.year(),
                    month:objNow.month(),
                    date:objNow.date(),
                    hour:objStart.hour(),
                    minute:objStart.minute()
                })
                if(objNow.isBefore(objTemp)) {
                    let delay=objTemp.clone().subtract(obj.reminder_minutes??0,"minutes").diff(objNow,"milliseconds")
                    calendarMq.publishReminder({
                        id:obj.id,
                        unique_id:obj.unique_id,
                        calendar_id:obj.calendar_id,
                        start_time:objTemp.toDate().getTime()
                    },delay)
                }
            }
        } else {
            if(objStart.clone().subtract(obj.reminder_minutes??0,"minutes").isSame(objNow,"days") && objStart.isAfter(objNow)) {
                let delay=objStart.clone().subtract(obj.reminder_minutes??0,"minutes").diff(objNow,"milliseconds")
                calendarMq.publishReminder({
                    id:obj.id,
                    unique_id:obj.unique_id,
                    calendar_id:obj.calendar_id
                },delay)
            }
        }
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await calendarEventMapper.clearGuestList(this.getId())
        await rpcContentApi.clearByRefId(this.getId())
        await rpcMeetingApi.clearMeetingRoomByRelatedId(this.getId())
    }

    static async listReminderEvent(start:number,end:number) {
        let eventList=await calendarEventMapper.listReminderEvent(start,end)
        return eventList
    }

    async getMemberList() {
        let arr=calendarEventMapper.getMemberList(this.getId(),this.getItem().calendar_id)
        return arr;
    }

    static async filterEvent(organizationUserId:string,calendarId:string,name:string,page:number,size:number) {
        let ret=await calendarEventMapper.filterEvent(organizationUserId,calendarId,name,page,size)
        return ret;
    }

    static async searchEvent(organizationUserId:string,calendarId?:string,start?:number,end?:number,keyword?:string,location?:string) {
        let ret=await calendarEventMapper.searchCalendarEvent(organizationUserId,calendarId,start,end,keyword,location)
        return ret;
    }
}

export class CalendarSettingService extends Entity<typeof calendarSettingModel,typeof calendarSettingMapper> {
    constructor() {
        super(calendarSettingMapper)
    }
}
