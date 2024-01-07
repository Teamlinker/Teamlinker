<template>
	<a-form :model="form" ref="eleForm" style="width: 80%" auto-label-width>
		<a-form-item field="issueTypeSolutionId" :label="$t('util.issueSolution')" required>
			<a-select @search="onSearch" v-model="form.issueTypeSolutionId" allow-search @change="onChange">
				<a-option v-for="item in issueTypeSolutionList" :value="item.id" :label="item.name"></a-option>
			</a-select>
		</a-form-item>
		<a-form-item v-for="item in currentIssueTypeList" :key="item.id" :field="item.id" :label="item.name+' -> '" required>
			<a-select v-model="form[item.id]">
				<a-option v-for="item in newIssueTypeList" :key="item.id" :value="item.id" :label="item.name"></a-option>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {apiIssueType, apiProject} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import projectList from "@/business/controller/app/setting/role/project/projectList.vue";
import {ICommon_Model_Issue_Type_Solution} from "../../../../../../../common/model/issue_type_solution";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	issueTypeSolutionId:string
}>()
const eleForm=ref(null)
const form=reactive({
	issueTypeSolutionId:""
})
const issueTypeSolutionList=ref<DCSType<ICommon_Model_Issue_Type_Solution>[]>([])
const currentIssueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const newIssueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const onSearch=async (value:string)=>{
	let res=await apiProject.list({
		page:0,
		size:20,
		keyword:value
	})
	if(res?.code==0) {
		projectList.value=res.data.data
	}
}

const onChange=async ()=>{
	let res=await apiIssueType.list({
		issueTypeSolutionId:form.issueTypeSolutionId
	})
	if(res?.code==0) {
		newIssueTypeList.value=res.data
		newIssueTypeList.value.forEach(item=>{
			form[item.id]=null
		})
	}
}

const getCurrentIssueTypeList=async ()=>{
	let res=await apiIssueType.list({
		issueTypeSolutionId:props.issueTypeSolutionId
	})
	if(res?.code==0) {
		currentIssueTypeList.value=res.data
	}
}

const getIssueSolutionList=async ()=>{
	let res=await apiIssueType.solutionList();
	if(res?.code==0) {
		issueTypeSolutionList.value=res.data.filter(item=>item.id!==props.issueTypeSolutionId)
	}
}

onBeforeMount(()=>{
	getCurrentIssueTypeList()
	getIssueSolutionList()
})

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return apiIssueType.solutionDelete({
			issueTypeSolutionId:props.issueTypeSolutionId,
			relationship:Object.fromEntries(Object.entries(form).filter(value=>{
				if(value[0]!="issueTypeSolutionId") {
					return true
				}
			}))
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>