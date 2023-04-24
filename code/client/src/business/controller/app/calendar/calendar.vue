<template>
  <a-layout style="height: 100%">
    <a-layout-sider style="width: 260px">
      <div style="padding: 10px;">
        <a-date-picker
            v-model="pickerValue"
            hide-trigger
            style="border: 0px;box-shadow: 0px 0px 0px transparent"
            :show-now-btn="false"
            :day-start-of-week="setting?.start_week_day??0"
        />
        <a-divider :margin="1"></a-divider>
        <a-row style="display: flex;justify-content: space-between;margin-top: 10px;align-items: center">
          <span style="font-size: small;color: gray">My Calendars</span>
          <a-button size="mini" type="text" @click="onAddCalendar">
            <template #icon>
              <icon-plus style="color: gray"></icon-plus>
            </template>
          </a-button>
        </a-row>
        <a-checkbox-group direction="vertical" v-model="selectedCalendar">
          <a-checkbox v-for="item in calendarList" :value="item.id" @mouseenter="$event.currentTarget.querySelector('[name=\'setting\']').style.visibility='visible'" @mouseleave="$event.currentTarget.querySelector('[name=\'setting\']').style.visibility='hidden'">
            <span :style="{color:item.color}">{{item.name}}</span>&nbsp;&nbsp;
            <div size="mini" name="setting" style="visibility: hidden;display: inline-block">
              <a-button type="text" size="mini" @click="onEditCalendar(item)">
                <template #icon>
                  <icon-edit style="color: gray"></icon-edit>
                </template>
              </a-button>
              <a-button type="text" size="mini" @click="onDeleteCalendar(item)">
                <template #icon>
                  <icon-delete style="color: gray"></icon-delete>
                </template>
              </a-button>
            </div>
          </a-checkbox>
        </a-checkbox-group>
      </div>
    </a-layout-sider>
    <a-layout-content style="flex-direction: column;display: flex;padding: 10px;">
      <a-row style="flex: 0 0 40px;display: flex;justify-content: space-between;justify-items: center">
        <a-space size="mini">
          <a-button type="primary" size="mini" @click="onToday">Today</a-button>
          <a-button type="text" @click="onPrevious">
            <template #icon>
              <icon-left style="color: rgb(95,99,104);font-size: large"></icon-left>
            </template>
          </a-button>
          <a-button type="text" @click="onNext">
            <template #icon>
              <icon-right style="color: rgb(95,99,104);font-size: large"></icon-right>
            </template>
          </a-button>
          <span style="font-weight: bold">
            {{calendarType=="day"?moment(pickerValue).format("YYYY-MM-DD"):moment(pickerValue).format("YYYY-MM")}}
          </span>
        </a-space>
        <a-space size="mini">
          <a-radio-group type="button" v-model="calendarType" size="small">
            <a-radio value="day">Day</a-radio>
            <a-radio value="week">Week</a-radio>
            <a-radio value="month">Month</a-radio>
          </a-radio-group>
          <a-button type="text" @click="onShowSetting">
            <template #icon>
              <icon-settings style="color: gray;font-size: large"></icon-settings>
            </template>
          </a-button>
        </a-space>
      </a-row>
      <a-row style="flex: 1 1 auto;border-top: 1px solid lightgray;overflow-y: auto;position: relative">
        <Calendar :mode="calendarType=='month'?'month':'day'" :start-date="startDay" :end-date="endDay" :month="month" :utc-offset="timezoneOffset" :event-list="calendarEventList" @blank-click="onAddCalendarEvent" @delete-event="onDeleteCalendarEvent" @change-event-date="onChangeCalendarEventDate" @edit-event="onEditCalendarEvent"></Calendar>
      </a-row>
    </a-layout-content>
    <a-drawer :popup-container="root" :visible="settingVisible" @ok="onSetting" unmount-on-close title="Calendar Global Setting" :closable="false" @cancel="settingVisible=false" :width="400">
      <a-form :model="{}" layout="vertical">
        <a-form-item label="follow device timezone">
          <a-switch v-model="settingEdit.followDevice"></a-switch>
        </a-form-item>
        <a-form-item label="timezone" v-if="!settingEdit.followDevice">
          <a-select v-model="settingEdit.timezone">
            <a-option v-for="item in timezones" :value="item.id">{{item.label}}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="start week day">
          <a-select v-model="settingEdit.start_week_day">
            <a-option v-for="item in ECommon_Calendar_WeekDay" :value="item">{{calendarWeekDayName[item]}}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-drawer>
    <CalendarEventAddSimple style="position: absolute" v-if="isCalendarEventAddSimple" :style="{left:calendarEventAddSimpleLeft,top:calendarEventAddSimpleTop}" :start="calendarEventAddSimpleStartDate" ref="eventAddSimpleEle" @close="isCalendarEventAddSimple=false" @save="saveCalendarEvent" :resource-list="calendarList.map(item=>({id:item.id,name:item.name})).filter(item=>selectedCalendar.includes(item.id))" @more="onShowCalendarEventDetail"></CalendarEventAddSimple>
  </a-layout>
</template>

<script setup lang="ts">
import {computed, getCurrentInstance, markRaw, nextTick, onBeforeMount, ref, watch} from "vue";
import moment from "moment";
import "moment-timezone"
import {
    calendarWeekDayName,
    ECommon_Calendar_WeekDay,
    ICommon_Model_Calendar_Setting
} from "../../../../../../common/model/calendar_setting";
import {apiCalendar, DCSType} from "../../../common/request/request";
import {ICommon_Model_Calendar} from "../../../../../../common/model/calendar";
import {Dialog} from "../../../common/component/dialog/dialog";
import {getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import CalendarEdit from "./calendarEdit.vue";
import {Message} from "@arco-design/web-vue";
import Calendar from "../../../common/component/calendar/calendar.vue"
import CalendarEventAddSimple from "./calendarEventAddSimple.vue";
import {CalendarEventModelType} from "./calendarEventDateEdit.vue";
import {IClient_Calendar_Date, IClient_Calendar_Info} from "../../../common/component/calendar/type";
import {ECommon_Calendar_Recurring_Type} from "../../../../../../common/model/calendar_event";
import CalendarEventEdit from "./calendarEventEdit.vue";

const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const isCalendarEventAddSimple=ref(false)
const calendarEventAddSimpleLeft=ref("0px")
const calendarEventAddSimpleTop=ref("0px")
const calendarEventAddSimpleStartDate=ref<moment.Moment>()
const pickerValue=ref(moment().format("YYYY-MM-DD"))
const selectedCalendar=ref<string[]>([])
const setting=ref<ICommon_Model_Calendar_Setting & {
  followDevice:boolean
}>()
const settingEdit=ref<ICommon_Model_Calendar_Setting & {
  followDevice:boolean
}>()
const eventAddSimpleEle=ref<InstanceType<typeof CalendarEventAddSimple>>()
const calendarList=ref<DCSType<ICommon_Model_Calendar>[]>([])
const calendarType=ref<"week"|"day"|"month">("week")
const settingVisible=ref(false)
const timezoneOffset=ref(0)
const calendarEventList=ref<IClient_Calendar_Info[]>([])
const startDay=computed(()=>{
  let start_week_day=setting.value?.start_week_day
  if(calendarType.value=="day" && start_week_day!==undefined) {
    let ret=moment(pickerValue.value).format("YYYY-MM-DD")
    return ret;
  } else {
    let ret=moment(pickerValue.value).startOf("weeks").format("YYYY-MM-DD")
    return ret;
  }

})
const endDay=computed(()=>{
  let start_week_day=setting.value?.start_week_day
  if(calendarType.value=="day" && start_week_day!==undefined) {
    return moment(pickerValue.value).format("YYYY-MM-DD")
  } else {
    return moment(pickerValue.value).endOf("weeks").format("YYYY-MM-DD")
  }
})
watch([selectedCalendar,calendarType,pickerValue,timezoneOffset],()=>{
  listCalendarEvent()
})
const month=computed(()=>{
  return moment(pickerValue.value).format("YYYY-MM")
})
const getSetting=async ()=>{
  let res=await apiCalendar.getCalendarSetting()
  if(res?.code==0) {
    setting.value={
      ...res.data,
      followDevice:res.data.timezone?false:true
    }
    if(setting.value.followDevice) {
      setting.value.timezone=moment.tz.guess()
    }
    moment.tz.setDefault(setting.value.timezone)
    timezoneOffset.value=moment.tz(setting.value.timezone).utcOffset()/60
    moment.updateLocale("en",{
      week:{
        dow:setting.value.start_week_day
      }
    })
  }
}
const timezones=ref(moment.tz.names().map(item=>{
  return {
    label:"(GMT"+moment.tz(item).format('Z')+") " + item,
    value:moment.tz(item).utcOffset(),
    id:item
  }
}).filter(item=>{
  if(!item.id.startsWith("Etc/") && !item.id.startsWith("GMT")) {
    return true
  } else {
    return false
  }
}).sort((a, b) => {
  if(a.value>b.value) {
    return 1
  } else {
    return -1
  }
}))
const listCalendar=async ()=>{
  let res=await apiCalendar.listCalendar()
  if(res?.code==0) {
    calendarList.value=[...res.data.filter(item=>{
      return item.reserved
    }),...res.data.filter(item=>{
      return !item.reserved
    }).sort((a, b) => {
      if(a<b) {
        return -1
      } else {
        return 1
      }
    })]
    selectedCalendar.value=calendarList.value.filter(item=>{
      return item.reserved
    }).map(item=>item.id)
  }
}
const onAddCalendar=async ()=>{
  let ret=await Dialog.open(root.value,appContext,"Add Calendar",markRaw(CalendarEdit),{
    type:"add"
  })
  if(ret) {
    listCalendar()
  }
}
const onEditCalendar=async (item)=>{
  let ret=await Dialog.open(root.value,appContext,"Edit Calendar",markRaw(CalendarEdit),{
    type:"edit",
    item
  })
  if(ret) {
    listCalendar()
  }
}
const onDeleteCalendar=async (item)=>{
  let ret=await Dialog.confirm(root.value,appContext,"do you want to delete this calendar?")
  if(ret) {
    let res=await apiCalendar.removeCalendar({
      calendarId:item.id
    })
    if(res?.code==0) {
      Message.success("delete success")
      if(selectedCalendar.value.includes(item.id)) {
        selectedCalendar.value=selectedCalendar.value.splice(selectedCalendar.value.indexOf(item.id),1)
      }
      listCalendar()
    } else {
      Message.error(res.msg)
    }
  }
}
const onSetting=async ()=>{
  let res=await apiCalendar.editCalendarSetting({
    timezone:settingEdit.value.followDevice?"":settingEdit.value.timezone,
    startWeekDay:settingEdit.value.start_week_day
  })
  if(res?.code==0) {
    Message.success("update success")
    settingVisible.value=false
    getSetting()
  }
}
const onPrevious=()=>{
  if(calendarType.value=="day") {
    pickerValue.value=moment(pickerValue.value).add(-1,"days").format("YYYY-MM-DD")
  } else if(calendarType.value=="week") {
    pickerValue.value=moment(pickerValue.value).add(-1,"weeks").format("YYYY-MM-DD")
  } else if(calendarType.value=="month") {
    pickerValue.value=moment(pickerValue.value).add(-1,"months").format("YYYY-MM-DD")
  }
}
const onNext=()=>{
  if(calendarType.value=="day") {
    pickerValue.value=moment(pickerValue.value).add(1,"days").format("YYYY-MM-DD")
  } else if(calendarType.value=="week") {
    pickerValue.value=moment(pickerValue.value).add(1,"weeks").format("YYYY-MM-DD")
  } else if(calendarType.value=="month") {
    pickerValue.value=moment(pickerValue.value).add(1,"months").format("YYYY-MM-DD")
  }
}
const onToday=()=>{
  pickerValue.value=moment().format("YYYY-MM-DD")
}
const onShowSetting=async ()=>{
  settingVisible.value=true
  settingEdit.value={
    ...setting.value
  }
}
const onAddCalendarEvent=async (date:moment.Moment, point:{
  x:number,
  y:number
})=>{
  if(isCalendarEventAddSimple.value) {
    isCalendarEventAddSimple.value=false
  } else {
    isCalendarEventAddSimple.value=true
    let rect=root.value.getBoundingClientRect()
    let offsetLeft=point.x-rect.left
    if(offsetLeft>410) {
      calendarEventAddSimpleLeft.value=offsetLeft-5-400+"px"
    } else {
      calendarEventAddSimpleLeft.value=offsetLeft+5+"px"
    }
    let offsetTop=point.y-rect.top
    if(offsetTop>360) {
      calendarEventAddSimpleTop.value=offsetTop-5-350+"px"
    } else {
      calendarEventAddSimpleTop.value=offsetTop+5+"px"
    }
    calendarEventAddSimpleStartDate.value=date
    nextTick(()=>{
      eventAddSimpleEle.value.$el.focus()
    })
  }
}
const saveCalendarEvent=async (title:string, dateInfo:CalendarEventModelType, calendarId:string)=>{
  if(dateInfo.end<dateInfo.start) {
    Message.error("end date can't less than start date")
    return
  }
  let res=await apiCalendar.addCalendarEvent({
    calendarId,
    name:title,
    startTime:dateInfo.start,
    endTime:dateInfo.end,
    all_day:dateInfo.isAllDay,
    recurring:dateInfo.recurring,
    recurring_day:dateInfo.recurring_day
  })
  if(res?.code==0) {
    listCalendarEvent()
    isCalendarEventAddSimple.value=false
  }
}

const listCalendarEvent=async ()=>{
  calendarEventList.value=[]
  if(selectedCalendar.value.length>0) {
    let start:number,end:number
    if(calendarType.value=="day" || calendarType.value=="week") {
      start=moment(startDay.value).set({
        hour:0,
        minute:0,
        second:0
      }).toDate().getTime()
      end=moment(endDay.value).set({
        hour:23,
        minute:59,
        second:59
      }).toDate().getTime()
    } else {
      start=moment(month.value).startOf("month").startOf("week").toDate().getTime()
      end=moment(month.value).endOf("month").endOf("week").toDate().getTime()
    }
    let arrPromise=selectedCalendar.value.map(item=>{
      return apiCalendar.listCalendarEvent({
        calendarId:item,
        start,
        end
      })
    })
    let arr=await Promise.all(arrPromise)
    for(let res of arr) {
      if(res?.code==0) {
        calendarEventList.value=calendarEventList.value.concat(res.data.map(item=>{
          let objStart=moment(item.start_time)
          let objEnd=moment(item.end_time)
          return {
            id:item.id,
            resource:{
              id:item.calendar.id,
              name:item.calendar.name
            },
            reminder:item.reminder_minutes,
            isAllDay:!!item.all_day,
            color:item.color,
            startDate:{
              year:objStart.year(),
              month:objStart.month()+1,
              day:objStart.date(),
              hour:objStart.hour(),
              minute:objStart.minute()
            },
            endDate:{
              year:objEnd.year(),
              month:objEnd.month()+1,
              day:objEnd.date(),
              hour:objEnd.hour(),
              minute:objEnd.minute()
            },
            name:item.name
          }
        }))
      }
    }
  }
}
const onDeleteCalendarEvent=async (event:IClient_Calendar_Info)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to delete this event?")
  if(ret) {
    let res=await apiCalendar.removeCalendarEvent({
      calendarEventId:event.id
    })
    if(res?.code==0) {
      Message.success("delete success")
      listCalendarEvent()
    }
  }
}
const onChangeCalendarEventDate=async (event:IClient_Calendar_Info, originalDateRange:{
  start:IClient_Calendar_Date,
  end:IClient_Calendar_Date
}, type:"resize"|"move")=>{
  let res=await apiCalendar.editCalendarEvent({
    calendarEventId:event.id,
    startTime:momentFromCalendarInfoDate(event.startDate).toDate().getTime(),
    endTime:momentFromCalendarInfoDate(event.endDate).toDate().getTime()
  })
  if(res?.code==0) {
    if(res.data.recurring!==ECommon_Calendar_Recurring_Type.NONE) {
      listCalendarEvent()
    }
  }
}
const onEditCalendarEvent=async (event:IClient_Calendar_Info)=>{
  let ret=await Dialog.open(root.value,appContext,"Edit Event",markRaw(CalendarEventEdit),{
    type:"edit",
    calendarEventId:event.id,
    resourceList:calendarList.value.map(item=>({id:item.id,name:item.name})).filter(item=>selectedCalendar.value.includes(item.id))
  })
  if(ret) {
    listCalendarEvent()
  }
}
const onShowCalendarEventDetail=async (title:string,dateInfo:CalendarEventModelType,calendarId:string)=>{
  isCalendarEventAddSimple.value=false
  let ret=await Dialog.open(root.value,appContext,"Add Event",markRaw(CalendarEventEdit),{
    type:"add",
    calendarId:calendarId,
    resourceList:calendarList.value.map(item=>({id:item.id,name:item.name})).filter(item=>selectedCalendar.value.includes(item.id)),
    name:title,
    date:dateInfo,
  })
  if(ret) {
    listCalendarEvent()
  }
}
const momentFromCalendarInfoDate=(date:IClient_Calendar_Date)=>{
  let obj=moment({
    year:date.year,
    month:date.month-1,
    date:date.day,
    hour:date.hour,
    minute:date.minute
  })
  return obj;
}
onBeforeMount(()=>{
  getSetting()
  listCalendar()
})
</script>

<style scoped>

</style>