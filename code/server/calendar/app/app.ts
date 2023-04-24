import "../http/calendar"

import {handleCalendarConnection} from "../socket/socket";
import {calendarMq} from "../mq/calendar";
import getJobInstance from "../../common/job/job";
import * as moment from "moment";
import {CalendarEventService} from "../service/calendar";

export async function initCalendar() {
    await handleCalendarConnection()
    await calendarMq.init()
    let job = getJobInstance();
    job.create("add-calendar-reminder", {
        minute: 0,
        hour:14
    }, async (fireDate: Date) => {
        let objNow=moment(fireDate)
        let objStart=objNow.clone().add(1,"days").set({
            hour:0,
            minute:0,
            second:0
        })
        let objEnd=objNow.clone().add(1,"days").set({
            hour:23,
            minute:59,
            second:59
        })
        let eventList=await CalendarEventService.listReminderEvent(objStart.toDate().getTime(),objEnd.toDate().getTime())
        for(let event of eventList) {
            calendarMq.publishReminder({
                id:event.id,
                unique_id:event.unique_id,
                calendar_id:event.calendarId,
                start_time:event.start_time
            },event.time)
        }
    })
    calendarMq.initEventReminder()
}