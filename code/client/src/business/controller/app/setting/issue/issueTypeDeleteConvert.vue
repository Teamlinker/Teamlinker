<template>
	<a-form :model="form" ref="eleForm" style="width: 80%" auto-label-width>
		<a-form-item field="issueTypeId" :label="$t('util.issueType')" required>
			<a-select v-model="form.issueTypeId">
				<a-option v-for="item in issueTypeList" :value="item.id" :label="item.name"></a-option>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {apiIssueType} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	issueTypeId:string,
	issueTypeSolutionId:string
}>()
const eleForm=ref(null)
const form=reactive({
	issueTypeId:""
})
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])

const getIssueTypeList=async ()=>{
	let res=await apiIssueType.list({
		issueTypeSolutionId:props.issueTypeSolutionId
	});
	if(res?.code==0) {
		issueTypeList.value=res.data.filter(item=>item.id!==props.issueTypeId)
	}
}

onBeforeMount(()=>{
	getIssueTypeList()
})

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return apiIssueType.delete({
			issueTypeId:props.issueTypeId,
			convertIssueTypeId:form.issueTypeId
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>