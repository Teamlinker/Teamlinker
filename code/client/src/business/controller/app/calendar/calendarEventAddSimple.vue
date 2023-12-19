<template>
  <div style="width: 400px;height: 350px;box-shadow: 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12), 0 11px 15px -7px rgba(0,0,0,.12);background-color: white;border-radius: 5px;overflow: hidden;z-index: 100" tabindex="-1">
    <div style="height: 35px;background-color: rgb(249,249,249)">
      <a-button type="text" size="small" style="float: right;margin-right: 5px;margin-top: 5px;" @click="emit('close')">
        <template #icon>
          <icon-close style="color: gray"></icon-close>
        </template>
      </a-button>
    </div>
    <div style="height: 280px;padding-top: 10px;box-sizing: border-box;padding-left: 10px">
      <a-form :model="form" style="width: 90%" label-align="left" auto-label-width ref="eleForm" size="small">
        <a-form-item field="name" required hide-asterisk>
          <template #label>
            <icon-info-circle style="font-size: medium"></icon-info-circle>
          </template>
          <a-input :placeholder="$t('placeholder.newEventTitle')" v-model="form.name"></a-input>
        </a-form-item>
        <a-form-item field="dateInfo" required hide-asterisk>
          <template #label>
            <icon-clock-circle style="font-size: medium"></icon-clock-circle>
          </template>
          <CalendarEventDateEdit :timezone="timezone" :data="form.dateInfo"></CalendarEventDateEdit>
        </a-form-item>
        <a-form-item field="resourceId" required hide-asterisk>
          <template #label>
            <icon-calendar style="font-size: medium"></icon-calendar>
          </template>
          <a-select v-model="form.resourceId">
            <a-option v-for="item in resourceList" :value="item.id" :label="item.name"></a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <div style="height: 35px">
      <a-space style="float: right;margin-right: 10px">
        <a-button type="secondary" size="small" @click="emit('more',form.name,form.dateInfo,form.resourceId)">{{$t("controller.app.calendar.calendarEventAddSimple.moreOption")}}</a-button>
        <a-button type="primary" size="small" @click="checkValid">{{$t("util.save")}}</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import {reactive, ref} from "vue";
import CalendarEventDateEdit, {CalendarEventModelType} from "./calendarEventDateEdit.vue";
import {ECommon_Calendar_Recurring_Type} from "../../../../../../common/model/calendar_event";

const props=defineProps<{
  start:moment.Moment,
  resourceList:{
    id:string,
    name:string
  }[]
	timezone:string
}>()
const emit=defineEmits<{
  (e:"close"):void,
  (e:"save", title:string, dateInfo:CalendarEventModelType, calendarId:string):void
  (e:"more", title:string, dateInfo:CalendarEventModelType, calendarId:string):void
}>()
const eleForm=ref()
const form=reactive({
  name:"",
  dateInfo:{
    start:props.start.toDate().getTime(),
    end:props.start.clone().add(1,"hour").toDate().getTime(),
    isAllDay:0,
    recurring:ECommon_Calendar_Recurring_Type.NONE
  },
  resourceId:props.resourceList[0].id
})
const checkValid=async ()=>{
  let isError=await eleForm.value.validate()
  if(isError) {
    return
  }
  emit('save',form.name,form.dateInfo,form.resourceId)
}
</script>

<style scoped>

</style>