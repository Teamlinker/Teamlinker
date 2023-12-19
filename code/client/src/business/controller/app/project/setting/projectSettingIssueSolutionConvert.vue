<template>
	<a-form :model="form" ref="formEle" auto-label-width>
		<a-form-item v-for="item in originalIssueTypeList" :key="item.id" :field="item.id" :label="item.name+' -> '" required>
			<a-select v-model="form[item.id]" style="width: 50%">
				<a-option v-for="item in newIssueTypeList" :key="item.id" :value="item.id" :label="item.name"></a-option>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {apiIssueType} from "@/business/common/request/request";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";
import {Message} from "@arco-design/web-vue";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	originalIssueTypeSolutionId?:string,
	newIssueTypeSolutionId?:string,
	projectId:string
}>()
const originalIssueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const newIssueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const form=reactive({})
const formEle=ref(null)
let newIssueTypeSolutionId=props.newIssueTypeSolutionId
const getOriginIssueSolutionList=async ()=>{
	let res=await apiIssueType.list({
		issueTypeSolutionId:props.originalIssueTypeSolutionId
	});
	if(res?.code==0) {
		originalIssueTypeList.value=res.data
		originalIssueTypeList.value.forEach(item=>{
			form[item.id]=null
		})
	}
}

const getNewIssueSolutionList=async ()=>{
	if(!newIssueTypeSolutionId) {
		let res=await apiIssueType.reserved()
		if(res?.code==0) {
			newIssueTypeSolutionId=res.data.id
		} else {
			Message.error(res.msg)
			return
		}
	}
	let res=await apiIssueType.list({
		issueTypeSolutionId:newIssueTypeSolutionId
	});
	if(res?.code==0) {
		newIssueTypeList.value=res.data
	}
}

onBeforeMount(()=>{
	getOriginIssueSolutionList()
	getNewIssueSolutionList()
})

onDialogOk(dialogFuncGenerator({
	form:()=>{
		return formEle.value
	},
	func:()=>{
		return apiIssueType.solutionBindProject({
			projectId:props.projectId,
			issueTypeSolutionId:newIssueTypeSolutionId,
			relationship:form
		})
	}
}))
</script>

<style scoped>

</style>