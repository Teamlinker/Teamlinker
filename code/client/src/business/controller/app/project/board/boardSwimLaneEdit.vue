<template>
	<a-form :model="form" ref="eleForm">
		<a-form-item label="name" field="name" required>
			<a-input v-model="form.name"></a-input>
		</a-form-item>
		<a-form-item label="priority" field="priority" required>
			<a-select v-model="form.priority">
				<a-option :value="ECommon_Model_Project_Issue_Priority.LOW">Low</a-option>
				<a-option :value="ECommon_Model_Project_Issue_Priority.MEDIUM">MEDIUM</a-option>
				<a-option :value="ECommon_Model_Project_Issue_Priority.HIGH">HIGH</a-option>
				<a-option :value="ECommon_Model_Project_Issue_Priority.URGENT">URGENT</a-option>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {apiBoard, DCSType} from "@/business/common/request/request";
import {reactive, ref} from "vue";
import {ICommon_Model_Board_Sprint_SwimLane} from "../../../../../../../common/model/board_sprint_swimlane";
import {ECommon_Model_Project_Issue_Priority} from "../../../../../../../common/model/project_issue";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";

const props=defineProps<{
	type:"add"|"edit",
	boardSprintId?:string,
	item?:DCSType<ICommon_Model_Board_Sprint_SwimLane>
}>()
const form=reactive({
	name:props.type=="edit"?props.item.name:"",
	priority:props.type=="edit"?props.item.priority:ECommon_Model_Project_Issue_Priority.MEDIUM
})
const eleForm=ref(null)

onDialogOk(dialogFuncGenerator({
	func:()=>{
		return props.type=="add"?apiBoard.createSwimLane({
			boardSprintId:props.boardSprintId,
			name:form.name,
			priority:form.priority
		}):apiBoard.editSwimLane({
			boardSprintSwimLaneId:props.item.id,
			name:form.name,
			priority:form.priority
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>