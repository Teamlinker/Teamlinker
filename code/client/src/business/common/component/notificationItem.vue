<template>
	<div style="display: flex;align-items: center;">
		<template v-if="obj.type===ECommon_Model_Notification_Type.TEAM_USER_ADD">
			TEAM:team
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onTeam">{{(obj.data as ICommon_Model_Team)?.name}}</a>
			&nbsp;&nbsp;
			has added you
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.WIKI_ITEM_AT">
			WIKI:you are mentioned in wiki item
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onWiki">{{(obj.data as ICommon_Model_Wiki_Item)?.name}}</a>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ORGANIZATION_USER_ROLE_CHANGE">
			ORGANIZATION:your organization role has been changed in organization {{(obj.data as ICommon_Model_Organization)?.name}}
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ORGANIZATION_USER_REMOVE">
			ORGANIZATION:you has been removed in organization {{(obj.data as ICommon_Model_Organization)?.name}}
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ORGANIZATION_USER_QUIT">
			ORGANIZATION: {{obj.extra}} quit the organization {{(obj.data as ICommon_Model_Organization)?.name}}
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ORGANIZATION_INVITATION">
			ORGANIZATION:organization {{(obj.data as ICommon_Model_Organization)?.name}} is inviting you
			<template v-if="obj.status===ECommon_Model_Notification_Status.PENDING">
				&nbsp;
				<a href="javascript:void(0)" @click="onAcceptOrganizationInvitation">{{$t("util.accept")}}</a>&nbsp;&nbsp;
				<a href="javascript:void(0)" style="color: red" @click="onRejectOrganizationInvitation">{{$t("util.reject")}}</a>&nbsp;
			</template>
			<template v-else-if="obj.status===ECommon_Model_Notification_Status.RESOLVED">
				&nbsp;&nbsp;
				<span style="color: blue">{{$t("util.accepted")}}</span>
			</template>
			<template v-else-if="obj.status===ECommon_Model_Notification_Status.REJECTED">
				&nbsp;&nbsp;
				<span style="color: red">{{$t("util.rejected")}}</span>
			</template>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_COMMENT_AT">
			ISSUE:you are mentioned by
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
			&nbsp;&nbsp;
			in issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
			&nbsp;&nbsp;
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.TEAM_DISMISS">
			TEAM:team {{obj.extra}} has been dismissed
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.TEAM_USER_REMOVE">
			TEAM:you have been removed by
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
			&nbsp;&nbsp;
			in team
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onTeam">{{(obj.data as ICommon_Model_Team)?.name}}</a>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.TEAM_USER_ROLE_CHANGE">
			TEAM:your team role has been changed in team
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onTeam">{{(obj.data as ICommon_Model_Team)?.name}}</a>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_REMOVE">
			ISSUE:{{obj.extra}} has been removed by
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.TEAM_USER_QUIT">
			TEAM:
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
			&nbsp;&nbsp;
			quit the team
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onTeam">{{(obj.data as ICommon_Model_Team)?.name}}</a>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN">
			ISSUE:
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
			&nbsp;&nbsp;
			assign the reporter of issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
			&nbsp;&nbsp;
			to you
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_WORKFLOW_CHANGE">
			ISSUE:the workflow of issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
			&nbsp;&nbsp;
			has been changed by
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_COMMENT_ADD">
			ISSUE:
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
			&nbsp;&nbsp;
			add a comment in issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.CALENDAR_EVENT_INVITATION">
			CALENDAR:you are invited in calendar event
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onCalendarEvent">{{(obj.data as ICommon_Model_Calendar_Event)?.name}}</a>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE">
			ISSUE:the field of issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
			&nbsp;&nbsp;
			has been changed by
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN">
			ISSUE:
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
			&nbsp;&nbsp;
			assign the assigner of issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
			&nbsp;&nbsp;
			to you
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_ASSIGN_RELEASE">
			ISSUE:the release of issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
			&nbsp;&nbsp;
			has been changed by
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_ASSIGN_SPRINT">
			ISSUE:the sprint of issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
			&nbsp;&nbsp;
			has been changed by
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_APPROVAL_RESOLVE">
			ISSUE:
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
			&nbsp;&nbsp;
			resolved the approval of issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_APPROVAL_REJECT">
			ISSUE:
			&nbsp;&nbsp;
			<UserAvatar :organization-user-id="obj.operationOrganizationUser.id" :name="obj.operationOrganizationUser.name" :photo="obj.operationOrganizationUser.photo" :organization-id="obj.organization_id"></UserAvatar>
			&nbsp;&nbsp;
			rejected the approval of issue
			&nbsp;&nbsp;
			<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
		</template>
	</div>
</template>

<script setup lang="ts">
import {apiNotification, DCSType} from "../request/request";
import {ICommon_Route_Res_Notification_Item} from "../../../../../common/routes/response";
import {
	ECommon_Model_Notification_Status,
	ECommon_Model_Notification_Type
} from "../../../../../common/model/notification";
import {ICommon_Model_Team} from "../../../../../common/model/team";
import {EClient_EVENTBUS_TYPE, eventBus} from "../event/event";
import {SessionStorage} from "../storage/session";
import {Message} from "@arco-design/web-vue";
import {ICommon_Model_Project_Issue} from "../../../../../common/model/project_issue";
import {ICommon_Model_Project} from "../../../../../common/model/project";
import {ICommon_Model_Wiki_Item} from "../../../../../common/model/wiki_item";
import {ICommon_Model_Calendar_Event} from "../../../../../common/model/calendar_event";
import {ICommon_Model_Organization} from "../../../../../common/model/organization";
import UserAvatar from "./userAvatar.vue";
import {Dialog} from "./dialog/dialog";
import {getCurrentInstance} from "vue";
import {useI18n} from "vue-i18n";

type ISSUE={
	issue:DCSType<ICommon_Model_Project_Issue>,
	project:DCSType<ICommon_Model_Project>
}
const props=defineProps<{
	obj:DCSType<ICommon_Route_Res_Notification_Item>
}>()
const appContext=getCurrentInstance().appContext
const {t}=useI18n()
const onTeam=()=>{
	const myOrganizationId=SessionStorage.get("organizationId")
	if(myOrganizationId===props.obj.organization_id) {
		let teamId=(props.obj.data as DCSType<ICommon_Model_Team>).id
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_TEAM_PROFILE,teamId)
	} else {
		Message.error(`you should switch to organization ${props.obj.organization.name}`)
	}
}

const onIssue=()=>{
	const myOrganizationId=SessionStorage.get("organizationId")
	if(myOrganizationId===props.obj.organization_id) {
		let projectIssueId=(props.obj.data as {
			issue:DCSType<ICommon_Model_Project_Issue>,
			project:DCSType<ICommon_Model_Project>
		}).issue.id
		let projectId=(props.obj.data as {
			issue:DCSType<ICommon_Model_Project_Issue>,
			project:DCSType<ICommon_Model_Project>
		}).project.id
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,projectIssueId)
	} else {
		Message.error(`you should switch to organization ${props.obj.organization.name}`)
	}
}

const onWiki=()=>{
	const myOrganizationId=SessionStorage.get("organizationId")
	if(myOrganizationId===props.obj.organization_id) {
		let wikiItemId=(props.obj.data as DCSType<ICommon_Model_Wiki_Item>).id
		let wikiId=(props.obj.data as DCSType<ICommon_Model_Wiki_Item>).wiki_id
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM,wikiId,wikiItemId)
	} else {
		Message.error(`you should switch to organization ${props.obj.organization.name}`)
	}
}

const onCalendarEvent=()=>{
	const myOrganizationId=SessionStorage.get("organizationId")
	if(myOrganizationId===props.obj.organization_id) {
		let calendarEventId=(props.obj.data as DCSType<ICommon_Model_Calendar_Event>).id
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,calendarEventId)
	} else {
		Message.error(`you should switch to organization ${props.obj.organization.name}`)
	}
}

const onAcceptOrganizationInvitation=async ()=>{
	let ret=await Dialog.confirm(document.body,appContext,t("tip.acceptInvitation"))
	if(ret) {
		let res=await apiNotification.setStatus({
			notificationId:props.obj.id,
			status:ECommon_Model_Notification_Status.RESOLVED
		})
		if(res?.code==0) {
			props.obj.status=ECommon_Model_Notification_Status.RESOLVED
			Message.success(t("util.accepted"))
			setTimeout(()=>{
				eventBus.emit(EClient_EVENTBUS_TYPE.REFRESH_ORGANIZATION_LIST)
			},1000)
		} else {
			Message.error(res.msg)
		}
	}
}

const onRejectOrganizationInvitation=async()=>{
	let ret=await Dialog.confirm(document.body,appContext,t("tip.rejectInvitation"))
	if(ret) {
		let res=await apiNotification.setStatus({
			notificationId:props.obj.id,
			status:ECommon_Model_Notification_Status.REJECTED
		})
		if(res?.code==0) {
			props.obj.status=ECommon_Model_Notification_Status.REJECTED
			Message.success(t("util.rejected"))
		} else {
			Message.error(res.msg)
		}
	}
}
</script>

<style scoped>

</style>