<template>
	<a-form :model="form" ref="eleForm">
		<a-form-item :label="$t('util.name')" field="name" required>
			<a-input v-model="form.name"></a-input>
		</a-form-item>
		<a-form-item :label="$t('util.description')" field="description">
			<a-textarea v-model="form.description" allow-clear></a-textarea>
		</a-form-item>
		<a-form-item :label="$t('util.issueType')" field="issueTypeIds" v-if="type=='add'" :extra="$t('help.boardIssueType')">
			<a-select v-model="form.issueTypeIds" multiple>
				<a-option v-for="item in issueTypeList" :value="item.id" :label="item.name"></a-option>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {apiBoard, apiProject} from "../../../../common/request/request";
import {onBeforeMount, reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {ICommon_Model_Board} from "../../../../../../../common/model/board";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	type:"add"|"edit",
	projectId?:string,
	item?:DCSType<ICommon_Model_Board>
}>()
const form=reactive({
	name:props.type=="edit"?props.item.name:"",
	description:props.type=="edit"?props.item.description:"",
	...(props.type==="add" && {
		issueTypeIds:[]
	})
})
const eleForm=ref(null)
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])

const getIssueTypeList=async ()=>{
	let res=await apiProject.issueTypeList({
		projectId:props.projectId
	})
	if(res?.code==0) {
		issueTypeList.value=res.data
	}
}

onBeforeMount(()=>{
	getIssueTypeList()
})

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return props.type=="add"?apiBoard.createBoard({
			projectId:props.projectId,
			name:form.name,
			description:form.description,
			...(form.issueTypeIds.length>0 && {
				issueTypeIds:form.issueTypeIds
			})
		}):apiBoard.editBoard({
			boardId:props.item.id,
			name:form.name,
			description:form.description
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>