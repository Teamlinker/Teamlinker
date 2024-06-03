<template>
	<div style="display: flex;align-items: center;">
		<template v-if="obj.type===ECommon_Model_Notification_Type.TEAM_USER_ADD">
			<i18n-t keypath="notification.teamUserAdd" tag="span">
				<template #team>
					<a href="javascript:void(0)" @click="onTeam">{{(obj.data as ICommon_Model_Team)?.name}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.WIKI_ITEM_AT">
			<i18n-t keypath="notification.wikiItemAt" tag="span">
				<template #wiki>
					<a href="javascript:void(0)" @click="onWiki">{{(obj.data as ICommon_Model_Wiki_Item)?.name}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ORGANIZATION_USER_ROLE_CHANGE">
			<i18n-t keypath="notification.organizationUserRoleChange" tag="span">
				<template #organization>
					{{(obj.data as ICommon_Model_Organization)?.name}}
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ORGANIZATION_USER_REMOVE">
			<i18n-t keypath="notification.organizationUserRemove" tag="span">
				<template #organization>
					{{(obj.data as ICommon_Model_Organization)?.name}}
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ORGANIZATION_USER_QUIT">
			<i18n-t keypath="notification.organizationUserQuit" tag="span">
				<template #user>
					{{obj.extra}}
				</template>
				<template #organization>
					{{(obj.data as ICommon_Model_Organization)?.name}}
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ORGANIZATION_INVITATION">
			<i18n-t keypath="notification.organizationInvitation" tag="span">
				<template #organization>
					{{(obj.data as ICommon_Model_Organization)?.name}}
				</template>
			</i18n-t>
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
			<i18n-t keypath="notification.issueCommentAt" tag="span">
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.TEAM_DISMISS">
			<i18n-t keypath="notification.teamDismiss" tag="span">
				<template #team>
					{{obj.extra}}
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.TEAM_USER_REMOVE">
			<i18n-t keypath="notification.teamUserRemove" tag="span">
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
				<template #team>
					<a href="javascript:void(0)" @click="onTeam">{{(obj.data as ICommon_Model_Team)?.name}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.TEAM_USER_ROLE_CHANGE">
			<i18n-t keypath="notification.teamUserRoleChange" tag="span">
				<template #team>
					<a href="javascript:void(0)" @click="onTeam">{{(obj.data as ICommon_Model_Team)?.name}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_REMOVE">
			<i18n-t keypath="notification.issueRemove" tag="span">
				<template #issue>
					{{obj.extra}}
				</template>
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.TEAM_USER_QUIT">
			<i18n-t keypath="notification.teamUserQuit" tag="span">
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
				<template #team>
					<a href="javascript:void(0)" @click="onTeam">{{(obj.data as ICommon_Model_Team)?.name}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN">
			<i18n-t keypath="notification.issueReporterAssign" tag="span">
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_WORKFLOW_CHANGE">
			<i18n-t keypath="notification.issueWorkflowChange" tag="span">
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_COMMENT_ADD">
			<i18n-t keypath="notification.issueCommentAdd" tag="span">
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.CALENDAR_EVENT_INVITATION">
			<i18n-t keypath="notification.calendarEventInvitation" tag="span">
				<template #event>
					<a href="javascript:void(0)" @click="onCalendarEvent">{{(obj.data as ICommon_Model_Calendar_Event)?.name}}</a>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE">
			<i18n-t keypath="notification.issueFieldChange" tag="span">
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN">
			<i18n-t keypath="notification.issueAssignerAssign" tag="span">
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_ASSIGN_RELEASE">
			<i18n-t keypath="notification.issueAssignRelease" tag="span">
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_ASSIGN_SPRINT">
			<i18n-t keypath="notification.issueAssignSprint" tag="span">
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_APPROVAL_RESOLVE">
			<i18n-t keypath="notification.issueApprovalResolve" tag="span">
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
			</i18n-t>
		</template>
		<template v-else-if="obj.type===ECommon_Model_Notification_Type.ISSUE_APPROVAL_REJECT">
			<i18n-t keypath="notification.issueApprovalReject" tag="span">
				<template #issue>
					<a href="javascript:void(0)" @click="onIssue">{{(obj.data as ISSUE)?.project.keyword}}-{{(obj.data as ISSUE)?.issue.unique_id}}</a>
				</template>
				<template #user>
					<UserAvatar :organization-user-id="obj.operationOrganizationUser?.id" :name="obj.operationOrganizationUser?.name" :photo="obj.operationOrganizationUser?.photo" :organization-id="obj.organization_id"></UserAvatar>
				</template>
			</i18n-t>
		</template>
	</div>
</template>

<script setup lang="ts">
import {apiNotification} from "../request/request";
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
import {DCSType} from "../../../../../common/types";

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
		Message.error(`${t("tip.switchToOrganization")}${props.obj.organization.name}`)
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
		Message.error(`${t("tip.switchToOrganization")}${props.obj.organization.name}`)
	}
}

const onWiki=()=>{
	const myOrganizationId=SessionStorage.get("organizationId")
	if(myOrganizationId===props.obj.organization_id) {
		let wikiItemId=(props.obj.data as DCSType<ICommon_Model_Wiki_Item>).id
		let wikiId=(props.obj.data as DCSType<ICommon_Model_Wiki_Item>).wiki_id
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM,wikiId,wikiItemId)
	} else {
		Message.error(`${t("tip.switchToOrganization")}${props.obj.organization.name}`)
	}
}

const onCalendarEvent=()=>{
	const myOrganizationId=SessionStorage.get("organizationId")
	if(myOrganizationId===props.obj.organization_id) {
		let calendarEventId=(props.obj.data as DCSType<ICommon_Model_Calendar_Event>).id
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,calendarEventId)
	} else {
		Message.error(`${t("tip.switchToOrganization")}${props.obj.organization.name}`)
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
			Message.success(t("tip.accepted"))
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
			Message.success(t("tip.rejected"))
		} else {
			Message.error(res.msg)
		}
	}
}
</script>

<style scoped>

</style>