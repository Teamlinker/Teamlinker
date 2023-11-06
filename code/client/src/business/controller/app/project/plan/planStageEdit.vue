<template>
	<a-form auto-label-width :model="form" ref="eleForm">
		<a-form-item field="name" :label="$t('util.name')" required>
			<a-input v-model="form.name"></a-input>
		</a-form-item>
		<a-form-item field="dependId" :label="$t('util.depend')">
			<a-select allow-clear allow-search v-model="form.dependId">
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
import {apiPlan} from "@/business/common/request/request";

const props=defineProps<{
	type:"add"|"edit",
	item?:GanttDataItem,
	planId:string,
	dependList:GanttDataItem[],
	parentId?:string
}>()
const form=reactive({
	id:props.type==="edit"?props.item.key:"",
	name:props.type==="edit"?props.item.name:"",
	delay:props.type==="edit"?props.item.delay:0,
	dependId:props.type==="edit"?props.item.depend:""
})
const eleForm=ref()

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return props.type=="add"?apiPlan.createStage({
			planId:props.planId,
			name:form.name,
			dependId:form.dependId,
			delay:form.delay,
			parentId:props.parentId
		}):apiPlan.editStage({
			planItemId:form.id,
			name:form.name,
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