import {BaseMq} from "../../common/mq/mq";
import * as amqpLib from "amqplib";
import {ECommon_Mq_Calendar, ICommon_Mq_Calendar} from "../../../common/mq/type";
import * as moment from "moment";
import {CalendarEventService} from "../service/calendar";
import {ECommon_Calendar_Recurring_Type} from "../../../common/model/calendar_event";
import {getSocketEmitterInstance} from "../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../common/socket/types";

let exchange="calendar-delay-exchange"
let queue="calendar"
class CalendarMq extends BaseMq {
    private publisher:amqpLib.Channel
    private consumer:amqpLib.Channel
    async init() {
        this.publisher=await super.createChannel()
        this.consumer=await super.createChannel()
        await this.publisher.assertExchange(exchange,"x-delayed-message",{
            autoDelete:false,
            durable:true,
            arguments:{
                "x-delayed-type":"direct"
            }
        })
        await this.consumer.assertQueue(queue,{durable:true})
        await this.publisher.bindQueue(queue, exchange, queue)
        await this.publisher.purgeQueue(queue)
        this.consumer.consume(queue,async msg => {
            if(msg) {
                let emit=getSocketEmitterInstance()
                let content=JSON.parse(msg.content.toString()) as {
                    name:ECommon_Mq_Calendar,
                    data:any
                }
                if(content.name==ECommon_Mq_Calendar.REMINDER) {
                    let obj:ICommon_Mq_Calendar[ECommon_Mq_Calendar.REMINDER]=content.data
                    let objEvent=await CalendarEventService.getItemById(obj.id)
                    if(objEvent) {
                        if(objEvent.getItem().unique_id==obj.unique_id) {
                            if(objEvent.getItem().recurring===ECommon_Calendar_Recurring_Type.NONE) {
                                if(objEvent.getItem().is_reminder===0 && moment().isBefore(moment(objEvent.getItem().start_time))) {
                                    let arrMember=await objEvent.getMemberList()
                                    emit.of("/"+ECommon_Socket_Type.CALENDAR).to(arrMember).emit("calendar_event_reminder",obj.id,objEvent.getItem().name,objEvent.getItem().start_time.getTime())
                                    objEvent.assignItem({
                                        is_reminder:1
                                    })
                                    await objEvent.update()
                                }
                            } else {
                                if(moment().isBefore(moment(obj.start_time))) {
                                    let arrMember=await objEvent.getMemberList()
                                    emit.of("/"+ECommon_Socket_Type.CALENDAR).to(arrMember).emit("calendar_event_reminder",obj.id,objEvent.getItem().name,obj.start_time)
                                }
                            }
                        }
                    }
                }
                this.consumer.ack(msg)
            }
        })
    }
    publishReminder(content:ICommon_Mq_Calendar[ECommon_Mq_Calendar.REMINDER],delayedMilliseconds:number) {
        this.publisher.publish(exchange,queue,Buffer.from(JSON.stringify({
            name:ECommon_Mq_Calendar.REMINDER,
            data:content
        })),{
            headers:{
                "x-delay":delayedMilliseconds
            }
        })
    }
    async initEventReminder() {
        let objStart=moment();
        let objEnd=objStart.clone().set({
            hour:23,
            minute:59,
            second:59
        })
        let eventList=await CalendarEventService.listReminderEvent(objStart.toDate().getTime(),objEnd.toDate().getTime())
        for(let event of eventList) {
            this.publishReminder({
                id:event.id,
                unique_id:event.unique_id,
                calendar_id:event.calendarId,
                start_time:event.start_time
            },event.time)
        }
    }
}

export const calendarMq=new CalendarMq()