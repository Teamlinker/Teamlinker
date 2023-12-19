<template xmlns="http://www.w3.org/1999/html">
	<div>
		<a-list hoverable>
			<a-list-item v-for="item in historyList">
				<div style="width: 100%;">
					<template v-if="item.type===ECommon_Model_Project_Issue_History_Type.CREATE_ISSUE">
						<div style="width: 100%;align-items: center;display: flex">
							<UserAvatar :organization-user-id="item.organization_user_id"></UserAvatar>&nbsp;
							{{$t("controller.app.project.issue.projectIssueHistory.createdTheIssue")}}&nbsp;
							<span style="color: grey">{{moment(item.created_time).format("YYYY-MM-DD HH:mm:ss")}}</span>
						</div>
					</template>
					<template v-else-if="item.type===ECommon_Model_Project_Issue_History_Type.APPROVAL_RESOLVE">
						<div style="width: 100%;align-items: center;display: flex">
							<UserAvatar :organization-user-id="item.organization_user_id"></UserAvatar>&nbsp;
							{{$t("controller.app.project.issue.projectIssueHistory.resolvedYourApproval")}}&nbsp;
							<span style="color: grey">{{moment(item.created_time).format("YYYY-MM-DD HH:mm:ss")}}</span>
						</div>
					</template>
					<template v-else-if="item.type===ECommon_Model_Project_Issue_History_Type.APPROVAL_REJECT">
						<div style="width: 100%;align-items: center;display: flex">
							<UserAvatar :organization-user-id="item.organization_user_id"></UserAvatar>&nbsp;
							{{$t("controller.app.project.issue.projectIssueHistory.rejectedYourApproval")}}&nbsp;
							<span style="color: grey">{{moment(item.created_time).format("YYYY-MM-DD HH:mm:ss")}}</span>
						</div>
					</template>
					<template v-else-if="item.type===ECommon_Model_Project_Issue_History_Type.UPDATE_FIELD">
						<div style="width: 100%;align-items: center;display: flex">
							<UserAvatar :organization-user-id="item.organization_user_id"></UserAvatar>&nbsp;
							{{$t("controller.app.project.issue.projectIssueHistory.updatedTheField")}}&nbsp;
							<span style="color: blue">
								{{item.name}}
							</span>&nbsp;
							<span style="color: grey">{{moment(item.created_time).format("YYYY-MM-DD HH:mm:ss")}}</span>
						</div>
						<div v-if="item.value" style="display: flex;align-items: center">
							{{$t("controller.app.project.issue.projectIssueHistory.newValue")}} :&nbsp;
							<UserAvatar v-if="/\d{19,}/.test(item.value)" :organization-user-id="item.value"></UserAvatar>
							<span v-else style="color: grey">{{item.value}}</span>
						</div>
					</template>
					<template v-else-if="item.type===ECommon_Model_Project_Issue_History_Type.UPDATE_NODE">
						<div style="width: 100%;align-items: center;display: flex">
							<UserAvatar :organization-user-id="item.organization_user_id"></UserAvatar>&nbsp;
							{{$t("controller.app.project.issue.projectIssueHistory.updatedTheWorkflow")}}&nbsp;
							<span style="color: #544646">
								{{item.name}}
							</span>&nbsp;
							<span style="color: grey">{{moment(item.created_time).format("YYYY-MM-DD HH:mm:ss")}}</span>
						</div>
						<div>
							{{$t("controller.app.project.issue.projectIssueHistory.newWorkflow")}} : <span style="color: grey">{{item.value}}</span>
						</div>
					</template>
					<template v-else-if="item.type===ECommon_Model_Project_Issue_History_Type.ISSUE_TYPE_CONVERT">
						<div style="width: 100%;align-items: center;display: flex">
							<UserAvatar :organization-user-id="item.organization_user_id"></UserAvatar>&nbsp;
							{{$t("controller.app.project.issue.projectIssueHistory.convertTheIssue")}}&nbsp;
							<span style="color: grey">{{moment(item.created_time).format("YYYY-MM-DD HH:mm:ss")}}</span>
						</div>
					</template>
				</div>
			</a-list-item>
		</a-list>
	</div>
</template>

<script setup lang="ts">
import {apiIssue} from "../../../../common/request/request";
import {onBeforeMount, ref} from "vue";
import {
	ECommon_Model_Project_Issue_History_Type,
	ICommon_Model_Project_Issue_History
} from "../../../../../../../common/model/project_issue_history";
import UserAvatar from "../../../../common/component/userAvatar.vue";
import moment from "moment";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	projectIssueId:string
}>()
const historyList=ref<DCSType<ICommon_Model_Project_Issue_History>[]>([])
const listHistory=async ()=>{
	let res=await apiIssue.listHistory({
		projectIssueId:props.projectIssueId
	})
	if(res?.code==0) {
		historyList.value=res.data
	}
}

onBeforeMount(()=>{
	listHistory()
})
</script>

<style scoped>

</style>