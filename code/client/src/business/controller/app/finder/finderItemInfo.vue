<template>
	<div style="width: 100%;padding-left: 5px;box-sizing: border-box">
		<a-descriptions style="margin-top: 10px;" :title="$t('util.info')" :column="1" :value-style="{wordBreak:'break-all'}">
			<template v-if="!item || !item.id">
				<a-descriptions-item :label="$t('util.name')">Desktop</a-descriptions-item>
			</template>
			<template v-else-if="item.type===ECommon_Model_Finder_Item_Type.FILE">
				<a-descriptions-item :label="$t('util.name')">{{fileInfo?.name}}</a-descriptions-item>
				<a-descriptions-item :label="$t('util.type')">
					<span style="color: blue">
						{{$t("util.file")}}
					</span>
				</a-descriptions-item>
				<a-descriptions-item :label="$t('util.size')">{{generateSizeFormat(fileInfo?.file.size)}}</a-descriptions-item>
				<a-descriptions-item :label="$t('util.date')">{{moment(fileInfo?.created_time).format("YYYY-MM-DD HH:mm:ss")}}</a-descriptions-item>
				<a-descriptions-item :label="$t('util.path')">
					{{generatePathFormat(fileInfo?.parentFolderList)}}
				</a-descriptions-item>
			</template>
			<template v-else-if="item.type===ECommon_Model_Finder_Item_Type.FOLDER">
				<a-descriptions-item :label="$t('util.name')">{{folderInfo?.name}}</a-descriptions-item>
				<a-descriptions-item :label="$t('util.type')">
					<span style="color: blue">
						{{$t("util.folder")}}
					</span>
				</a-descriptions-item>
				<a-descriptions-item :label="$t('util.date')">{{moment(folderInfo?.created_time).format("YYYY-MM-DD HH:mm:ss")}}</a-descriptions-item>
				<a-descriptions-item :label="$t('util.path')">
					{{generatePathFormat(folderInfo?.parentFolderList)}}
				</a-descriptions-item>
			</template>
			<template v-else-if="item.type===ECommon_Model_Finder_Item_Type.SHORTCUT">
				<template v-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.PROJECT">
					<a-descriptions-item :label="$t('util.name')">{{projectInfo?.name}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.type')">
						<span style="color: blue">
							{{$t("util.shortcut")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.category')">
						<span style="color: green">
							{{$t("util.project")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.key')">{{projectInfo?.keyword}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.description')" v-if="projectInfo?.description">
						<span style="line-clamp: 4;-webkit-box-orient: vertical;overflow: hidden;display: -webkit-box;-moz-box-orient: vertical;">
							{{projectInfo?.description}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.create')" v-if="projectInfo">
						<UserAvatar :organization-user-id="projectInfo?.created_by?.organizationUserId" :name="projectInfo?.created_by.nickname" :photo="projectInfo?.created_by.photo" :organization-id="projectInfo?.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.organization')" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE">
					<a-descriptions-item :label="$t('util.name')">{{projectIssueInfo?.name}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.type')">
						<span style="color: blue">
							{{$t("util.shortcut")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.category')">
						<span style="color: green">
							{{$t("util.projectIssue")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.key')">{{projectIssueInfo?.project.keyword+"-"+projectIssueInfo?.unique_id}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.priority')" v-if="projectIssueInfo">
						<FieldPriority :priority="projectIssueInfo?.priority"></FieldPriority>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.issueType')">
						{{projectIssueInfo?.issueType.name}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.status')">
						{{projectIssueInfo?.workflowNode.name}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.reporter')" v-if="projectIssueInfo?.reporter_id">
						<UserAvatar :organization-user-id="projectIssueInfo?.reporter_id.organizationUserId" :name="projectIssueInfo?.reporter_id.nickname" :photo="projectIssueInfo?.reporter_id.photo" :organization-id="projectIssueInfo?.project.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.assigner')" v-if="projectIssueInfo?.assigner_id">
						<UserAvatar :organization-user-id="projectIssueInfo?.assigner_id.organizationUserId" :name="projectIssueInfo?.assigner_id.nickname" :photo="projectIssueInfo?.assigner_id.photo" :organization-id="projectIssueInfo?.project.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.organization')" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE">
					<a-descriptions-item :label="$t('util.name')">{{projectReleaseInfo?.name}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.type')">
						<span style="color: blue">
							{{$t("util.shortcut")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.category')">
						<span style="color: green">
							{{$t("util.projectRelease")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.status')">
						{{projectReleaseInfo?.status===ECommon_Model_Project_Release_Status.RELEASE?"Release":projectReleaseInfo?.status===ECommon_Model_Project_Release_Status.ARCHIVED?"Archived":"UnRelease"}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.start')">
						{{moment(projectReleaseInfo?.created_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.release')">
						{{moment(projectReleaseInfo?.release_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.project')">
						{{projectReleaseInfo?.projectName}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.organization')" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.BOARD_SPRINT">
					<a-descriptions-item :label="$t('util.name')">{{sprintInfo?.name}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.issues')">{{sprintInfo?.issues.length}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.swimLanes')">{{sprintInfo?.swimLanes.length}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.start')">
						{{moment(sprintInfo?.start_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.end')">
						{{moment(sprintInfo?.end_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.project')">
						{{sprintInfo?.project.name}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.organization')" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.WIKI">
					<a-descriptions-item :label="$t('util.name')">{{wikiInfo?.name}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.type')">
						<span style="color: blue">
							{{$t("util.shortcut")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.category')">
						<span style="color: green">
							{{$t("util.wikiProject")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.create')" v-if="wikiInfo">
						<UserAvatar :organization-user-id="wikiInfo?.created_by?.organizationUserId" :name="wikiInfo?.created_by.nickname" :photo="wikiInfo?.created_by.photo" :organization-id="wikiInfo?.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.wikiCount')">
						{{wikiInfo?.data.length}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.organization')" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM">
					<a-descriptions-item :label="$t('util.name')">{{wikiItemInfo?.name}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.type')">
						<span style="color: blue">
							{{$t("util.shortcut")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.category')">
						<span style="color: green">
							{{$t("util.wikiItem")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.create')" v-if="wikiItemInfo">
						<UserAvatar :organization-user-id="wikiItemInfo?.created_by.organizationUserId" :name="wikiItemInfo?.created_by.nickname" :photo="wikiItemInfo?.created_by.photo" :organization-id="wikiItemInfo?.wiki.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.wiki')">
						{{wikiItemInfo?.wiki.name}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.organization')" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT">
					<a-descriptions-item :label="$t('util.name')">{{calendarEventInfo?.name}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.type')">
						<span style="color: blue">
							{{$t("util.shortcut")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.category')">
						<span style="color: green">
							{{$t("util.calendarEvent")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.start')">
						{{moment(calendarEventInfo?.start_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.end')">
						{{moment(calendarEventInfo?.end_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.calendar')">
						{{calendarEventInfo?.calendarName}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.organization')" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM">
					<a-descriptions-item :label="$t('util.name')">{{meetingRoomInfo?.name}}</a-descriptions-item>
					<a-descriptions-item :label="$t('util.type')">
						<span style="color: blue">
							{{$t("util.shortcut")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.category')">
						<span style="color: green">
							{{$t("util.meeting")}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.start')">
						{{moment(meetingRoomInfo?.start_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.end')">
						{{moment(meetingRoomInfo?.end_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item :label="$t('util.organization')" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
			</template>
		</a-descriptions>
	</div>
</template>

<script setup lang="ts">
import {
	apiBoard,
	apiCalendar,
	apiFinder,
	apiIssue,
	apiMeeting,
	apiOrganization,
	apiProject,
	apiRelease,
	apiWiki
} from "../../../common/request/request";
import {
	ECommon_Model_Finder_Item_Type,
	ECommon_Model_Finder_Shortcut_Type,
	ICommon_Model_Finder_Item
} from "../../../../../../common/model/finder_item";
import {ref, watch} from "vue";
import {ICommon_Model_Organization} from "../../../../../../common/model/organization";
import {ICommon_Model_Project} from "../../../../../../common/model/project";
import {
	ECommon_Model_Project_Release_Status,
	ICommon_Model_Project_Release
} from "../../../../../../common/model/project_release";
import {ICommon_Model_Calendar_Event} from "../../../../../../common/model/calendar_event";
import {ICommon_Model_Meeting_Room} from "../../../../../../common/model/meeting_room";
import {
	ICommon_Route_Res_Board_Sprint_Info,
	ICommon_Route_Res_Finder_Info,
	ICommon_Route_Res_ProjectIssue_BasicInfo,
	ICommon_Route_Res_Wiki_Info,
	ICommon_Route_Res_Wiki_Item_Info
} from "../../../../../../common/routes/response";
import moment from "moment";
import UserAvatar from "../../../common/component/userAvatar.vue";
import FieldPriority from "../../../common/component/field/fieldPriority.vue";
import {Message} from "@arco-design/web-vue";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
	item:DCSType<ICommon_Model_Finder_Item>
}>()
const organizationInfo=ref<DCSType<ICommon_Model_Organization>>()
const projectInfo=ref<DCSType<ICommon_Model_Project>>()
const projectIssueInfo=ref<DCSType<ICommon_Route_Res_ProjectIssue_BasicInfo>>()
const projectReleaseInfo=ref<DCSType<ICommon_Model_Project_Release & {
	projectName:string
}>>()
const sprintInfo=ref<DCSType<ICommon_Route_Res_Board_Sprint_Info>>()
const wikiInfo=ref<DCSType<ICommon_Route_Res_Wiki_Info>>()
const wikiItemInfo=ref<DCSType<ICommon_Route_Res_Wiki_Item_Info>>()
const calendarEventInfo=ref<DCSType<ICommon_Model_Calendar_Event & {
	calendarName:string
}>>()
const meetingRoomInfo=ref<DCSType<ICommon_Model_Meeting_Room>>()
const folderInfo=ref<DCSType<ICommon_Route_Res_Finder_Info>>()
const fileInfo=ref<DCSType<ICommon_Route_Res_Finder_Info>>()
const refresh=async ()=>{
	if(!props.item || !props.item.id) {
		return
	} else if(props.item.type===ECommon_Model_Finder_Item_Type.FILE) {
		let res=await apiFinder.info({
			finderItemId:props.item.id
		})
		if(res?.code==0) {
			fileInfo.value=res.data
		}
	} else if(props.item.type===ECommon_Model_Finder_Item_Type.FOLDER) {
		let res=await apiFinder.info({
			finderItemId:props.item.id
		})
		if(res?.code==0) {
			folderInfo.value=res.data
		}
	}else if(props.item.type===ECommon_Model_Finder_Item_Type.SHORTCUT) {
		apiOrganization.info({
			organizationId:props.item.organization_id
		}).then(res=>{
			if(res?.code==0) {
				organizationInfo.value=res.data
			} else {
				organizationInfo.value={
					name:"UnKnown",
					id:null,
				} as any
			}
		})
		switch (props.item.shortcut_type) {
			case ECommon_Model_Finder_Shortcut_Type.PROJECT:{
				apiProject.basic({
					projectId:props.item.ref_id,
					...{
						organizationId:props.item.organization_id
					}
				}).then(res=>{
					if(res?.code==0) {
						projectInfo.value=res.data
					} else {
						Message.error(res?.msg)
					}
				})
				break
			}
			case ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE:{
				apiIssue.basicInfo({
					projectIssueId:props.item.ref_id,
					...{
						organizationId:props.item.organization_id
					}
				}).then(res=>{
					if(res?.code==0) {
						projectIssueInfo.value=res.data
					} else {
						Message.error(res?.msg)
					}
				})
				break
			}
			case ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE:{
				apiRelease.info({
					projectReleaseId:props.item.ref_id,
					...{
						organizationId:props.item.organization_id
					}
				}).then(async res=>{
					if(res?.code==0) {
						projectReleaseInfo.value={
							...res.data,
							projectName:(await apiProject.basic({
								projectId:res.data.project_id,
								...{
									organizationId:props.item.organization_id
								}
							})).data.name
						}
					} else {
						Message.error(res?.msg)
					}
				})
				break
			}
			case ECommon_Model_Finder_Shortcut_Type.BOARD_SPRINT:{
				apiBoard.sprintInfo({
					boardSprintId:props.item.ref_id,
					...{
						organizationId:props.item.organization_id
					}
				}).then(async res=>{
					if(res?.code==0) {
						sprintInfo.value=res.data
					} else {
						Message.error(res?.msg)
					}
				})
				break
			}
			case ECommon_Model_Finder_Shortcut_Type.WIKI:{
				apiWiki.wikiInfo({
					wikiId:props.item.ref_id,
					...{
						organizationId:props.item.organization_id
					}
				}).then(res=>{
					if(res?.code==0) {
						wikiInfo.value=res.data
					} else {
						Message.error(res?.msg)
					}
				})
				break
			}
			case ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM:{
				apiWiki.wikiItemInfo({
					wikiItemId:props.item.ref_id,
					...{
						organizationId:props.item.organization_id
					}
				}).then(res=>{
					if(res?.code==0) {
						wikiItemInfo.value=res.data
					} else {
						Message.error(res?.msg)
					}
				})
				break
			}
			case ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT:{
				apiCalendar.getCalendarEvent({
					calendarEventId:props.item.ref_id,
					...{
						organizationId:props.item.organization_id
					}
				}).then(async res=>{
					if(res?.code==0) {
						calendarEventInfo.value={
							...res.data,
							calendarName:(await apiCalendar.getCalendar({
								calendarId:res.data.calendar_id,
								...{
									organizationId:props.item.organization_id
								}
							})).data.name
						}
					} else {
						Message.error(res?.msg)
					}
				})
				break
			}
			case ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM:{
				apiMeeting.getRoom({
					meetingRoomId:props.item.ref_id,
					...{
						organizationId:props.item.organization_id
					}
				}).then(res=>{
					if(res?.code==0) {
						meetingRoomInfo.value=res.data
					} else {
						Message.error(res?.msg)
					}
				})
				break
			}
		}
	}
}
watch(()=>props.item,()=>{
	refresh()
},{
	immediate:true
})


const generateSizeFormat=(size:number)=>{
	if(size!=null) {
		if(size>1024*1024) {
			return (size/(1024*1024)).toFixed(2)+"MB"
		} else if(size>1024) {
			return (size/1024).toFixed(2)+"KB"
		} else {
			return size+"B"
		}
	}
}

const generatePathFormat=(pathList:{
	id:string,
	name:string
}[])=>{
	if(!pathList) {
		return ""
	}
	let arr=pathList.map(item=>{
		return item.name
	})
	return arr.join(" / ")
}
</script>

<style scoped>

</style>