<template>
	<div style="width: 100%;padding-left: 5px;box-sizing: border-box">
		<a-descriptions style="margin-top: 10px;" title="Info" :column="1" :value-style="{wordBreak:'break-all'}">
			<template v-if="!item || !item.id">
				<a-descriptions-item label="name">Desktop</a-descriptions-item>
			</template>
			<template v-else-if="item.type===ECommon_Model_Finder_Item_Type.FILE">
				<a-descriptions-item label="name">{{fileInfo?.name}}</a-descriptions-item>
				<a-descriptions-item label="type">
					<span style="color: blue">
						File
					</span>
				</a-descriptions-item>
				<a-descriptions-item label="size">{{generateSizeFormat(fileInfo?.file.size)}}</a-descriptions-item>
				<a-descriptions-item label="date">{{moment(fileInfo?.created_time).format("YYYY-MM-DD HH:mm:ss")}}</a-descriptions-item>
				<a-descriptions-item label="path">
					{{generatePathFormat(fileInfo?.parentFolderList)}}
				</a-descriptions-item>
			</template>
			<template v-else-if="item.type===ECommon_Model_Finder_Item_Type.FOLDER">
				<a-descriptions-item label="name">{{folderInfo?.name}}</a-descriptions-item>
				<a-descriptions-item label="type">
					<span style="color: blue">
						Folder
					</span>
				</a-descriptions-item>
				<a-descriptions-item label="date">{{moment(folderInfo?.created_time).format("YYYY-MM-DD HH:mm:ss")}}</a-descriptions-item>
				<a-descriptions-item label="path">
					{{generatePathFormat(folderInfo?.parentFolderList)}}
				</a-descriptions-item>
			</template>
			<template v-else-if="item.type===ECommon_Model_Finder_Item_Type.SHORTCUT">
				<template v-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.PROJECT">
					<a-descriptions-item label="name">{{projectInfo?.name}}</a-descriptions-item>
					<a-descriptions-item label="type">
						<span style="color: blue">
							Shortcut
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="category">
						<span style="color: green">
							Project
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="key">{{projectInfo?.keyword}}</a-descriptions-item>
					<a-descriptions-item label="description" v-if="projectInfo?.description">
						<span style="line-clamp: 4;-webkit-box-orient: vertical;overflow: hidden;display: -webkit-box;-moz-box-orient: vertical;">
							{{projectInfo?.description}}
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="create" v-if="projectInfo">
						<UserAvatar :organization-user-id="projectInfo?.created_by.organizationUserId" :name="projectInfo?.created_by.nickname" :photo="projectInfo?.created_by.photo" :organization-id="projectInfo?.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item label="organization" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE">
					<a-descriptions-item label="name">{{projectIssueInfo?.name}}</a-descriptions-item>
					<a-descriptions-item label="type">
						<span style="color: blue">
							Shortcut
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="category">
						<span style="color: green">
							Project Issue
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="key">{{projectIssueInfo?.project.keyword+"-"+projectIssueInfo?.unique_id}}</a-descriptions-item>
					<a-descriptions-item label="priority" v-if="projectIssueInfo">
						<FieldPriority :priority="projectIssueInfo?.priority"></FieldPriority>
					</a-descriptions-item>
					<a-descriptions-item label="issue type">
						{{projectIssueInfo?.issueType.name}}
					</a-descriptions-item>
					<a-descriptions-item label="status">
						{{projectIssueInfo?.workflowNode.name}}
					</a-descriptions-item>
					<a-descriptions-item label="reporter" v-if="projectIssueInfo?.reporter_id">
						<UserAvatar :organization-user-id="projectIssueInfo?.reporter_id.organizationUserId" :name="projectIssueInfo?.reporter_id.nickname" :photo="projectIssueInfo?.reporter_id.photo" :organization-id="projectIssueInfo?.project.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item label="assigner" v-if="projectIssueInfo?.assigner_id">
						<UserAvatar :organization-user-id="projectIssueInfo?.assigner_id.organizationUserId" :name="projectIssueInfo?.assigner_id.nickname" :photo="projectIssueInfo?.assigner_id.photo" :organization-id="projectIssueInfo?.project.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item label="organization" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE">
					<a-descriptions-item label="name">{{projectReleaseInfo?.name}}</a-descriptions-item>
					<a-descriptions-item label="type">
						<span style="color: blue">
							Shortcut
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="category">
						<span style="color: green">
							Project Release
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="status">
						{{projectReleaseInfo?.status===ECommon_Model_Project_Release_Status.RELEASE?"Release":projectReleaseInfo?.status===ECommon_Model_Project_Release_Status.ARCHIVED?"Archived":"UnRelease"}}
					</a-descriptions-item>
					<a-descriptions-item label="start">
						{{moment(projectReleaseInfo?.created_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item label="release">
						{{moment(projectReleaseInfo?.release_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item label="project">
						{{projectReleaseInfo?.projectName}}
					</a-descriptions-item>
					<a-descriptions-item label="organization" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.WIKI">
					<a-descriptions-item label="name">{{wikiInfo?.name}}</a-descriptions-item>
					<a-descriptions-item label="type">
						<span style="color: blue">
							Shortcut
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="category">
						<span style="color: green">
							Wiki Project
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="create" v-if="wikiInfo">
						<UserAvatar :organization-user-id="wikiInfo?.created_by.organizationUserId" :name="wikiInfo?.created_by.nickname" :photo="wikiInfo?.created_by.photo" :organization-id="wikiInfo?.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item label="wiki count">
						{{wikiInfo?.data.length}}
					</a-descriptions-item>
					<a-descriptions-item label="organization" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM">
					<a-descriptions-item label="name">{{wikiItemInfo?.name}}</a-descriptions-item>
					<a-descriptions-item label="type">
						<span style="color: blue">
							Shortcut
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="category">
						<span style="color: green">
							Wiki Item
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="create" v-if="wikiItemInfo">
						<UserAvatar :organization-user-id="wikiItemInfo?.created_by.organizationUserId" :name="wikiItemInfo?.created_by.nickname" :photo="wikiItemInfo?.created_by.photo" :organization-id="wikiItemInfo?.wiki.organization_id"></UserAvatar>
					</a-descriptions-item>
					<a-descriptions-item label="wiki">
						{{wikiItemInfo?.wiki.name}}
					</a-descriptions-item>
					<a-descriptions-item label="organization" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT">
					<a-descriptions-item label="name">{{calendarEventInfo?.name}}</a-descriptions-item>
					<a-descriptions-item label="type">
						<span style="color: blue">
							Shortcut
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="category">
						<span style="color: green">
							Calendar Event
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="start">
						{{moment(calendarEventInfo?.start_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item label="end">
						{{moment(calendarEventInfo?.end_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item label="calendar">
						{{calendarEventInfo?.calendarName}}
					</a-descriptions-item>
					<a-descriptions-item label="organization" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
				<template v-else-if="item.shortcut_type===ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM">
					<a-descriptions-item label="name">{{meetingRoomInfo?.name}}</a-descriptions-item>
					<a-descriptions-item label="type">
						<span style="color: blue">
							Shortcut
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="category">
						<span style="color: green">
							Meeting
						</span>
					</a-descriptions-item>
					<a-descriptions-item label="start">
						{{moment(meetingRoomInfo?.start_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item label="end">
						{{moment(meetingRoomInfo?.end_time).format("YYYY-MM-DD HH:mm:ss")}}
					</a-descriptions-item>
					<a-descriptions-item label="organization" v-if="organizationInfo">
						{{organizationInfo.name}}
					</a-descriptions-item>
				</template>
			</template>
		</a-descriptions>
	</div>
</template>

<script setup lang="ts">
import {
	apiCalendar,
	apiFinder,
	apiIssue,
	apiMeeting,
	apiOrganization,
	apiProject,
	apiRelease,
	apiWiki,
	DCSType
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
	ICommon_Route_Res_Finder_Info,
	ICommon_Route_Res_ProjectIssue_BasicInfo,
	ICommon_Route_Res_Wiki_Info,
	ICommon_Route_Res_Wiki_Item_Info
} from "../../../../../../common/routes/response";
import moment from "moment";
import UserAvatar from "../../../common/component/userAvatar.vue";
import FieldPriority from "../../../common/component/field/fieldPriority.vue";

const props=defineProps<{
	item:DCSType<ICommon_Model_Finder_Item>
}>()
const organizationInfo=ref<DCSType<ICommon_Model_Organization>>()
const projectInfo=ref<DCSType<ICommon_Model_Project>>()
const projectIssueInfo=ref<DCSType<ICommon_Route_Res_ProjectIssue_BasicInfo>>()
const projectReleaseInfo=ref<DCSType<ICommon_Model_Project_Release & {
	projectName:string
}>>()
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