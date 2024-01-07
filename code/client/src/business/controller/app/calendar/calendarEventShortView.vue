<template>
	<div style="position: absolute;width: 300px;background-color: white;border-radius: 5px;box-shadow:0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12), 0 11px 15px -7px rgba(0,0,0,.12)" :style="{left:maskInfoLeft,top:maskInfoTop}">
		<div style="height: 30px;display: flex">
			<div style="flex:1 1 auto">

			</div>
			<div style="flex: 0 0 100px;display: flex;justify-content: space-around;align-items: center">
				<template v-if="isSelf">
					<svg focusable="false" width="20" height="20" viewBox="0 0 24 24" class="svg" @click="onEditEvent" style="cursor: pointer"><path d="M20.41 4.94l-1.35-1.35c-.78-.78-2.05-.78-2.83 0L3 16.82V21h4.18L20.41 7.77c.79-.78.79-2.05 0-2.83zm-14 14.12L5 19v-1.36l9.82-9.82 1.41 1.41-9.82 9.83z"></path></svg>
					<svg focusable="false" width="20" height="20" viewBox="0 0 24 24" class="svg" @click="onDeleteEvent" style="cursor: pointer"><path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13z"></path><path d="M9 8h2v9H9zm4 0h2v9h-2z"></path></svg>
				</template>
				<template v-else>
					<icon-expand style="cursor: pointer" @click="onEditEvent"></icon-expand>
				</template>
				<svg focusable="false" width="20" height="20" viewBox="0 0 24 24" class="svg" @click="$emit('close') " style="cursor: pointer"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
			</div>
		</div>
		<div style="padding: 0px 10px 10px 10px;">
			<div style="display: flex;height: 30px">
				<div style="flex: 0 0 30px">
					<div style="width: 10px;height: 10px;border-radius: 2px;margin-top: 7px;margin-left: 5px" :style="{backgroundColor:selectedEvent.color}"></div>
				</div>
				<div style="font-size: 20px;flex: 1 1 auto" v-drag.shortcut="()=>({
            shortcutType:ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT,
						shortcutRefId:selectedEvent.id,
						shortcutName:selectedEvent.name
          })">{{selectedEvent.name}}</div>
			</div>
			<div style="display: flex;height: 30px">
				<div style="flex: 0 0 30px">
				</div>
				<div style="flex: 1 1 auto;color: gray">{{selectedDateFormat}}</div>
			</div>
			<div style="display: flex;height: 20px" v-if="selectedEvent.reminder">
				<div style="flex: 0 0 30px">
					<svg focusable="false" width="18" height="18" viewBox="0 0 24 24" class="svg" style="margin-left: 2px"><path d="M18 17v-6c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v6H4v2h16v-2h-2zm-2 0H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6zm-4 5c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"></path></svg>
				</div>
				<div style="flex: 1 1 auto;height: 20px;line-height: 20px">{{`${selectedEvent.reminder} min before`}}</div>
			</div>
			<div style="display: flex;height: 30px" v-if="calendarEventInfo?.meeting">
				<div style="flex: 0 0 30px;display: flex;align-items: center">
					<icon-video-camera style="margin-left: 3px"></icon-video-camera>
				</div>
				<div style="flex: 1 1 auto;display: flex;align-items: center">
					<a-popover position="right" trigger="click" v-if="isSelf">
						<a-button type="primary" status="success" size="mini">
							{{$t("controller.app.calendar.calendarEventEdit.startMeeting")}}
						</a-button>
						<template #content>
							<a-row style="flex-direction: column;align-items: center">
								<a-input size="small" :placeholder="$t('placeholder.typeUserName')" v-model="searchUserKey"></a-input>
								<a-table style="width: 100%;margin-top: 10px" row-key="organizationUserId" :columns="columns" :data="(calendarEventInfo.guestList as any).filter(item=>(item.organizationUserId!==organizationUserId && item.nickname.includes(searchUserKey)))" :row-selection="rowSelection" v-model:selected-keys="selectKeys" :pagination="false">
									<template #name="{record}">
										<UserAvatar :organization-user-id="record.organizationUserId" :name="record.nickname" :photo="record.photo"></UserAvatar>
									</template>
								</a-table>
								<a-button type="primary" style="margin-top: 10px" size="small" @click="onMeeting">{{$t("util.start")}}</a-button>
							</a-row>
						</template>
					</a-popover>
					<a-button type="primary" status="success" size="mini" @click="onMeeting" v-else>
						{{$t("controller.app.calendar.calendarEventEdit.joinMeeting")}}
					</a-button>
				</div>
			</div>
			<div style="display: flex;height: 20px;margin-top: 5px">
				<div style="flex: 0 0 30px">
					<svg focusable="false" width="16" height="16" viewBox="0 0 1024 1024" class="svg" style="margin-left: 3px;margin-top: 2px"><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32z m-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"></path></svg>
				</div>
				<div style="flex: 1 1 auto;height: 20px;line-height: 20px;align-items: center;display: flex">
					<template v-if="isSelf">
						{{selectedEvent.resource.name}}
					</template>
					<template v-else>
						<UserAvatar :organization-user-id="selectedEvent.created_by?.organizationUserId" :name="selectedEvent.created_by.nickname" :photo="selectedEvent.created_by.photo"></UserAvatar>
						&nbsp;{{$t("controller.app.calendar.calendarEventShortView.invitedYou")}}
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";
import {computed, onBeforeMount, ref} from "vue";
import {IClient_Calendar_Info} from "../../../common/component/calendar/type";
import moment from "moment";
import "moment-timezone"
import {vDrag} from "../../../../teamOS/common/directive/drag";
import {SessionStorage} from "../../../common/storage/session";
import UserAvatar from "../../../common/component/userAvatar.vue";
import {apiCalendar, apiMeeting} from "../../../common/request/request";
import {ICommon_Route_Res_Calendar_Event_Info} from "../../../../../../common/routes/response";
import {TableRowSelection} from "@arco-design/web-vue/es/table/interface";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {ECommon_Model_Organization_Member_Type} from "../../../../../../common/model/organization";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";

const emit=defineEmits<{
	edit:[event:IClient_Calendar_Info],
	delete:[event:IClient_Calendar_Info],
	close:[]
}>()
const props=defineProps<{
	timeZone:string,
	selectedEvent:IClient_Calendar_Info,
	maskInfoLeft:string,
	maskInfoTop:string
}>()
const calendarEventInfo=ref<DCSType<ICommon_Route_Res_Calendar_Event_Info>>()
const isSelf=ref(props.selectedEvent.created_by?.organizationUserId===SessionStorage.get("organizationUserId"))
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
const selectedDateFormat=computed(()=>{
	let event=props.selectedEvent
	let objStart=moment().tz(props.timeZone)
	objStart.set({
		year:event.startDate.year,
		month:event.startDate.month-1,
		date:event.startDate.day,
		hour:event.startDate.hour,
		minute:event.startDate.minute
	})
	let objEnd=moment().tz(props.timeZone)
	objEnd.set({
		year:event.endDate.year,
		month:event.endDate.month-1,
		date:event.endDate.day,
		hour:event.endDate.hour,
		minute:event.endDate.minute
	})
	if(event.isAllDay) {
		if(objStart.isSame(objEnd,"days")) {
			return `${objStart.format("MM/DD")}`
		} else {
			return `${objStart.format("MM/DD")} - ${objEnd.format("MM/DD")}`
		}
	} else {
		return `${objStart.format("MM/DD HH:mm")} - ${objEnd.format("MM/DD HH:mm")}`
	}
})

const onEditEvent=()=>{
	emit("edit",props.selectedEvent)
}

const onDeleteEvent=()=>{
	emit("delete",props.selectedEvent)
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
	let res=await apiCalendar.getCalendarEvent({
		calendarEventId:props.selectedEvent.id
	})
	if(res?.code==0) {
		calendarEventInfo.value=res.data
	}
})
</script>

<style scoped>

</style>