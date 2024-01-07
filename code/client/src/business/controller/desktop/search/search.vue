<template>
	<div style="width: 100%;height: 100%;z-index: 10000;display: flex;align-items: center;justify-content: center;position: absolute;left: 0;top:0" @click="onClose">
		 <a-row style="width: 500px;border-radius: 5px;background-color: rgb(241,241,241);justify-content: center;box-shadow: 0px 0px 2px 2px rgba(169, 169, 169, 0.2)">
			 <a-input-search :placeholder="$t('placeholder.search')" size="large" v-model="keyword" autofocus></a-input-search>
			 <a-row style="width: 500px;max-height: 800px;overflow-y: auto" class="searchList">
				 <a-empty v-if="isEmpty"></a-empty>
				 <a-collapse v-else v-model:active-key="expandKeys" style="width: 100%">
					 <a-collapse-item :header="$t('util.project')" key="project" v-if="data.projectList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.projectList" :key="item.id">
								 <a-link @click="onClickProject(item)">
									 {{item.name}}
								 </a-link>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.projectIssue')" key="issue" v-if="data.projectIssueList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.projectIssueList" :key="item.id">
								 <FieldPriority :priority="item.priority" only-icon></FieldPriority>&nbsp;
								 <a-link @click="onClickProjectIssue(item)">
									 {{item.project.keyword+" - "+item.name}}
								 </a-link>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.projectRelease')" key="release" v-if="data.projectReleaseList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.projectReleaseList" :key="item.id">
								 <a-link @click="onClickProjectRelease(item)">
									 {{item.project.name+" : "+item.name}}
								 </a-link>&nbsp;
								 <span style="color: grey">
									 {{item.start_time+" - "+item.release_time}}
								 </span>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.projectBoard')" key="board" v-if="data.boardList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.boardList" :key="item.id">
								 <a-link @click="onClickProjectBoard(item)">
									 {{item.project.name+" : "+item.name}}
								 </a-link>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.projectBoardSprint')" key="sprint" v-if="data.boardSprintList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.boardSprintList" :key="item.id">
								 <a-link @click="onClickProjectBoardSprint(item)">
									 {{item.project.name+" : "+item.board.name+" : "+item.name}}
								 </a-link>&nbsp;
								 <span style="color: grey">
									 {{moment(item.start_time).format("MM-DD")+" - "+moment(item.end_time).format("MM-DD")}}
								 </span>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.wikiSpace')" key="wiki" v-if="data.wikiSpaceList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.wikiSpaceList" :key="item.id">
								 <a-link @click="onClickWikiSpace(item)">
									 {{item.name}}
								 </a-link>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.wikiItem')" key="wikiItem" v-if="data.wikiItemList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.wikiItemList" :key="item.id">
								 <a-link @click="onClickWikiItem(item)">
									 {{item.wiki.name+" : "+item.name}}
								 </a-link>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.calendarEvent')" key="calendarEvent" v-if="data.calendarEventList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.calendarEventList" :key="item.id">
								 <a-link @click="onClickCalendarEvent(item)">
									 {{item.calendar.name+" : "+item.name}}
								 </a-link>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.meetingRoom')" key="meetingRoom" v-if="data.meetingRoomList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.meetingRoomList" :key="item.id">
								 <a-link @click="onClickMeetingRoom(item)">
									 {{item.name}}
								 </a-link>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.user')" key="user" v-if="data.userList.length>0">
						 <a-list :bordered="false" size="small" style="width: 100%;">
							 <a-list-item v-for="item in data.userList" :key="item.organizationUser.id">
								 <a-space>
									 <a-avatar :size="24" :image-url="item.user.photo"></a-avatar>
									 <a-link @click="onClickUser(item)">
										 {{item.organizationUser.nickname}}
									 </a-link>
								 </a-space>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.team')" key="team" v-if="data.teamList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.teamList" :key="item.id">
								 <a-space>
									 <a-avatar :size="24" :image-url="item.photo"></a-avatar>
									 <a-link @click="onClickTeam(item)">
										 {{item.name}}
									 </a-link>
								 </a-space>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
					 <a-collapse-item :header="$t('util.finder')" key="finder" v-if="data.finderList.length>0">
						 <a-list :bordered="false" size="small">
							 <a-list-item v-for="item in data.finderList" :key="item.id">
								 <a-link @click="onClickFinder(item)">
									 {{item.name}}
								 </a-link>
							 </a-list-item>
						 </a-list>
					 </a-collapse-item>
				 </a-collapse>
			 </a-row>
		 </a-row>
	</div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {
	apiBoard,
	apiCalendar,
	apiFinder,
	apiIssue,
	apiMeeting,
	apiOrganization,
	apiProject,
	apiRelease,
	apiTeam,
	apiWiki,
	DCSType
} from "@/business/common/request/request";
import {ICommon_Model_Project} from "../../../../../../common/model/project";
import {
	ICommon_Route_Res_Calendar_ListEvent_Item,
	ICommon_Route_Res_Global_Search_Board_Item,
	ICommon_Route_Res_Global_Search_Board_Sprint_Item,
	ICommon_Route_Res_Global_Search_Project_Issue_Item,
	ICommon_Route_Res_Global_Search_Project_Release_Item,
	ICommon_Route_Res_Global_Search_Wiki_Item,
	ICommon_Route_Res_Organization_User_Item
} from "../../../../../../common/routes/response";
import {ICommon_Model_Wiki} from "../../../../../../common/model/wiki";
import {SessionStorage} from "@/business/common/storage/session";
import {ICommon_Model_Finder_Item} from "../../../../../../common/model/finder_item";
import {ICommon_Model_Meeting_Room} from "../../../../../../common/model/meeting_room";
import {ICommon_Model_Team} from "../../../../../../common/model/team";
import FieldPriority from "@/business/common/component/field/fieldPriority.vue";
import moment from "moment";
import {EClient_EVENTBUS_TYPE, eventBus} from "@/business/common/event/event";

moment;
const emit=defineEmits<{
	close:[]
}>()
let timer=null;
const data=ref<{
	projectList:DCSType<ICommon_Model_Project>[],
	projectIssueList:DCSType<ICommon_Route_Res_Global_Search_Project_Issue_Item>[],
	boardList:DCSType<ICommon_Route_Res_Global_Search_Board_Item>[],
	boardSprintList:DCSType<ICommon_Route_Res_Global_Search_Board_Sprint_Item>[],
	projectReleaseList:DCSType<ICommon_Route_Res_Global_Search_Project_Release_Item>[],
	wikiSpaceList:DCSType<ICommon_Model_Wiki>[],
	wikiItemList:DCSType<ICommon_Route_Res_Global_Search_Wiki_Item>[],
	finderList:DCSType<ICommon_Model_Finder_Item>[],
	calendarEventList:DCSType<ICommon_Route_Res_Calendar_ListEvent_Item>[],
	meetingRoomList:DCSType<ICommon_Model_Meeting_Room>[],
	userList:DCSType<ICommon_Route_Res_Organization_User_Item>[],
	teamList:DCSType<ICommon_Model_Team>[]
}>({
	projectList:[],
	projectIssueList:[],
	boardList:[],
	boardSprintList:[],
	projectReleaseList:[],
	wikiSpaceList:[],
	wikiItemList:[],
	finderList:[],
	calendarEventList:[],
	meetingRoomList:[],
	userList:[],
	teamList:[]
})
const expandKeys=ref([
	"project",
	"issue",
	"release",
	"board",
	"sprint",
	"wiki",
	"wikiItem",
	"calenderEvent",
	"meetingRoom",
	"user",
	"team",
	"finder"
])
const keyword=ref("")
const isEmpty=computed(()=>{
	return Object.values(data.value).reduce((previousValue, currentValue) => {
		return previousValue+currentValue.length
	},0)===0
})

watch(keyword,()=>{
	getData()
})

const getData=async ()=>{
	if(timer) {
		clearTimeout(timer)
	}
	if(!keyword.value) {
		data.value={
			projectList:[],
			projectIssueList:[],
			boardList:[],
			boardSprintList:[],
			projectReleaseList:[],
			wikiSpaceList:[],
			wikiItemList:[],
			finderList:[],
			calendarEventList:[],
			meetingRoomList:[],
			userList:[],
			teamList:[]
		}
		return
	}
	timer=setTimeout(async ()=>{
		const organizationUserId=SessionStorage.get("organizationUserId")
		const organizationId=SessionStorage.get("organizationId")
		if(organizationId) {
			await Promise.all([
				apiProject.list({
					organizationUserId,
					keyword:keyword.value,
					page:0,
					size:10
				}).then(res=>{
					if(res?.code==0) {
						data.value.projectList=res.data.data
					}
				}),
				apiIssue.globalSearchIssue({
					keyword:keyword.value,
					size:10
				}).then(res=>{
					if(res?.code==0) {
						data.value.projectIssueList=res.data
					}
				}),
				apiRelease.globalSearchRelease({
					keyword:keyword.value,
					size:10
				}).then(res=>{
					if(res?.code==0) {
						data.value.projectReleaseList=res.data
					}
				}),
				apiBoard.globalSearchBoard({
					keyword:keyword.value,
					size:10
				}).then(res=>{
					if(res?.code==0) {
						data.value.boardList=res.data
					}
				}),
				apiBoard.globalSearchSprint(({
					keyword:keyword.value,
					size:10
				})).then(res=>{
					if(res?.code==0) {
						data.value.boardSprintList=res.data
					}
				}),
				apiWiki.userWikiList({
					size:10,
					keyword:keyword.value,
					page:0,
					type:"all"
				}).then(res=>{
					if(res?.code==0) {
						data.value.wikiSpaceList=res.data.data
					}
				}),
				apiWiki.globalSearchWikiItem({
					keyword:keyword.value,
					size:10
				}).then(res=>{
					if(res?.code==0) {
						data.value.wikiItemList=res.data
					}
				}),
				apiFinder.search({
					keyword:keyword.value
				}).then(res=>{
					if(res?.code==0) {
						data.value.finderList=res.data.slice(0,10)
					}
				}),
				apiCalendar.searchCalendarEvent({
					keyword:keyword.value
				}).then(res=>{
					if(res?.code==0) {
						data.value.calendarEventList=res.data
					}
				}),
				apiMeeting.listRoom({
					keyword:keyword.value,
					page:0,
					size:10
				}).then(res=>{
					if(res?.code==0) {
						data.value.meetingRoomList=res.data.data
					}
				}),
				apiOrganization.listUser({
					organizationId,
					size:10,
					page:0,
					keyword:keyword.value
				}).then(res=>{
					if(res?.code==0) {
						data.value.userList=res.data.data
					}
				}),
				apiTeam.list({
					keyword:keyword.value,
					size:10,
					page:0
				}).then(res=>{
					if(res?.code==0) {
						data.value.teamList=res.data.data
					}
				})
			])
		} else {
			await apiFinder.search({
				keyword:keyword.value
			}).then(res=>{
				if(res?.code==0) {
					data.value.finderList=res.data.slice(0,10)
				}
			})
		}
		timer=null
	},300)
}

const onClose=(event:MouseEvent)=>{
	if(event.target===event.currentTarget) {
		emit("close")
	}
}

const onClickProject=(item:DCSType<ICommon_Model_Project>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_PROFILE,item.id)
}

const onClickProjectIssue=(item:DCSType<ICommon_Route_Res_Global_Search_Project_Issue_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,item.project.id,item.id)
}

const onClickProjectRelease=(item:DCSType<ICommon_Route_Res_Global_Search_Project_Release_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,item.project.id,item.id)
}

const onClickProjectBoard=(item:DCSType<ICommon_Route_Res_Global_Search_Board_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_BOARD_PROFILE,item.project.id,item.id)
}

const onClickProjectBoardSprint=(item:DCSType<ICommon_Route_Res_Global_Search_Board_Sprint_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_SPRINT_KANBAN_PROFILE,item.project.id,item.board.id,item.id)
}

const onClickWikiSpace=(item:DCSType<ICommon_Model_Wiki>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_PROFILE,item.id)
}

const onClickWikiItem=(item:DCSType<ICommon_Route_Res_Global_Search_Wiki_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM,item.wiki.id,item.id)
}

const onClickCalendarEvent=(item:DCSType<ICommon_Route_Res_Calendar_ListEvent_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,item.id)
}

const onClickMeetingRoom=(item:DCSType<ICommon_Model_Meeting_Room>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,item.id,item.password)
}

const onClickFinder=(item:DCSType<ICommon_Model_Finder_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_OPEN_WINDOW,item.parent_folder_id)
}

const onClickUser=(item:DCSType<ICommon_Route_Res_Organization_User_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,item.organizationUser.id)
}

const onClickTeam=(item:DCSType<ICommon_Model_Team>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_TEAM_PROFILE,item.id)
}

</script>

<style scoped>
.searchList :deep(div[role="region"]) {
	background-color: white !important;
	padding-left: 5px;
	padding-right: 0px;
}
.searchList :deep .arco-form-item {
	margin-bottom: 10px;
}
.searchList :deep .arco-form-item-label {
	font-weight: bold;
}
.searchList :deep .arco-collapse-item-header {
	background-color: rgb(247, 247, 247);
}
.searchList :deep .arco-collapse-item-content-box {
	padding: 0px;
}
</style>