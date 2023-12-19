<template>
  <a-form ref="formEle" :model="form" label-align="left" auto-label-width size="small">
    <a-form-item field="name" required hide-asterisk>
      <template #label>
        <icon-info-circle style="font-size: medium"></icon-info-circle>
      </template>
      <a-input :placeholder="$t('placeholder.newEventTitle')" v-model="form.name" v-if="isSelf"></a-input>
	    <template v-else>
		    {{form.name}}
	    </template>
    </a-form-item>
    <a-form-item field="date" required hide-asterisk :disabled="!isSelf">
      <template #label>
        <icon-clock-circle style="font-size: medium"></icon-clock-circle>
      </template>
      <CalendarEventDateEdit :timezone="timezone" :data="form.date"></CalendarEventDateEdit>
    </a-form-item>
    <a-form-item>
      <a-divider orientation="left" :margin="1">{{$t("controller.app.calendar.calendarEventEdit.advanced")}}</a-divider>
    </a-form-item>
    <a-form-item field="location">
      <template #label>
        <icon-location style="font-size: medium"></icon-location>
      </template>
      <a-input :placeholder="$t('placeholder.location')" v-model="form.location" v-if="isSelf"></a-input>
	    <template v-else>
		    {{form.location?form.location:"None"}}
	    </template>
    </a-form-item>
    <a-form-item field="reminder">
      <template #label>
        <icon-notification style="font-size: medium"></icon-notification>
      </template>
      <a-select v-model="form.reminder" v-if="isSelf">
        <a-option :value="0">{{$t("controller.app.calendar.calendarEventEdit.noReminder")}}</a-option>
        <a-option :value="5">{{$t("controller.app.calendar.calendarEventEdit.fiveMinBefore")}}</a-option>
        <a-option :value="15">{{$t("controller.app.calendar.calendarEventEdit.fifteenMinBefore")}}</a-option>
        <a-option :value="30">{{$t("controller.app.calendar.calendarEventEdit.thirtyMinBefore")}}</a-option>
        <a-option :value="60">{{$t("controller.app.calendar.calendarEventEdit.oneHourBefore")}}</a-option>
        <a-option :value="600">{{$t("controller.app.calendar.calendarEventEdit.sixHourBefore")}}</a-option>
      </a-select>
	    <template v-else>
		    {{({
		    	"0":$t("controller.app.calendar.calendarEventEdit.noReminder"),
		    	"5":$t("controller.app.calendar.calendarEventEdit.fiveMinBefore"),
		    	"15":$t("controller.app.calendar.calendarEventEdit.fifteenMinBefore"),
		    	"30":$t("controller.app.calendar.calendarEventEdit.thirtyMinBefore"),
		    	"60":$t("controller.app.calendar.calendarEventEdit.oneHourBefore"),
		    	"600":$t("controller.app.calendar.calendarEventEdit.sixHourBefore")
	    	})[form.reminder]}}
	    </template>
    </a-form-item>
    <a-form-item field="calendarId" required hide-asterisk>
      <template #label>
        <icon-calendar style="font-size: medium"></icon-calendar>
      </template>
      <a-select v-model="form.calendarId" v-if="isSelf" :disabled="type=='edit'">
        <a-option v-for="item in resourceList" :value="item.id" :label="item.name"></a-option>
      </a-select>
	    <template v-else>
		    <UserAvatar v-if="calendarEventInfo" :organization-user-id="calendarEventInfo.created_by?.organizationUserId" :name="calendarEventInfo.created_by.nickname" :photo="calendarEventInfo.created_by.photo"></UserAvatar>
		    &nbsp;invited you
	    </template>
    </a-form-item>
	  <a-form-item field="meeting" v-if="type==='add' || (type==='edit' && (isSelf || (!isSelf && calendarEventInfo.meeting)))">
		  <template #label>
			  <icon-video-camera style="font-size: medium"></icon-video-camera>
		  </template>
		  <template v-if="isSelf">
			  <a-switch v-if="type==='add'" v-model="form.meeting"></a-switch>
			  <template v-else>
				  <template v-if="calendarEventInfo?.meeting">
					  <a-switch v-model="form.meeting"></a-switch>
					  <a-popover position="right" v-if="form.meeting" trigger="click">
						  <a-button type="primary" status="success" style="margin-left: 20px">
							  {{$t("controller.app.calendar.calendarEventEdit.startMeeting")}}
						  </a-button>
						  <template #content>
							  <a-row style="flex-direction: column;align-items: center">
								  <a-input size="small" :placeholder="$t('placeholder.typeUserName')" v-model="searchUserKey"></a-input>
								  <a-table style="width: 100%;margin-top: 10px" row-key="organizationUserId" :columns="columns" :data="(form.guestList as any).filter(item=>(item.organizationUserId!==organizationUserId && item.nickname.includes(searchUserKey)))" :row-selection="rowSelection" v-model:selected-keys="selectKeys" :pagination="false">
									  <template #name="{record}">
										  <UserAvatar :organization-user-id="record.organizationUserId" :name="record.nickname" :photo="record.photo"></UserAvatar>
									  </template>
								  </a-table>
								  <a-button type="primary" style="margin-top: 10px" size="small" @click="onMeeting">{{$t("util.start")}}</a-button>
							  </a-row>
						  </template>
					  </a-popover>
				  </template>
				  <a-switch v-model="form.meeting" v-else></a-switch>
			  </template>
		  </template>
		  <a-button type="primary" status="success" @click="onMeeting" v-else>
			  {{$t("controller.app.calendar.calendarEventEdit.joinMeeting")}}
		  </a-button>
	  </a-form-item>
    <a-form-item field="guestList">
      <template #label>
        <icon-user-add style="font-size: medium"></icon-user-add>
      </template>
      <CalendarEventGuestEdit :value="form.guestList" v-if="isSelf"></CalendarEventGuestEdit>
	    <template v-else>
		    <UserAvatar v-for="item in form.guestList" :organization-user-id="item.organizationUserId" :name="item.nickname" :photo="item.photo"></UserAvatar>
	    </template>
    </a-form-item>
    <a-form-item field="agenda" v-drop.file.shortcut.disk="onDrop">
      <template #label>
        <icon-edit style="font-size: medium"></icon-edit>
      </template>
	    <a-spin :loading="loading" style="width: 100%;resize: both;overflow: hidden">
		    <RichEditor v-model="form.agenda" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" ref="objEditorUser" style="background-color: var(--color-fill-2);width: 100%;height: 100%" :readonly="!isSelf"></RichEditor>
	    </a-spin>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import CalendarEventDateEdit, {CalendarEventModelType} from "./calendarEventDateEdit.vue";
import {getCurrentInstance, onBeforeMount, reactive, ref} from "vue";
import {apiCalendar, apiFile, apiMeeting} from "../../../common/request/request";
import {ICommon_Route_Res_Calendar_Event_Info} from "../../../../../../common/routes/response";
import moment from "moment";
import {ECommon_Calendar_Recurring_Type} from "../../../../../../common/model/calendar_event";
import CalendarEventGuestEdit from "./calendarEventGuestEdit.vue";
import {onDialogOk} from "../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../common/util/helper";
import {Message} from "@arco-design/web-vue";
import RichEditor from "../../../common/component/richEditor/richEditor.vue";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config
} from "../../../../../../common/model/content";
import {RichEditorEventHandle} from "../../../common/component/richEditorEventHandle";
import {DropParam, vDrop} from "../../../../teamOS/common/directive/drop";
import {SessionStorage} from "../../../common/storage/session";
import UserAvatar from "../../../common/component/userAvatar.vue";
import {TableRowSelection} from "@arco-design/web-vue/es/table/interface";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {ECommon_Model_Organization_Member_Type} from "../../../../../../common/model/organization";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";

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
const appContext=getCurrentInstance().appContext
const popMenuList=ref(RichEditorEventHandle.popMenuList)
const isSelf=ref(true)
const formEle=ref()
const loading = ref(false)
const objEditorUser=ref<InstanceType<typeof RichEditor>>()
const calendarEventInfo=ref<DCSType<ICommon_Route_Res_Calendar_Event_Info>>()
const searchUserKey=ref("")
const organizationUserId=SessionStorage.get("organizationUserId")
const selectKeys=ref([])
const rowSelection=ref<TableRowSelection>({
	type:"checkbox",
	showCheckedAll:true,
	onlyCurrent:false
})
const {t}=useI18n()
const columns = [
	{
		title: t("util.name"),
		slotName: 'name',
	}
]
const form=reactive<{
  name:string,
  date:CalendarEventModelType,
  location:string,
  reminder:number,
  calendarId:string,
  agenda:ICommon_Content_Line[],
  guestList:DCSType<ICommon_Route_Res_Calendar_Event_Info["guestList"]>,
	meeting:boolean
}>({
  date:{},
  guestList:[],
	agenda:[],
	meeting:false
} as any)
const getCalendarEventInfo=async ()=>{
  let res=await apiCalendar.getCalendarEvent({
    calendarEventId:props.calendarEventId
  })
  if(res?.code==0) {
    calendarEventInfo.value=res.data
	  isSelf.value=calendarEventInfo.value.created_by?.organizationUserId===SessionStorage.get("organizationUserId")
  }
}

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

const onDrop=(data?:DropParam)=>{
	RichEditorEventHandle.onDrop(objEditorUser,data)
}

const onUploadFile=async (file, handleFunc) => {
	let res=await apiFile.upload({
		file:file
	})
	if(res?.code==0) {
		handleFunc(res.data.id,res.data.path)
	}
}

const onPopMenuClick=(type:ECommon_Content_Line_Config_Type,handleFunc:(item:ICommon_Content_Line_Config)=>void)=>{
	RichEditorEventHandle.onPopMenuClick(type,formEle,appContext,loading,handleFunc)
}

const onMeeting=async ()=>{
	let res=await apiMeeting.getRoom({
		meetingRoomId:calendarEventInfo.value.meeting
	})
	if(res?.code===0) {
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,res.data.id,res.data.password,selectKeys.value.map(item=>({
			id:item,
			type:ECommon_Model_Organization_Member_Type.USER
		})))
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
    form.agenda=calendarEventInfo.value.agenda?JSON.parse(calendarEventInfo.value.agenda):[]
    form.guestList=calendarEventInfo.value.guestList
    form.calendarId=calendarEventInfo.value.calendar_id
	  form.meeting=!!calendarEventInfo.value.meeting
  } else {
    form.name=props.name??""
    form.date.start=props.date?.start??moment().toDate().getTime()
    form.date.end=props.date?.end??moment().add(1,"hour").toDate().getTime()
    form.date.isAllDay=props.date?.isAllDay??0
    form.date.recurring=props.date?.recurring??ECommon_Calendar_Recurring_Type.NONE
    form.date.recurring_day=props.date?.recurring_day
    form.reminder=0
    form.location=""
    form.agenda=[]
    form.guestList=[]
    form.calendarId=props.resourceList[0].id
	  form.meeting=false
  }
})
onDialogOk(dialogFuncGenerator({
  form:()=>formEle.value,
  func:()=>{
    if(form.date.end<form.date.start) {
      Message.error(t("tip.endDateLess"))
      return false
    }
		if(isSelf.value) {
			return props.type=="edit"?apiCalendar.editCalendarEvent({
				calendarEventId:props.calendarEventId,
				name:form.name,
				startTime:form.date.start,
				endTime:form.date.end,
				all_day:form.date.isAllDay,
				recurring:form.date.recurring,
				recurring_day:form.date.recurring_day,
				agenda:JSON.stringify(form.agenda.map(item=>{
					return {
						arr:item.arr
					}
				})),
				location:form.location,
				reminder_minutes:form.reminder===0?null:form.reminder,
				guestList:form.guestList.map(item=>item.organizationUserId),
				meeting:form.meeting
			}):apiCalendar.addCalendarEvent({
				calendarId:form.calendarId,
				name:form.name,
				startTime:form.date.start,
				endTime:form.date.end,
				all_day:form.date.isAllDay,
				recurring:form.date.recurring,
				recurring_day:form.date.recurring_day,
				agenda:JSON.stringify(form.agenda.map(item=>{
					return {
						arr:item.arr
					}
				})),
				location:form.location,
				reminder_minutes:form.reminder===0?null:form.reminder,
				guestList:form.guestList.map(item=>item.organizationUserId),
				meeting:form.meeting
			})
		} else {
			return true
		}
  }
}))

</script>

<style scoped>

</style>
