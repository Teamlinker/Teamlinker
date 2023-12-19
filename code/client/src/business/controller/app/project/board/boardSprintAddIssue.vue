<template>
	<a-form :model="form" ref="eleForm" auto-label-width>
		<a-form-item :label="$t('util.issueTypes')">
			<a-space>
				<a-tag v-for="item in issueTypeList">
					{{item.name}}
				</a-tag>
			</a-space>
		</a-form-item>
		<a-form-item field="issues" :label="$t('util.issues')" required>
			<a-select multiple allow-search v-model="form.issues" @search="onSearch">
				<a-option v-for="item in issueList" :value="item.id">
					{{item.project.keyword}}-{{item.unique_id}}&nbsp;{{item.name}}
				</a-option>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {apiBoard, apiIssue} from "@/business/common/request/request";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {ICommon_Route_Res_Project_Issue_filter_Item} from "../../../../../../../common/routes/response";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	boardSprintId:string,
	boardId:string,
	projectId:string
}>()
const form=reactive({
	issues:[]
})
const eleForm=ref()
const {t}=useI18n()
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const issueList=ref<DCSType<ICommon_Route_Res_Project_Issue_filter_Item>[]>([])
const getIssueTypeList=async ()=>{
	let res=await apiBoard.listIssueType({
		boardId:props.boardId
	})
	if(res?.code==0) {
		issueTypeList.value=res.data
	}
}

const onSearch=async (keyword:string)=>{
	let res=await apiIssue.filter({
		projectId:props.projectId,
		name:keyword,
		page:0,
		size:20
	})
	if(res?.code==0) {
		let issueTypeIds=issueTypeList.value.map(item=>item.id)
		issueList.value=res.data.data.filter(item=>issueTypeIds.includes(item.issueType.id))
	}
}

onBeforeMount(()=>{
	getIssueTypeList()
})

onDialogOk(dialogFuncGenerator({
	form:()=>{
		return eleForm.value
	},
	func:()=>{
		if(form.issues.length==0) {
			Message.error(t("tip.issueShouldNotBeEmpty"))
			return false
		}
		return apiBoard.addSprintIssues({
			projectIssueIds:form.issues,
			boardSprintId:props.boardSprintId
		})
	}
}))
</script>

<style scoped>

</style>