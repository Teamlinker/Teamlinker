<template>
  <a-row>
    <a-row style="height: 40px">
      <a-space size="mini">
        <a-date-picker v-model="startDate" style="width: 130px;margin-right: 10px" @change="onChangeStart"></a-date-picker>
        <a-time-picker v-model="startTime" format="HH:mm" style="width: 130px;margin-right: 10px" @change="onChangeStart" v-if="!data.isAllDay"></a-time-picker>
      </a-space>
    </a-row>
    <a-row  style="height: 40px">
      <a-space size="mini">
        <a-date-picker v-model="endDate" style="width: 130px;margin-right: 10px" @change="onChangeEnd"></a-date-picker>
        <a-time-picker v-model="endTime" format="HH:mm" style="width: 130px" @change="onChangeEnd" v-if="!data.isAllDay"></a-time-picker>
      </a-space>
    </a-row>
    <a-row style="height: 40px">
      <a-space wrap>
        {{$t("controller.app.calendar.calendarEventDateEdit.allDay")}}:
        <a-switch :checked-value="1" :unchecked-value="0" v-model="data.isAllDay" size="small" @change="onChangeAllDay"></a-switch>
        {{$t("controller.app.calendar.calendarEventDateEdit.repeat")}}:
        <a-select style="width: 110px" size="small" v-model="data.recurring">
          <a-option :value="ECommon_Calendar_Recurring_Type.NONE">{{$t("util.none")}}</a-option>
          <a-option :value="ECommon_Calendar_Recurring_Type.DAY">{{$t("controller.app.calendar.calendar.day")}}</a-option>
          <a-option :value="ECommon_Calendar_Recurring_Type.WORKDAY">{{$t("util.workDay")}}</a-option>
          <a-option :value="ECommon_Calendar_Recurring_Type.WEEK">{{$t("controller.app.calendar.calendar.week")}}</a-option>
          <a-option :value="ECommon_Calendar_Recurring_Type.MONTH">{{$t("controller.app.calendar.calendar.month")}}</a-option>
        </a-select>
        <template v-if="data.recurring===ECommon_Calendar_Recurring_Type.WEEK">
	        {{$t("controller.app.calendar.calendarEventDateEdit.selectWeekday")}}:
          <a-select size="small" style="width: 130px" v-model="recurryingWeekDay" @change="onChangeRecurry">
            <a-option v-for="item in ECommon_Calendar_WeekDay" :value="item">{{calendarWeekDayName[item]?$t("util."+calendarWeekDayName[item].toLowerCase()):undefined}}</a-option>
          </a-select>
        </template>
        <template v-else-if="data.recurring===ECommon_Calendar_Recurring_Type.MONTH">
	        {{$t("controller.app.calendar.calendarEventDateEdit.inputDay")}}:
          <a-input-number :min="1" :max="31" v-model="recurryingMonthDay" style="width: 100px" @change="onChangeRecurry" size="small"></a-input-number>
        </template>

      </a-space>
    </a-row>
  </a-row>
</template>

<script setup lang="ts">
import {ECommon_Calendar_Recurring_Type} from "../../../../../../common/model/calendar_event";
import {ref, watch} from "vue";
import moment from "moment";
import "moment-timezone"
import {calendarWeekDayName, ECommon_Calendar_WeekDay} from "../../../../../../common/model/calendar_setting";

export type CalendarEventModelType ={
  start:number,
  end:number,
  isAllDay:number,
  recurring:ECommon_Calendar_Recurring_Type,
  recurring_day?:number
}
const props=defineProps<{
  data:CalendarEventModelType,
	timezone:string
}>()
const recurryingWeekDay=ref<number>()
const recurryingMonthDay=ref<number>()

const startDate=ref<string>("")
const endDate=ref<string>("")
const startTime=ref<number|string>("")
const endTime=ref<number|string>("")
watch(()=>[props.data.start,props.data.end],()=>{
  startDate.value=moment(props.data.start).tz(props.timezone).format("YYYY-MM-DD")
  endDate.value=moment(props.data.end).tz(props.timezone).format("YYYY-MM-DD")
  startTime.value=moment(props.data.start).tz(props.timezone).format("HH:mm")
  endTime.value=moment(props.data.end).tz(props.timezone).format("HH:mm")
},{
	immediate:true
})
watch(()=>props.data.recurring,()=>{
  if(props.data.recurring===ECommon_Calendar_Recurring_Type.WEEK || props.data.recurring===ECommon_Calendar_Recurring_Type.MONTH) {
    if(props.data.recurring===ECommon_Calendar_Recurring_Type.WEEK) {
      recurryingWeekDay.value=1
    } else {
      recurryingMonthDay.value=1
    }
    props.data.recurring_day=1
  } else {
    props.data.recurring_day=undefined
  }
})
const onChangeStart=()=>{
  let objDate=moment(startDate.value)
  props.data.start=moment.tz({
    year:objDate.year(),
    month:objDate.month(),
    date:objDate.date(),
    hour:typeof(startTime.value)=="number"?moment(startTime.value).hour():parseInt((startTime.value as string).split(":")[0]),
    minute:typeof(startTime.value)=="number"?moment(startTime.value).minute():parseInt((startTime.value as string).split(":")[1]),
  },props.timezone).toDate().getTime()
}
const onChangeEnd=()=>{
  let objDate=moment(endDate.value)
  props.data.end=moment.tz({
    year:objDate.year(),
    month:objDate.month(),
    date:objDate.date(),
    hour:typeof(endTime.value)=="number"?moment(endTime.value).hour():parseInt((endTime.value as string).split(":")[0]),
    minute:typeof(endTime.value)=="number"?moment(endTime.value).minute():parseInt((endTime.value as string).split(":")[1]),
  },props.timezone).toDate().getTime()
}
const onChangeRecurry=()=>{
  if(props.data.recurring==ECommon_Calendar_Recurring_Type.WEEK) {
    props.data.recurring_day=recurryingWeekDay.value
  } else if(props.data.recurring==ECommon_Calendar_Recurring_Type.MONTH) {
    props.data.recurring_day=recurryingMonthDay.value
  }
}

const onChangeAllDay=()=>{
  if(props.data.isAllDay) {
    let objDate=moment(startDate.value)
    props.data.start=moment.tz({
      year:objDate.year(),
      month:objDate.month(),
      date:objDate.date(),
      hour:0,
      minute:0
    },props.timezone).toDate().getTime()
    objDate=moment(endDate.value)
    props.data.end=moment.tz({
      year:objDate.year(),
      month:objDate.month(),
      date:objDate.date(),
      hour:23,
      minute:59
    },props.timezone).toDate().getTime()
  } else {
    onChangeStart()
    onChangeEnd()
  }
}

</script>

<style scoped>

</style>