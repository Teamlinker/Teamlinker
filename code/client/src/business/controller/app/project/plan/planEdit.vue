<template>
	<a-form :model="form" ref="eleForm">
		<a-form-item :label="$t('util.name')" field="name" required>
			<a-input v-model="form.name"></a-input>
		</a-form-item>
		<a-form-item :label="$t('util.startDate')" field="startTime">
			<a-date-picker v-model="form.startTime"></a-date-picker>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {apiPlan} from "../../../../common/request/request";
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {DCSType} from "../../../../../../../common/types";
import {ICommon_Model_Plan} from "../../../../../../../common/model/plan";
import moment from "moment";

const props=defineProps<{
	type:"add"|"edit",
	projectId?:string,
	item?:DCSType<ICommon_Model_Plan>
}>()
const form=reactive({
	name:props.type=="edit"?props.item.name:"",
	startTime:props.type==="edit"?moment(props.item.start_time).toDate().getTime():moment().startOf("day").toDate().getTime()
})
const eleForm=ref(null)

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return props.type=="add"?apiPlan.createPlan({
			projectId:props.projectId,
			name:form.name,
			startTime:moment(form.startTime).startOf("day").toDate().getTime()
		}):apiPlan.editPlan({
			planId:props.item.id,
			name:form.name,
			startTime:moment(form.startTime).startOf("day").toDate().getTime()
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>