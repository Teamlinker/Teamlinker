<template>
	<div style="position: relative" ref="root">
		<a-list>
			<a-list-item v-for="item in list">
				<div style="width: 100%;height: 30px;display: flex;align-items: center;cursor: pointer;box-sizing: border-box;padding: 5px" class="hover" @click="onClick($event,item)">
					{{item.name}}&nbsp;
					{{moment(item.start_time).tz(timezone).format("YYYY-MM-DD HH:mm:ss")}}
				</div>
			</a-list-item>
		</a-list>
		<CalendarEventShortView v-if="isShow" :time-zone="timezone" :selected-event="selectedEvent" :mask-info-left="maskInfoLeft" :mask-info-top="maskInfoTop" @edit="onEdit" @delete="onDelete" @close="isShow=false"></CalendarEventShortView>
	</div>
</template>

<script setup lang="ts">
import {ICommon_Route_Res_Calendar_ListEvent_Item} from "../../../../../../common/routes/response";
import CalendarEventShortView from "./calendarEventShortView.vue";
import {ref} from "vue";
import {IClient_Calendar_Info} from "../../../common/component/calendar/type";
import moment from "moment";
import "moment-timezone"
import {DCSType} from "../../../../../../common/types";

const emit=defineEmits<{
	edit:[event:IClient_Calendar_Info],
	delete:[event:IClient_Calendar_Info]
}>()
const props=defineProps<{
	list:DCSType<ICommon_Route_Res_Calendar_ListEvent_Item>[]
	timezone:string
}>()
const maskInfoLeft=ref("")
const maskInfoTop=ref("")
const isShow=ref(false)
const root=ref<HTMLElement>()
const selectedEvent=ref<IClient_Calendar_Info>()
const onClick=async (event:MouseEvent,item:DCSType<ICommon_Route_Res_Calendar_ListEvent_Item>)=>{
	let objStart=moment(item.start_time).tz(props.timezone)
	let objEnd=moment(item.end_time).tz(props.timezone)
	selectedEvent.value= {
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
		name:item.name,
		created_by:item.created_by,
		fixed:true
	}
	let rootRect=root.value.getBoundingClientRect()
	let offsetLeft=event.x-rootRect.left
	if(offsetLeft>300) {
		offsetLeft-=300
	}
	maskInfoLeft.value=offsetLeft+"px"
	let offsetTop=event.y-rootRect.top
	if(offsetTop>125) {
		offsetTop-=125
	}
	maskInfoTop.value=offsetTop+"px"
	isShow.value=true
}

const onEdit=()=>{
	emit("edit",selectedEvent.value)
	isShow.value=false
}

const onDelete=()=>{
	emit("delete",selectedEvent.value)
	isShow.value=false
}
</script>

<style scoped>
.hover:hover {
	background-color: rgb(241,241,241);
}
</style>