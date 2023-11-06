<template>
	<a-form auto-label-width :model="form" ref="eleForm">
		<a-form-item field="name" :label="$t('util.name')" required>
			<a-input v-model="form.name"></a-input>
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
	parentId?:string
}>()
const form=reactive({
	id:props.type==="edit"?props.item.key:"",
	name:props.type==="edit"?props.item.name:"",
})
const eleForm=ref()

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return props.type=="add"?apiPlan.createMileStone({
			planId:props.planId,
			name:form.name,
			parentId:props.parentId
		}):apiPlan.editMileStone({
			planItemId:form.id,
			name:form.name,
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>