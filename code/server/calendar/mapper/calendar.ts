import {Mapper} from "../../common/entity/mapper";
import {calendarModel} from "../../../common/model/calendar";
import {calendarSettingModel, ECommon_Calendar_WeekDay} from "../../../common/model/calendar_setting";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {
    convertCountSql,
    generateBatchCreateSql,
    generateDeleteLeftJoin2Sql,
    generateDeleteLeftJoin3Sql,
    generateDeleteSql,
    generateLeftJoin2Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId
} from "../../common/util/sql";
import {calendarEventModel, ECommon_Calendar_Recurring_Type} from "../../../common/model/calendar_event";
import {calendarEventGuestModel, ICommon_Model_Calendar_Event_Guest} from "../../../common/model/calendar_event_guest";
import {ICommon_Route_Res_Calendar_ListEvent_Item} from "../../../common/routes/response";
import * as moment from "moment";
import {keys} from "../../../common/transform";
import CommonUtil from "../../common/util/common";
import {meetingRoomModel} from "../../../common/model/meeting_room";


class CalendarMapper extends Mapper<typeof calendarModel> {
    constructor() {
        super(calendarModel)
    }
    async listCalendar(organizationUserId:string) {
        if(!organizationUserId) {
            throw Err.Organization.userNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(calendarModel,null,{
            organization_user_id:organizationUserId
        }))
        return arr;
    }

    async clearEvent(calendarId:string) {
        if(!calendarId) {
            throw Err.Calendar.calendarNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteLeftJoin2Sql(calendarEventModel,{
            model:calendarEventGuestModel,
            expression:{
                calendar_event_id:{
                    model:calendarEventModel,
                    field:"id"
                }
            },
            isDelete:true
        },{
            model:meetingRoomModel,
            expression:{
                related_id:{
                    model:calendarEventModel,
                    field:"id"
                }
            },
            isDelete:true
        },{
            calendar_id:{
                model:calendarEventModel,
                value:calendarId
            }
        }))
    }

    async clearCalendar(organizationUserId:string) {
        if(!organizationUserId) {
            throw Err.Organization.userNotFound
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateDeleteLeftJoin3Sql(calendarModel,{
                model:calendarEventModel,
                expression:{
                    calendar_id:{
                        model:calendarModel,
                        field: "id"
                    }
                }
            },{
                model:calendarEventGuestModel,
                expression:{
                    calendar_event_id:{
                        model:calendarEventModel,
                        field:"id"
                    }
                }
            },{
                model:meetingRoomModel,
                expression:{
                    related_id:{
                        model:calendarEventModel,
                        field:"id"
                    }
                }
            },{
                organization_user_id:{
                    model:calendarModel,
                    value:organizationUserId
                }
            })),
            mysql.execute(generateDeleteSql(calendarEventGuestModel,{
                organization_user_id:organizationUserId
            }))
        ])
    }

    async clearCalendarByOrganizationId(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateDeleteLeftJoin3Sql(calendarModel,{
                model:calendarEventModel,
                expression:{
                    calendar_id:{
                        model:calendarModel,
                        field: "id"
                    }
                }
            },{
                model:calendarEventGuestModel,
                expression:{
                    calendar_event_id:{
                        model:calendarEventModel,
                        field:"id"
                    }
                }
            },{
                model:meetingRoomModel,
                expression:{
                    related_id:{
                        model:calendarEventModel,
                        field:"id"
                    }
                }
            },{
                organization_id:{
                    model:calendarModel,
                    value:organizationId
                }
            })),
            mysql.execute(generateDeleteSql(calendarSettingModel,{
                organization_id:organizationId
            }))
        ])
    }

    async listCalendarEvent(organizationUserId:string,calendarId:string,start:number,end:number,isDefault:number):Promise<ICommon_Route_Res_Calendar_ListEvent_Item[]> {
        if(!calendarId) {
            throw Err.Calendar.calendarNotFound
        }
        let startStr=moment(start).format("YYYY-MM-DD HH:mm")
        let endStr=moment(end).format("YYYY-MM-DD HH:mm")
        let mysql=getMysqlInstance()
        let arrPromise=[
            Promise.resolve(generateLeftJoinSql({
                model:calendarEventModel,
                columns:["name","id","start_time","end_time","reminder_minutes","all_day","created_by"]
            },{
                model:calendarModel,
                columns:["color","id","name"],
                rename:{
                    fields:["id","name"],
                    newFields:["calendarId","calendarName"]
                },
                expression:{
                    id:{
                        model:calendarEventModel,
                        field:"calendar_id"
                    }
                }
            },{
                "$and0":{
                    start_time:{
                        model:calendarEventModel,
                        value:{
                            exp:"<=",
                            value:startStr
                        }
                    },
                    end_time:{
                        model:calendarEventModel,
                        value:{
                            exp: ">",
                            value:startStr
                        }
                    },
                    calendar_id: {
                        model:calendarEventModel,
                        value:calendarId
                    },
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    }
                },
                "$and1":{
                    start_time:{
                        model:calendarEventModel,
                        value:{
                            exp:"<=",
                            value:endStr
                        }
                    },
                    end_time:{
                        model:calendarEventModel,
                        value:{
                            exp: ">",
                            value:endStr
                        }
                    },
                    calendar_id: {
                        model:calendarEventModel,
                        value:calendarId
                    },
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    }
                },
                "$and2":{
                    start_time:{
                        model:calendarEventModel,
                        value:{
                            exp:">=",
                            value:startStr
                        }
                    },
                    end_time:{
                        model:calendarEventModel,
                        value:{
                            exp: "<=",
                            value:endStr
                        }
                    },
                    calendar_id: {
                        model:calendarEventModel,
                        value:calendarId
                    },
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    }
                }
            },"or")).then(sql=>{
                return mysql.execute(sql)
            }).then(arr=>{
                let ret:ICommon_Route_Res_Calendar_ListEvent_Item[]=[]
                for(let obj of arr) {
                    ret.push({
                        name:obj.name,
                        color:obj.color,
                        id:obj.id,
                        start_time:obj.start_time,
                        end_time:obj.end_time,
                        calendar:{
                            id:obj.calendarId,
                            name:obj.calendarName
                        },
                        all_day:obj.all_day,
                        reminder_minutes:obj.reminder_minutes,
                        created_by:obj.created_by
                    })
                }
                return ret;
            }),
            Promise.resolve(generateLeftJoinSql({
                model: calendarEventModel,
                columns: ["name", "id", "start_time", "end_time", "recurring", "recurring_day","all_day","reminder_minutes","created_by"]
            }, {
                model: calendarModel,
                columns:["color","id","name"],
                rename:{
                    fields:["id","name"],
                    newFields:["calendarId","calendarName"]
                },
                expression: {
                    id: {
                        model: calendarEventModel,
                        field: "calendar_id"
                    }
                }
            }, {
                calendar_id: {
                    model: calendarEventModel,
                    value: calendarId
                },
                recurring: {
                    model: calendarEventModel,
                    value: {
                        exp: "<>",
                        value: ECommon_Calendar_Recurring_Type.NONE
                    }
                },
                start_time: {
                    model: calendarEventModel,
                    value: {
                        exp: "<=",
                        value: endStr
                    }
                }
            }, "and")).then(sql=>{
                return mysql.execute(sql)
            }).then(arr => {
                let ret:ICommon_Route_Res_Calendar_ListEvent_Item[]=[]
                for(let obj of arr) {
                    let objStart=moment(start)
                    let objEnd=moment(end)
                    let objStartTime=moment(obj.start_time)
                    let objEndTime=moment(obj.end_time)
                    while (objStart.isSameOrBefore(objEnd,"days")) {
                        let isMatch=calendarEventMapper.checkRecurringEvent(obj.recurring,obj.recurring_day,obj.start_time,objStart)
                        if(isMatch) {
                            let offsetDay=objStart.diff(objStartTime.clone().startOf("days"),"days")
                            ret.push({
                                name:obj.name,
                                color:obj.color,
                                id:obj.id,
                                start_time:objStartTime.clone().add(offsetDay,"days").toDate(),
                                end_time:objEndTime.clone().add(offsetDay,"days").toDate(),
                                calendar:{
                                    id:obj.calendarId,
                                    name:obj.calendarName
                                },
                                all_day:obj.all_day,
                                reminder_minutes:obj.reminder_minutes,
                                created_by:obj.created_by
                            })
                        }
                        objStart.add(1,"days")
                    }
                }
                return ret;
            })
        ]
        if(isDefault) {
            arrPromise.push(
                Promise.resolve(generateLeftJoin2Sql({
                    model:calendarEventModel,
                    columns:["name","id","start_time","end_time","reminder_minutes","all_day","created_by"]
                },{
                    model:calendarModel,
                    columns:["color","id","name"],
                    rename:{
                        fields:["id","name"],
                        newFields:["calendarId","calendarName"]
                    },
                    expression:{
                        id:{
                            model:calendarEventModel,
                            field:"calendar_id"
                        }
                    }
                },{
                    model:calendarEventGuestModel,
                    expression:{
                        calendar_event_id:{
                            model:calendarEventModel,
                            field:"id"
                        }
                    }
                },{
                    "$and0":{
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:"<=",
                                value:startStr
                            }
                        },
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: ">",
                                value:startStr
                            }
                        },
                        organization_user_id: {
                            model:calendarEventGuestModel,
                            value:organizationUserId
                        },
                        recurring:{
                            model:calendarEventModel,
                            value:ECommon_Calendar_Recurring_Type.NONE
                        }
                    },
                    "$and1":{
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:"<=",
                                value:endStr
                            }
                        },
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: ">",
                                value:endStr
                            }
                        },
                        organization_user_id: {
                            model:calendarEventGuestModel,
                            value:organizationUserId
                        },
                        recurring:{
                            model:calendarEventModel,
                            value:ECommon_Calendar_Recurring_Type.NONE
                        }
                    },
                    "$and2":{
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:">=",
                                value:startStr
                            }
                        },
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: "<=",
                                value:endStr
                            }
                        },
                        organization_user_id: {
                            model:calendarEventGuestModel,
                            value:organizationUserId
                        },
                        recurring:{
                            model:calendarEventModel,
                            value:ECommon_Calendar_Recurring_Type.NONE
                        }
                    }
                },"or")).then(sql=>{
                    return mysql.execute(sql)
                }).then(arr=>{
                    let ret:ICommon_Route_Res_Calendar_ListEvent_Item[]=[]
                    for(let obj of arr) {
                        ret.push({
                            name:obj.name,
                            color:obj.color,
                            id:obj.id,
                            start_time:obj.start_time,
                            end_time:obj.end_time,
                            calendar:{
                                id:obj.calendarId,
                                name:obj.calendarName
                            },
                            all_day:obj.all_day,
                            reminder_minutes:obj.reminder_minutes,
                            created_by:obj.created_by
                        })
                    }
                    return ret;
                }),
            Promise.resolve(generateLeftJoin2Sql({
                model: calendarEventModel,
                columns: ["name", "id", "start_time", "end_time", "recurring", "recurring_day","reminder_minutes","all_day","created_by"]
            }, {
                model: calendarModel,
                columns:["color","id","name"],
                rename:{
                    fields:["id","name"],
                    newFields:["calendarId","calendarName"]
                },
                expression: {
                    id: {
                        model: calendarEventModel,
                        field: "calendar_id"
                    }
                }
            },{
                model:calendarEventGuestModel,
                expression:{
                    calendar_event_id:{
                        model:calendarEventModel,
                        field:"id"
                    }
                }
            }, {
                recurring: {
                    model: calendarEventModel,
                    value: {
                        exp: "<>",
                        value: ECommon_Calendar_Recurring_Type.NONE
                    }
                },
                start_time: {
                    model: calendarEventModel,
                    value: {
                        exp: "<=",
                        value: endStr
                    }
                },
                organization_user_id:{
                    model:calendarEventGuestModel,
                    value:organizationUserId
                }
            }, "and")).then(sql=>{
              return mysql.execute(sql)
            }).then(arr => {
                let ret:ICommon_Route_Res_Calendar_ListEvent_Item[]=[]
                for(let obj of arr) {
                    let objStart=moment(start)
                    let objEnd=moment(end)
                    let objStartTime=moment(obj.start_time)
                    let objEndTime=moment(obj.end_time)
                    while (objStart.isSameOrBefore(objEnd,"days")) {
                        let isMatch=calendarEventMapper.checkRecurringEvent(obj.recurring,obj.recurring_day,obj.start_time,objStart)
                        if(isMatch) {
                            let offsetDay=objStart.diff(objStartTime.clone().startOf("days"),"days")
                            ret.push({
                                name:obj.name,
                                color:obj.color,
                                id:obj.id,
                                start_time:objStartTime.clone().add(offsetDay,"days").toDate(),
                                end_time:objEndTime.clone().add(offsetDay,"days").toDate(),
                                calendar:{
                                    id:obj.calendarId,
                                    name:obj.calendarName
                                },
                                all_day:obj.all_day,
                                reminder_minutes:obj.reminder_minutes,
                                created_by:obj.created_by
                            })
                        }
                        objStart.add(1,"days")
                    }
                }
                return ret;
            }))
        }
        let [arr1,arr2,arr3,arr4]=await Promise.all(arrPromise)
        if(isDefault) {
            return [...arr1,...arr2,...arr3,...arr4]
        } else {
            return [...arr1,...arr2]
        }
    }


}

export const calendarMapper=new CalendarMapper

class CalendarEventMapper extends Mapper<typeof calendarEventModel> {
    constructor() {
        super(calendarEventModel)
    }
    async listGuest(calendarEventId:string) {
        if(!calendarEventId) {
            throw Err.Calendar.calendarEventNotFound
        }
        let mysql=getMysqlInstance()
        let arrGuest=await mysql.execute(generateQuerySql(calendarEventGuestModel,["organization_user_id"],{
            calendar_event_id:calendarEventId
        }))
        return arrGuest
    }

    async handleGuestList(calendarEventId:string,guestIds:string[]) {
        if(!calendarEventId) {
            throw Err.Calendar.calendarEventNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(calendarEventGuestModel,{
            calendar_event_id:calendarEventId
        }))
        let ret:ICommon_Model_Calendar_Event_Guest[]=[]
        if(guestIds && guestIds.length>0) {
            for(let id of guestIds) {
                ret.push({
                    id:await generateSnowId(),
                    calendar_event_id:calendarEventId,
                    organization_user_id:id
                })
            }
            await mysql.execute(generateBatchCreateSql(calendarEventGuestModel,ret))
        }
    }

    async clearGuestList(calendarEventId:string) {
        if(!calendarEventId) {
            throw Err.Calendar.calendarEventNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(calendarEventGuestModel,{
            calendar_event_id:calendarEventId
        }))
    }

    async listReminderEvent(start:number,end:number):Promise<{
        id:string,
        unique_id:string,
        time:number,
        calendarId:string,
        start_time?:number
    }[]> {
        let startStr=moment(start).format("YYYY-MM-DD HH:mm")
        let mysql=getMysqlInstance()
        let arrPromise=[
            mysql.execute(generateQuerySql(calendarEventModel,["id","unique_id","start_time","reminder_minutes","calendar_id"],{
                start_time:{
                    exp:"<=",
                    value:startStr
                },
                end_time:{
                    exp: ">",
                    value:startStr
                },
                recurring:ECommon_Calendar_Recurring_Type.NONE,
                is_reminder:0,
                reminder_minutes:{
                    exp:"is not null"
                }
            })).then(arr=>{
                let ret:{
                    id:string,
                    unique_id:string,
                    time:number,
                    calendarId:string
                }[]=[]
                for(let obj of arr) {
                    ret.push({
                        id:obj.id,
                        unique_id:obj.unique_id,
                        time:obj.start_time.getTime()-obj.reminder_minutes*60*1000-moment().toDate().getTime(),
                        calendarId:obj.calendar_id
                    })
                }
                return ret
            }),
            mysql.execute(generateQuerySql(calendarEventModel,["name", "id", "start_time", "end_time", "recurring", "recurring_day","unique_id","reminder_minutes","calendar_id"], {
                recurring: {
                    exp: "<>",
                    value: ECommon_Calendar_Recurring_Type.NONE
                },
                start_time: {
                    exp: "<=",
                    value: startStr
                },
                reminder_minutes:{
                    exp:"is not null"
                }
            })).then(arr => {
                let ret:{
                    id:string,
                    unique_id:string,
                    time:number,
                    calendarId:string,
                    start_time:number
                }[]=[]
                for(let obj of arr) {
                    let objStart=moment(start)
                    let objEnd=moment(end)
                    let objMoment=moment(obj.start_time)
                    while (objStart.isSameOrBefore(objEnd,"days")) {
                        let isMatch=this.checkRecurringEvent(obj.recurring,obj.recurring_day,obj.start_time,objStart)
                        if(isMatch) {
                            let objReal=objStart.clone().set({
                                hour:objMoment.hour(),
                                minute:objMoment.minute()
                            })
                            let delay=objReal.clone().subtract(obj.reminder_minutes??0,"minutes").diff(moment(),"milliseconds")
                            ret.push({
                                id:obj.id,
                                unique_id:obj.unique_id,
                                time:delay,
                                calendarId:obj.calendar_id,
                                start_time:objReal.toDate().getTime()
                            })
                        }
                        objStart.add(1,"days")
                    }
                }
                return ret;
            })
        ]
        let [arr1,arr2]=await Promise.all(arrPromise)
        return [...arr1,...arr2]
    }

    async getMemberList(calendarEventId:string,calendarId:string) {
        if(!calendarEventId) {
            throw Err.Calendar.calendarEventNotFound
        }
        let mysql=getMysqlInstance()
        let [objCalendar,arrGuest]=await Promise.all([
            mysql.executeOne(generateQuerySql(calendarModel,["organization_user_id"],{
                id:calendarId
            })),
            mysql.execute(generateQuerySql(calendarEventGuestModel,["organization_user_id"],{
                calendar_event_id:calendarEventId
            }))
        ])
        return [objCalendar.organization_user_id,...arrGuest.map(item=>item.organization_user_id)]
    }

    checkRecurringEvent(recurring:ECommon_Calendar_Recurring_Type,recurring_day:ECommon_Calendar_WeekDay,start_time:Date,objMoment:moment.Moment) {
        let isMatch=false
        if(objMoment.isSameOrAfter(moment(start_time),"days")) {
            if(recurring==ECommon_Calendar_Recurring_Type.DAY) {
                isMatch=true
            } else if(recurring==ECommon_Calendar_Recurring_Type.WORKDAY) {
                let day=objMoment.day()
                if(day>=1 && day<=5) {
                    isMatch=true;
                }
            } else if(recurring==ECommon_Calendar_Recurring_Type.WEEK) {
                if(objMoment.day()==recurring_day) {
                    isMatch=true
                }
            } else if(recurring==ECommon_Calendar_Recurring_Type.MONTH) {
                if(objMoment.date()==recurring_day) {
                    isMatch=true
                }
            }
        }
        return isMatch
    }

    async filterEvent(organizationUserId:string,calendarId:string,name:string,page:number,size:number) {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:calendarEventModel,
            columns:keys<typeof calendarEventModel["model"]>().map(item=>item.name)
        },{
            model:calendarModel,
            columns:keys<typeof calendarModel["model"]>().map(item=>item.name),
            aggregation:"calendar",
            expression:{
                id:{
                    model:calendarEventModel,
                    field:"calendar_id"
                }
            }
        },{
            organization_user_id:{
                model:calendarModel,
                value:organizationUserId
            },
            ...(calendarId && {
                calendar_id:{
                    model:calendarEventModel,
                    value:calendarId
                }
            }),
            ...(name && {
                name:{
                    model:calendarEventModel,
                    value:{
                        exp:"%like%",
                        value:name
                    }
                }
            }),
        },"and",{
            model:calendarEventModel,
            field:"name",
            type:"asc"
        },page*size,size)
        let countSql=convertCountSql(sql);
        let count=Number(Object.values(await mysql.executeOne(countSql))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let ret=await mysql.execute(sql)
        return {
            count:count,
            totalPage:totalPage,
            page:page,
            data:ret
        }
    }


    async searchCalendarEvent(organizationUserId:string,calendarId?:string,start?:number,end?:number,keyword?:string,location?:string):Promise<ICommon_Route_Res_Calendar_ListEvent_Item[]> {
        if(!organizationUserId) {
            throw Err.Organization.userNotFound
        }
        let startStr:string,endStr:string
        if(start) {
            startStr=moment(start).format("YYYY-MM-DD HH:mm")
        }
        if(end) {
            endStr=moment(end).format("YYYY-MM-DD HH:mm")
        }
        let mysql=getMysqlInstance()
        let arrPromise=[
            Promise.resolve(generateLeftJoinSql({
                model:calendarEventModel,
                columns:["name","id","start_time","end_time","reminder_minutes","all_day","created_by"]
            },{
                model:calendarModel,
                columns:["color","id","name"],
                rename:{
                    fields:["id","name"],
                    newFields:["calendarId","calendarName"]
                },
                expression:{
                    id:{
                        model:calendarEventModel,
                        field:"calendar_id"
                    }
                }
            },{
                "$and0":{
                    ...(startStr && {
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:"<=",
                                value:startStr
                            }
                        }
                    }),
                    ...(endStr && {
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: ">",
                                value:startStr
                            }
                        }
                    }),
                    ...(calendarId && {
                        calendar_id: {
                            model:calendarEventModel,
                            value:calendarId
                        }
                    }),
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    },
                    created_by:{
                        model:calendarEventModel,
                        value:organizationUserId
                    },
                    ...(keyword && {
                        name:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:keyword
                            }
                        }
                    }),
                    ...(location && {
                        location:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:location
                            }
                        }
                    })
                },
                "$and1":{
                    ...(startStr && {
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:"<=",
                                value:endStr
                            }
                        }
                    }),
                    ...(endStr && {
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: ">",
                                value:endStr
                            }
                        }
                    }),
                    ...(calendarId && {
                        calendar_id: {
                            model:calendarEventModel,
                            value:calendarId
                        }
                    }),
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    },
                    created_by:{
                        model:calendarEventModel,
                        value:organizationUserId
                    },
                    ...(keyword && {
                        name:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:keyword
                            }
                        }
                    }),
                    ...(location && {
                        location:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:location
                            }
                        }
                    })
                },
                "$and2":{
                    ...(startStr && {
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:">=",
                                value:startStr
                            }
                        }
                    }),
                    ...(endStr && {
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: "<=",
                                value:endStr
                            }
                        }
                    }),
                    ...(calendarId && {
                        calendar_id: {
                            model:calendarEventModel,
                            value:calendarId
                        }
                    }),
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    },
                    created_by:{
                        model:calendarEventModel,
                        value:organizationUserId
                    },
                    ...(keyword && {
                        name:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:keyword
                            }
                        }
                    }),
                    ...(location && {
                        location:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:location
                            }
                        }
                    })
                }
            },"or")).then(sql=>{
                return mysql.execute(sql)
            }).then(arr=>{
                let ret:ICommon_Route_Res_Calendar_ListEvent_Item[]=[]
                for(let obj of arr) {
                    ret.push({
                        name:obj.name,
                        color:obj.color,
                        id:obj.id,
                        start_time:obj.start_time,
                        end_time:obj.end_time,
                        calendar:{
                            id:obj.calendarId,
                            name:obj.calendarName
                        },
                        all_day:obj.all_day,
                        reminder_minutes:obj.reminder_minutes,
                        created_by:obj.created_by
                    })
                }
                return ret;
            }),
            Promise.resolve(generateLeftJoinSql({
                model: calendarEventModel,
                columns: ["name", "id", "start_time", "end_time", "recurring", "recurring_day","all_day","reminder_minutes","created_by"]
            }, {
                model: calendarModel,
                columns:["color","id","name"],
                rename:{
                    fields:["id","name"],
                    newFields:["calendarId","calendarName"]
                },
                expression: {
                    id: {
                        model: calendarEventModel,
                        field: "calendar_id"
                    }
                }
            }, {
                ...(calendarId && {
                    calendar_id: {
                        model: calendarEventModel,
                        value: calendarId
                    }
                }),
                recurring: {
                    model: calendarEventModel,
                    value: {
                        exp: "<>",
                        value: ECommon_Calendar_Recurring_Type.NONE
                    }
                },
                ...(startStr && {
                    start_time: {
                        model: calendarEventModel,
                        value: {
                            exp: "<=",
                            value: endStr
                        }
                    }
                }),
                created_by:{
                    model:calendarEventModel,
                    value:organizationUserId
                },
                ...(keyword && {
                    name:{
                        model:calendarEventModel,
                        value:{
                            exp:"%like%",
                            value:keyword
                        }
                    }
                }),
                ...(location && {
                    location:{
                        model:calendarEventModel,
                        value:{
                            exp:"%like%",
                            value:location
                        }
                    }
                })
            }, "and")).then(sql=>{
                return mysql.execute(sql)
            }).then(arr => {
                let ret:ICommon_Route_Res_Calendar_ListEvent_Item[]=[]
                for(let obj of arr) {
                    let objStart=moment(start)
                    let objEnd=moment(end)
                    let objStartTime=moment(obj.start_time)
                    let objEndTime=moment(obj.end_time)
                    while (objStart.isSameOrBefore(objEnd,"days")) {
                        let isMatch=calendarEventMapper.checkRecurringEvent(obj.recurring,obj.recurring_day,obj.start_time,objStart)
                        if(isMatch) {
                            let offsetDay=objStart.diff(objStartTime.clone().startOf("days"),"days")
                            ret.push({
                                name:obj.name,
                                color:obj.color,
                                id:obj.id,
                                start_time:objStartTime.clone().add(offsetDay,"days").toDate(),
                                end_time:objEndTime.clone().add(offsetDay,"days").toDate(),
                                calendar:{
                                    id:obj.calendarId,
                                    name:obj.calendarName
                                },
                                all_day:obj.all_day,
                                reminder_minutes:obj.reminder_minutes,
                                created_by:obj.created_by
                            })
                        }
                        objStart.add(1,"days")
                    }
                }
                return ret;
            }),
            Promise.resolve(generateLeftJoin2Sql({
                model:calendarEventModel,
                columns:["name","id","start_time","end_time","reminder_minutes","all_day","created_by"]
            },{
                model:calendarModel,
                columns:["color","id","name"],
                rename:{
                    fields:["id","name"],
                    newFields:["calendarId","calendarName"]
                },
                expression:{
                    id:{
                        model:calendarEventModel,
                        field:"calendar_id"
                    }
                }
            },{
                model:calendarEventGuestModel,
                expression:{
                    calendar_event_id:{
                        model:calendarEventModel,
                        field:"id"
                    }
                }
            },{
                "$and0":{
                    ...(startStr && {
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:"<=",
                                value:startStr
                            }
                        }
                    }),
                    ...(endStr && {
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: ">",
                                value:startStr
                            }
                        }
                    }),
                    organization_user_id: {
                        model:calendarEventGuestModel,
                        value:organizationUserId
                    },
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    },
                    ...(keyword && {
                        name:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:keyword
                            }
                        }
                    }),
                    ...(location && {
                        location:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:location
                            }
                        }
                    })
                },
                "$and1":{
                    ...(startStr && {
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:"<=",
                                value:endStr
                            }
                        }
                    }),
                    ...(endStr && {
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: ">",
                                value:endStr
                            }
                        }
                    }),
                    organization_user_id: {
                        model:calendarEventGuestModel,
                        value:organizationUserId
                    },
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    },
                    ...(keyword && {
                        name:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:keyword
                            }
                        }
                    }),
                    ...(location && {
                        location:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:location
                            }
                        }
                    })
                },
                "$and2":{
                    ...(startStr && {
                        start_time:{
                            model:calendarEventModel,
                            value:{
                                exp:">=",
                                value:startStr
                            }
                        }
                    }),
                    ...(endStr && {
                        end_time:{
                            model:calendarEventModel,
                            value:{
                                exp: "<=",
                                value:endStr
                            }
                        }
                    }),
                    organization_user_id: {
                        model:calendarEventGuestModel,
                        value:organizationUserId
                    },
                    recurring:{
                        model:calendarEventModel,
                        value:ECommon_Calendar_Recurring_Type.NONE
                    },
                    ...(keyword && {
                        name:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:keyword
                            }
                        }
                    }),
                    ...(location && {
                        location:{
                            model:calendarEventModel,
                            value:{
                                exp:"%like%",
                                value:location
                            }
                        }
                    })
                }
            },"or")).then(sql=>{
                return mysql.execute(sql)
            }).then(arr=>{
                let ret:ICommon_Route_Res_Calendar_ListEvent_Item[]=[]
                for(let obj of arr) {
                    ret.push({
                        name:obj.name,
                        color:obj.color,
                        id:obj.id,
                        start_time:obj.start_time,
                        end_time:obj.end_time,
                        calendar:{
                            id:obj.calendarId,
                            name:obj.calendarName
                        },
                        all_day:obj.all_day,
                        reminder_minutes:obj.reminder_minutes,
                        created_by:obj.created_by
                    })
                }
                return ret;
            }),
            Promise.resolve(generateLeftJoin2Sql({
                model: calendarEventModel,
                columns: ["name", "id", "start_time", "end_time", "recurring", "recurring_day","reminder_minutes","all_day","created_by"]
            }, {
                model: calendarModel,
                columns:["color","id","name"],
                rename:{
                    fields:["id","name"],
                    newFields:["calendarId","calendarName"]
                },
                expression: {
                    id: {
                        model: calendarEventModel,
                        field: "calendar_id"
                    }
                }
            },{
                model:calendarEventGuestModel,
                expression:{
                    calendar_event_id:{
                        model:calendarEventModel,
                        field:"id"
                    }
                }
            }, {
                ...(calendarId && {
                    calendar_id: {
                        model: calendarEventModel,
                        value: calendarId
                    }
                }),
                recurring: {
                    model: calendarEventModel,
                    value: {
                        exp: "<>",
                        value: ECommon_Calendar_Recurring_Type.NONE
                    }
                },
                ...(startStr && {
                    start_time: {
                        model: calendarEventModel,
                        value: {
                            exp: "<=",
                            value: endStr
                        }
                    }
                }),
                organization_user_id:{
                    model:calendarEventGuestModel,
                    value:organizationUserId
                },
                ...(keyword && {
                    name:{
                        model:calendarEventModel,
                        value:{
                            exp:"%like%",
                            value:keyword
                        }
                    }
                }),
                ...(location && {
                    location:{
                        model:calendarEventModel,
                        value:{
                            exp:"%like%",
                            value:location
                        }
                    }
                })
            }, "and")).then(sql=>{
                return mysql.execute(sql)
            }).then(arr => {
                let ret:ICommon_Route_Res_Calendar_ListEvent_Item[]=[]
                for(let obj of arr) {
                    let objStart=moment(start)
                    let objEnd=moment(end)
                    let objStartTime=moment(obj.start_time)
                    let objEndTime=moment(obj.end_time)
                    while (objStart.isSameOrBefore(objEnd,"days")) {
                        let isMatch=calendarEventMapper.checkRecurringEvent(obj.recurring,obj.recurring_day,obj.start_time,objStart)
                        if(isMatch) {
                            let offsetDay=objStart.diff(objStartTime.clone().startOf("days"),"days")
                            ret.push({
                                name:obj.name,
                                color:obj.color,
                                id:obj.id,
                                start_time:objStartTime.clone().add(offsetDay,"days").toDate(),
                                end_time:objEndTime.clone().add(offsetDay,"days").toDate(),
                                calendar:{
                                    id:obj.calendarId,
                                    name:obj.calendarName
                                },
                                all_day:obj.all_day,
                                reminder_minutes:obj.reminder_minutes,
                                created_by:obj.created_by
                            })
                        }
                        objStart.add(1,"days")
                    }
                }
                return ret;
            })
        ]
        let [arr1,arr2,arr3,arr4]=await Promise.all(arrPromise)
        return [...arr1,...arr2,...arr3,...arr4]
    }
}

export const calendarEventMapper=new CalendarEventMapper

class CalendarSettingMapper extends Mapper<typeof calendarSettingModel> {
    constructor() {
        super(calendarSettingModel)
    }
}

export const calendarSettingMapper=new CalendarSettingMapper
