<template>
  <a-form ref="formEle" :model="form" label-align="left" auto-label-width size="small">
    <a-form-item field="name" required hide-asterisk>
      <template #label>
        <icon-info-circle style="font-size: medium"></icon-info-circle>
      </template>
      <a-input placeholder="New Event Title" v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item field="date" required hide-asterisk>
      <template #label>
        <icon-clock-circle style="font-size: medium"></icon-clock-circle>
      </template>
      <CalendarEventDateEdit :timezone="timezone" :data="form.date"></CalendarEventDateEdit>
    </a-form-item>
    <a-form-item>
      <a-divider orientation="left" :margin="1">Advanced</a-divider>
    </a-form-item>
    <a-form-item field="location">
      <template #label>
        <icon-location style="font-size: medium"></icon-location>
      </template>
      <a-input placeholder="location" v-model="form.location"></a-input>
    </a-form-item>
    <a-form-item field="reminder">
      <template #label>
        <icon-notification style="font-size: medium"></icon-notification>
      </template>
      <a-select v-model="form.reminder">
        <a-option :value="0">No Reminder</a-option>
        <a-option :value="5">5 Min Before</a-option>
        <a-option :value="15">15 Min Before</a-option>
        <a-option :value="30">30 Min Before</a-option>
        <a-option :value="60">1 Hour Before</a-option>
        <a-option :value="600">6 Hour Before</a-option>
      </a-select>
    </a-form-item>
    <a-form-item field="calendarId" required hide-asterisk :disabled="type=='edit'">
      <template #label>
        <icon-calendar style="font-size: medium"></icon-calendar>
      </template>
      <a-select v-model="form.calendarId">
        <a-option v-for="item in resourceList" :value="item.id" :label="item.name"></a-option>
      </a-select>
    </a-form-item>
    <a-form-item field="guestList">
      <template #label>
        <icon-user-add style="font-size: medium"></icon-user-add>
      </template>
      <CalendarEventGuestEdit :value="form.guestList"></CalendarEventGuestEdit>
    </a-form-item>
    <a-form-item field="agenda">
      <template #label>
        <icon-edit style="font-size: medium"></icon-edit>
      </template>
      <a-textarea placeholder="Event Detail" v-model="form.agenda"></a-textarea>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import CalendarEventDateEdit, {CalendarEventModelType} from "./calendarEventDateEdit.vue";
import {onBeforeMount, reactive, ref} from "vue";
import {apiCalendar, DCSType} from "../../../common/request/request";
import {ICommon_Route_Res_Calendar_Event_Info} from "../../../../../../common/routes/response";
import moment from "moment";
import {ECommon_Calendar_Recurring_Type} from "../../../../../../common/model/calendar_event";
import CalendarEventGuestEdit from "./calendarEventGuestEdit.vue";
import {onDialogOk} from "../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../common/util/helper";
import {Message} from "@arco-design/web-vue";

const props=defineProps<{
  type:"add"|"edit",
  calendarEventId?:string,
  name?:string,
  date?:CalendarEventModelType,
  resourceList:{
    id:string,
    name:string
  }[],
	timezone:string
}>()
const formEle=ref()
const calendarEventInfo=ref<DCSType<ICommon_Route_Res_Calendar_Event_Info>>()
const form=reactive<{
  name:string,
  date:CalendarEventModelType,
  location:string,
  reminder:number,
  calendarId:string,
  agenda:string,
  guestList:DCSType<ICommon_Route_Res_Calendar_Event_Info["guestList"]>
}>({
  date:{},
  guestList:[]
} as any)
const getCalendarEventInfo=async ()=>{
  let res=await apiCalendar.getCalendarEvent({
    calendarEventId:props.calendarEventId
  })
  if(res?.code==0) {
    calendarEventInfo.value=res.data
  }
}
onBeforeMount(async ()=>{
  if(props.type=="edit") {
    await getCalendarEventInfo()
    form.name=calendarEventInfo.value.name
    form.date.start=moment(calendarEventInfo.value.start_time).toDate().getTime()
    form.date.end=moment(calendarEventInfo.value.end_time).toDate().getTime()
    form.date.isAllDay=calendarEventInfo.value.all_day
    form.date.recurring=calendarEventInfo.value.recurring
    form.date.recurring_day=calendarEventInfo.value.recurring_day
    form.reminder=calendarEventInfo.value.reminder_minutes??0
    form.location=calendarEventInfo.value.location
    form.agenda=calendarEventInfo.value.agenda
    form.guestList=calendarEventInfo.value.guestList
    form.calendarId=calendarEventInfo.value.calendar_id
  } else {
    form.name=props.name??""
    form.date.start=props.date?.start??moment().toDate().getTime()
    form.date.end=props.date?.end??moment().add(1,"hour").toDate().getTime()
    form.date.isAllDay=props.date?.isAllDay??0
    form.date.recurring=props.date?.recurring??ECommon_Calendar_Recurring_Type.NONE
    form.date.recurring_day=props.date?.recurring_day
    form.reminder=0
    form.location=""
    form.agenda=""
    form.guestList=[]
    form.calendarId=props.resourceList[0].id
  }
})
onDialogOk(dialogFuncGenerator({
  form:()=>formEle.value,
  func:()=>{
    if(form.date.end<form.date.start) {
      Message.error("end date can't less than start date")
      return false
    }
    return props.type=="edit"?apiCalendar.editCalendarEvent({
      calendarEventId:props.calendarEventId,
      name:form.name,
      startTime:form.date.start,
      endTime:form.date.end,
      all_day:form.date.isAllDay,
      recurring:form.date.recurring,
      recurring_day:form.date.recurring_day,
      agenda:form.agenda,
      location:form.location,
      reminder_minutes:form.reminder===0?null:form.reminder,
      guestList:form.guestList.map(item=>item.organizationUserId)
    }):apiCalendar.addCalendarEvent({
      calendarId:form.calendarId,
      name:form.name,
      startTime:form.date.start,
      endTime:form.date.end,
      all_day:form.date.isAllDay,
      recurring:form.date.recurring,
      recurring_day:form.date.recurring_day,
      agenda:form.agenda,
      location:form.location,
      reminder_minutes:form.reminder===0?null:form.reminder,
      guestList:form.guestList.map(item=>item.organizationUserId)
    })
  }
}))
</script>

<style scoped>

</style>