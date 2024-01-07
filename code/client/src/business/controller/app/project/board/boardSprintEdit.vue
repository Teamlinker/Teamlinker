<template>
	<a-form :model="form" ref="eleForm">
		<a-form-item :label="$t('util.name')" field="name" required>
			<a-input v-model="form.name"></a-input>
		</a-form-item>
		<a-form-item :label="$t('util.dateRange')" field="dateRange" required>
			<a-range-picker v-model="form.dateRange" :placeholder="[$t('util.startDate'),$t('util.endDate')]"></a-range-picker>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {apiBoard} from "../../../../common/request/request";
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {ICommon_Model_Board_Sprint} from "../../../../../../../common/model/board_sprint";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	type:"add"|"edit",
	boardId:string,
	item?:DCSType<ICommon_Model_Board_Sprint>
}>()
const form=reactive({
	name:props.type=="edit"?props.item.name:"",
	dateRange:props.type=="edit"?[props.item.start_time,props.item.end_time]:["",""],
})
const eleForm=ref(null)

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return props.type=="add"?apiBoard.createSprint({
			boardId:props.boardId,
			name:form.name,
			startTime:form.dateRange[0],
			endTime:form.dateRange[1]
		}):apiBoard.editSprint({
			boardSprintId:props.item.id,
			name:form.name,
      startTime:form.dateRange[0],
      endTime:form.dateRange[1]
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>