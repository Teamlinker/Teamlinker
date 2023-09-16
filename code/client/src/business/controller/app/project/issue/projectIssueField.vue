<template>
	<div class="issueProfileDetail">
		<a-collapse :default-active-key="['detail']">
			<a-collapse-item key="detail" :header="$t('util.detail')">
				<a-form layout="vertical" :model="{}">
					<a-form-item :label="$t('util.issueType')">
						{{info.issueType.name}}
					</a-form-item>
					<a-form-item :label="$t('util.assigner')">
						<FieldEditBasic :project-issue-id="info.id" :type="EClient_Field_Basic_Type.ASSIGNER" :value="info.assigner_id"></FieldEditBasic>
					</a-form-item>
					<a-form-item :label="$t('util.reporter')">
						<FieldEditBasic :project-issue-id="info.id" :type="EClient_Field_Basic_Type.REPORTER" :value="info.reporter_id"></FieldEditBasic>
					</a-form-item>
					<a-form-item :label="$t('util.priority')">
						<FieldEditBasic :project-issue-id="info.id" :type="EClient_Field_Basic_Type.PRIORITY" :value="info.priority"></FieldEditBasic>
					</a-form-item>
					<a-form-item :label="$t('util.module')">
						<FieldEditBasic :project-issue-id="info.id" :type="EClient_Field_Basic_Type.MODULE" :value="moduleList"></FieldEditBasic>
					</a-form-item>
					<a-form-item :label="$t('util.label')">
						<FieldEditBasic :project-issue-id="info.id" :type="EClient_Field_Basic_Type.LABEL" :value="labelList"></FieldEditBasic>
					</a-form-item>
					<a-form-item :label="$t('util.fixVersions')">
						<FieldEditBasic :project-issue-id="info.id" :type="EClient_Field_Basic_Type.FIXVERSIONS" :value="releaseList"></FieldEditBasic>
					</a-form-item>
					<a-form-item :label="$t('util.sprint')">
						<FieldEditBasic :project-issue-id="info.id" :type="EClient_Field_Basic_Type.SPRINT" :value="sprintInfo"></FieldEditBasic>
					</a-form-item>
				</a-form>
			</a-collapse-item>
			<a-collapse-item key="more" :header="$t('util.more')">
				<a-form layout="vertical" :model="{}" v-if="fieldList.length>0">
					<a-form-item v-for="item in fieldList" :label="item.nodeField.field.name" :key="item.issueFieldValue.id">
						<FieldEdit :item="item"></FieldEdit>
					</a-form-item>
				</a-form>
			</a-collapse-item>
		</a-collapse>
		<a-row style="margin-top: 10px;color: grey;font-size: 12px;line-height: 1.3;padding-left: 5px;margin-bottom: 10px">
			{{$t("util.created")}} {{moment(info.created_time).format('YYYY-MM-DD HH:mm:ss')}}
		</a-row>
	</div>
</template>

<script setup lang="ts">

import {EClient_Field_Basic_Type} from "../../../../common/component/field/fieldBasicType";
import moment from "moment/moment";
import FieldEdit from "../../../../common/component/field/fieldEdit.vue";
import FieldEditBasic from "../../../../common/component/field/fieldEditBasic.vue";
import {apiBoard, apiIssue, DCSType} from "../../../../common/request/request";
import {
	ICommon_Route_Res_ProjectIssue_BasicInfo,
	ICommon_Route_Res_ProjectIssue_fieldsInfo
} from "../../../../../../../common/routes/response";
import {onBeforeMount, ref} from "vue";
import {ICommon_Model_Project_Label} from "../../../../../../../common/model/project_label";
import {ICommon_Model_Project_Module} from "../../../../../../../common/model/project_module";
import {ICommon_Model_Project_Release} from "../../../../../../../common/model/project_release";

const props=defineProps<{
	info:DCSType<ICommon_Route_Res_ProjectIssue_BasicInfo>,
	moduleList:DCSType<ICommon_Model_Project_Module>[],
	labelList:DCSType<ICommon_Model_Project_Label>[],
	fieldList:ICommon_Route_Res_ProjectIssue_fieldsInfo[]
}>()
const releaseList=ref<DCSType<ICommon_Model_Project_Release>[]>([])
const sprintInfo=ref<{
	id:string,
	name:string
}>()
const getReleaseList=async ()=>{
	let res=await apiIssue.releaseList({
		projectIssueId:props.info.id
	})
	if(res?.code==0) {
		releaseList.value=res.data
	}
}

const getSprintInfo=async ()=>{
	let res=await apiBoard.getIssueSprint({
		projectIssueId:props.info.id
	})
	if(res?.code==0) {
		if(res.data) {
			sprintInfo.value={
				id:res.data.id,
				name:res.data.name
			}
		}
	}
}

onBeforeMount(()=>{
	getReleaseList()
	getSprintInfo()
})

</script>

<style scoped>
.issueProfileDetail :deep(div[role="region"]) {
	background-color: white !important;
	padding-left: 5px;
	padding-right: 0px;
}
.issueProfileDetail :deep .arco-form-item {
	margin-bottom: 10px;
}
.issueProfileDetail :deep .arco-form-item-label {
	font-weight: bold;
}
</style>