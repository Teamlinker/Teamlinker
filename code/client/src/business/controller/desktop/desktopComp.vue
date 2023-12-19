<template>
	<div style="display: flex;flex-direction: column;">
		<div style="height: 150px;width: 100%;" class="card">
			<div style="height: 40px;display: flex;align-items: center;padding-left: 5px;color: white;font-weight: bold;font-size: medium">
				{{$t("controller.desktop.comp.recentIssue")}}
			</div>
			<div style="height: calc(100% - 40px);overflow-y: auto">
				<a-list :bordered="false"  style="height: 100%" size="small" scrollbar :max-height="120" :split="false">
					<template #empty>
						<a-empty style="margin-top: 20px"></a-empty>
					</template>
					<a-list-item v-for="item in issueList" style="cursor: pointer" @click="onIssue(item.project.id,item.id)">
						<a-space style="overflow: hidden;white-space: nowrap;color: white">
							<FieldPriority :priority="item.priority"></FieldPriority>
							<span style="color: dodgerblue">{{item.project.keyword+"-"+item.unique_id}}</span>
							{{item.name}}
						</a-space>
					</a-list-item>
				</a-list>
			</div>
		</div>
		<div style="height: 150px;width: 100%;display: flex;justify-content: space-between;margin-top: 20px;">
			<div style="width: 49%;height: 100%;" class="card">
				<div style="height: 40px;display: flex;align-items: center;color: white;font-weight: bold;justify-content: space-between;padding-left: 5px;font-size: medium">
					{{$t("controller.desktop.comp.recentCreatedProject")}}
					<a-button type="text" @click="onCreateProject">
						<template #icon>
							<icon-plus style="color: white"></icon-plus>
						</template>
					</a-button>
				</div>
				<div style="height: calc(100% - 40px);overflow-y: auto">
					<a-list :bordered="false"  style="height: 100%" size="small" scrollbar :max-height="120" :split="false">
						<template #empty>
							<a-empty style="margin-top: 20px"></a-empty>
						</template>
						<a-list-item v-for="item in projectList" style="color: white;cursor: pointer" @click="onProject(item.id)">
							{{item.name}}
						</a-list-item>
					</a-list>
				</div>
			</div>
			<div style="width: 49%;height: 100%;" class="card">
				<div style="height: 40px;display: flex;align-items: center;color: white;font-weight: bold;justify-content: space-between;padding-left: 5px;font-size: medium">
					{{$t("controller.desktop.comp.recentCreatedWikiSpace")}}
					<a-button type="text" @click="onCreateWikiSpace">
						<template #icon>
							<icon-plus style="color: white"></icon-plus>
						</template>
					</a-button>
				</div>
				<div style="height: calc(100% - 40px);overflow-y: auto">
					<a-list :bordered="false"  style="height: 100%" size="small" scrollbar :max-height="120" :split="false">
						<template #empty>
							<a-empty style="margin-top: 20px"></a-empty>
						</template>
						<a-list-item v-for="item in wikiSpaceList" style="color: white;cursor: pointer" @click="onWikiSpace(item.id)">
							{{item.name}}
						</a-list-item>
					</a-list>
				</div>
			</div>
		</div>
		<div style="height: 150px;width: 100%;display: flex;justify-content: space-between;margin-top: 10px">
			<div style="width:49%;height: 100%;" class="card">
				<div style="height: 40px;display: flex;align-items: center;color: white;font-weight: bold;justify-content: space-between;padding-left: 5px;font-size: medium">
					{{$t("controller.desktop.comp.recentCalendarEvent")}}
					<a-button type="text" @click="onCreateCalendarEvent" :loading="loadingCalendarEvent">
						<template #icon>
							<icon-plus style="color: white"></icon-plus>
						</template>
					</a-button>
				</div>
				<div style="height: calc(100% - 40px);overflow-y: auto">
					<a-list :bordered="false"  style="height: 100%" size="small" scrollbar :max-height="120" :split="false">
						<template #empty>
							<a-empty style="margin-top: 20px"></a-empty>
						</template>
						<a-list-item v-for="item in calendarEventList" style="color: white;cursor: pointer" @click="onCalendarEvent(item.id)">
							{{item.name}}
						</a-list-item>
					</a-list>
				</div>
			</div>
			<div style="width:49%;height: 100%;" class="card">
				<div style="height: 40px;display: flex;align-items: center;color: white;font-weight: bold;justify-content: space-between;padding-left: 5px;font-size: medium">
					{{$t("controller.desktop.comp.recentMeeting")}}
					<a-button type="text" @click="onCreateMeeting">
						<template #icon>
							<icon-plus style="color: white"></icon-plus>
						</template>
					</a-button>
				</div>
				<div style="height: calc(100% - 40px);overflow-y: auto">
					<a-list :bordered="false"  style="height: 100%" size="small" scrollbar :max-height="120" :split="false">
						<template #empty>
							<a-empty style="margin-top: 20px"></a-empty>
						</template>
						<a-list-item v-for="item in meetingRoomList" style="color: white;cursor: pointer" @click="onMeeting(item.id,item.password)">
							{{item.name}}
						</a-list-item>
					</a-list>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref, watch} from "vue";
import {DCSType} from "../../../../../common/types";
import {
	ICommon_Route_Res_Calendar_ListEvent_Item,
	ICommon_Route_Res_RecentIssue_Item,
	ICommon_Route_Res_recentProjectList_Item
} from "../../../../../common/routes/response";
import {ICommon_Model_Wiki} from "../../../../../common/model/wiki";
import {ICommon_Model_Meeting_Room} from "../../../../../common/model/meeting_room";
import {apiCalendar, apiIssue, apiMeeting, apiProject, apiWiki} from "@/business/common/request/request";
import moment from "moment"
import FieldPriority from "@/business/common/component/field/fieldPriority.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "@/business/common/event/event";
import {Dialog} from "@/business/common/component/dialog/dialog";
import EditProjectProfile from "@/business/controller/app/setting/project/editProjectProfile.vue";
import {useI18n} from "vue-i18n";
import EditWikiProfile from "@/business/controller/app/setting/wiki/editWikiProfile.vue";
import CalendarEventEdit from "@/business/controller/app/calendar/calendarEventEdit.vue";
import "moment-timezone"
import EditScheduleMeeting from "@/business/controller/app/meeting/editScheduleMeeting.vue";

const props=defineProps<{
	backgroundImage?:string
}>()
const issueList=ref<DCSType<ICommon_Route_Res_RecentIssue_Item>[]>([])
const projectList=ref<DCSType<ICommon_Route_Res_recentProjectList_Item>[]>([])
const wikiSpaceList=ref<DCSType<ICommon_Model_Wiki>[]>([])
const calendarEventList=ref<DCSType<ICommon_Route_Res_Calendar_ListEvent_Item>[]>([])
const meetingRoomList=ref<DCSType<ICommon_Model_Meeting_Room>[]>([])
const backgroundColor=ref("rgb(255,250,244)")
const {t}=useI18n()
const loadingCalendarEvent=ref(false)
const appContext=getCurrentInstance().appContext
watch(()=>props.backgroundImage,()=>{
	if(props.backgroundImage) {
		backgroundColor.value="hsla(0,0%,100%,.3)"
	} else {
		backgroundColor.value="hsla(0,0%,100%,.3)"
	}
},{
	immediate:true
})

const onIssue=async (projectId:string,projectIssueId:string)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,projectIssueId)
}

const onProject=async (projectId:string)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_PROFILE,projectId)
}

const onWikiSpace=async (wikiSpaceId:string)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_PROFILE,wikiSpaceId)
}

const onCalendarEvent=async (calendarEventId:string)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,calendarEventId)
}

const onMeeting=async (meetingId:string,password:string)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,meetingId,password)
}

const onCreateProject=async ()=>{
	let ret=await Dialog.open(document.body,appContext,t("util.add"),markRaw(EditProjectProfile),{
		type:"add"
	})
	if(ret) {
		getProjectList()
	}
}

const onCreateWikiSpace=async ()=>{
	let ret=await Dialog.open(document.body,appContext,t("util.add"),markRaw(EditWikiProfile),{
		type:"add"
	})
	if(ret) {
		getWikiSpaceList()
	}
}

const onCreateCalendarEvent=async ()=>{
	loadingCalendarEvent.value=true
	let [resSetting,resCalendarList]=await Promise.all([
		apiCalendar.getCalendarSetting(),
		apiCalendar.listCalendar()
	])
	loadingCalendarEvent.value=false
	let timezone=resSetting.data.timezone || moment.tz.guess()
	let ret=await Dialog.open(document.body,appContext,t("controller.app.calendar.calendar.addEvent"),markRaw(CalendarEventEdit),{
		type:"add",
		resourceList:resCalendarList.data.map(item=>({id:item.id,name:item.name})),
		timezone:timezone
	})
	if(ret) {
		getCalendarEventList()
	}
}

const onCreateMeeting=async ()=>{
	let ret=await Dialog.open(document.body,appContext,t("controller.app.meeting.meeting.scheduleMeeting"),markRaw(EditScheduleMeeting),{
		type:"add"
	})
	if(ret) {
		getMeetingRoomList()
	}
}

const getIssueList=async ()=>{
	let res=await apiIssue.recentIssueList({
		size:5
	})
	if(res?.code==0) {
		issueList.value=res.data
	}
}

const getProjectList=async ()=>{
	let res=await apiProject.userProjectList({
		sort:"created_time",
		size:5,
		page:0,
		type:"created"
	})
	if(res?.code==0) {
		projectList.value=res.data.data
	}
}

const getWikiSpaceList=async ()=>{
	let res=await apiWiki.userWikiList({
		sort:"created_time",
		type:"created",
		size:5,
		page:0
	})
	if(res?.code==0) {
		wikiSpaceList.value=res.data.data
	}
}

const getCalendarEventList=async ()=>{
	let res=await apiCalendar.listCalendar()
	if(res?.code==0) {
		let calendar=res.data.find(item=>item.reserved)
		if(calendar) {
			let res=await apiCalendar.listCalendarEvent({
				calendarId:calendar.id,
				start:Date.now(),
				end:moment().add(1,"day").toDate().getTime()
			})
			if(res?.code==0) {
				calendarEventList.value=res.data
			}
		}
	}
}

const getMeetingRoomList=async ()=>{
	let res=await apiMeeting.listRoom({
		page:0,
		size:5
	})
	if(res?.code==0) {
		meetingRoomList.value=res.data.data
	}
}

onBeforeMount(()=>{
	getIssueList()
	getProjectList()
	getWikiSpaceList()
	getCalendarEventList()
	getMeetingRoomList()
})

</script>

<style scoped>
.card {
	backdrop-filter: blur(20px);
	background-color: v-bind(backgroundColor);
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12), 0 11px 15px -7px rgba(0,0,0,.12);
	padding: 5px;
	box-sizing: border-box;
}
:deep .arco-list-item {
	padding: 9px 5px!important;
}
</style>