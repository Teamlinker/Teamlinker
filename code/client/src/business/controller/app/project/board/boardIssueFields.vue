<template>
	<div style="padding: 0 10px">
		<a-form  :model="form" ref="eleForm" auto-label-width>
			<a-form-item :label="$t('util.action')" field="actionId" required>
				<a-select v-model="form.actionId" @change="onChange">
					<a-option v-for="item in workflowActionList" :label="item.name" :value="item.id"></a-option>
				</a-select>
			</a-form-item>
			<a-divider orientation="left" v-if="valueList.length>0">
				{{$t("util.fields")}}
			</a-divider>
			<a-form-item v-for="value in valueList" :key="value.field.id" :label="value.field.name" :extra="value.field.description" :field="value.field.name" :required="!value.field.optional">
				<FieldInput :item="value" :project-id="projectId"></FieldInput>
			</a-form-item>
		</a-form>
	</div>
</template>

<script setup lang="ts">
import {ICommon_Model_Workflow_Action} from "../../../../../../../common/model/workflow_action";
import FieldInput from "@/business/common/component/field/fieldInput.vue";
import {reactive, ref, toRef} from "vue";
import {apiIssue} from "@/business/common/request/request";
import {
	ICommon_Route_Req_ProjectIssue_Field,
	ICommon_Route_Res_Workflow_Node_Field
} from "../../../../../../../common/routes/response";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	projectId:string,
	projectIssueId :string,
	workflowActionList:ICommon_Model_Workflow_Action[]
}>()

const eleForm=ref(null);
const valueList=ref<DCSType<(ICommon_Route_Res_Workflow_Node_Field & {
	fieldValue:ICommon_Route_Req_ProjectIssue_Field
})>[]>([])
const form=reactive({
	actionId:""
})


const onChange=async ()=>{
	let res=await apiIssue.getNextNodeFields({
		projectIssueId:props.projectIssueId,
		workflowActionId:form.actionId
	})
	if(res?.code==0) {
		valueList.value=res.data.map(item=>{
			return {
				...item,
				fieldValue:{
					fieldId:item.field.id,
					value:null
				}
			}
		})
		valueList.value.forEach(item=>{
			form[item.field.name]=toRef(item.fieldValue,"value")
		})
	}
}

onDialogOk(dialogFuncGenerator({
	func:async ()=>{
		let res=await apiIssue.confirmNextNode({
			projectIssueId:props.projectIssueId,
			workflowActionId:form.actionId,
			values:valueList.value.map(item=>item.fieldValue)
		})
		return res;
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>