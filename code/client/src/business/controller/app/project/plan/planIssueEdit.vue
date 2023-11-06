<template>
	<a-form auto-label-width :model="form" ref="eleForm">
		<a-form-item field="projectIssueId" :label="$t('util.issue')" required v-if="type==='add'">
			<a-select v-model="form.projectIssueId" @search="onSearch" allow-search>
				<a-option v-for="item in issueList" :value="item.id">
					{{item.project.keyword}}-{{item.unique_id}}&nbsp;{{item.name}}
				</a-option>
			</a-select>
		</a-form-item>
		<a-form-item field="manDay" :label="$t('util.manDay')" v-if="type==='edit'">
			<a-input-number v-model="form.manDay" :min="1" :max="100" :precision="0"></a-input-number>
		</a-form-item>
		<a-form-item field="dependId" :label="$t('util.depend')">
			<a-select v-model="form.dependId" allow-clear>
				<a-option v-for="item in dependList" :label="item.name" :value="item.key"></a-option>
			</a-select>
		</a-form-item>
		<a-form-item field="delay" :label="$t('util.delay')">
			<a-input-number :precision="0" :min="-100" :max="100" v-model="form.delay"></a-input-number>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {GanttDataItem} from "@/business/common/component/gantt/types";
import {reactive, ref} from "vue";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";
import {apiIssue, apiPlan} from "@/business/common/request/request";
import {DCSType} from "../../../../../../../common/types";
import {ICommon_Route_Res_Project_Issue_filter_Item} from "../../../../../../../common/routes/response";

const props=defineProps<{
	projectId:string,
	type:"add"|"edit",
	item?:GanttDataItem,
	planId:string,
	dependList:GanttDataItem[],
	parentId?:string
}>()
const form=reactive({
	id:props.type==="edit"?props.item.key:"",
	delay:props.type==="edit"?props.item.delay:0,
	dependId:props.type==="edit"?props.item.depend:"",
	manDay:props.type==="edit"?props.item.manDay:1,
	projectIssueId:props.type==="edit"?props.item.projectIssueId:"",
})
const eleForm=ref()
const issueList=ref<DCSType<ICommon_Route_Res_Project_Issue_filter_Item>[]>([])

const onSearch=async (keyword:string)=>{
	let res=await apiIssue.filter({
		projectId:props.projectId,
		name:keyword,
		page:0,
		size:20
	})
	if(res?.code==0) {
		issueList.value=res.data.data
	}
}

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return props.type=="add"?apiPlan.addIssue({
			planId:props.planId,
			projectIssueId:form.projectIssueId,
			dependId:form.dependId,
			delay:form.delay,
			parentId:props.parentId
		}):apiPlan.editIssue({
			planItemId:form.id,
			manDay:form.manDay,
			delay:form.delay,
			dependId:form.dependId
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>