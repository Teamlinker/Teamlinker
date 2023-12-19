<template>
	<div>
		<FieldPriority :priority="showValue" v-if="!isEdit"></FieldPriority>
		<template v-else>
			<a-space size="mini">
				<a-select v-model="editValue">
					<a-option :value="ECommon_Model_Project_Issue_Priority.LOW">{{$t("util.low")}}</a-option>
					<a-option :value="ECommon_Model_Project_Issue_Priority.MEDIUM">{{$t("util.medium")}}</a-option>
					<a-option :value="ECommon_Model_Project_Issue_Priority.HIGH">{{$t("util.high")}}</a-option>
					<a-option :value="ECommon_Model_Project_Issue_Priority.URGENT">{{$t("util.urgent")}}</a-option>
				</a-select>
				<a-button type="text" @click="onClick">
					<template #icon>
						<icon-check></icon-check>
					</template>
				</a-button>
				<a-button type="text" @click="onBlur">
					<template #icon>
						<icon-close style="color: red"></icon-close>
					</template>
				</a-button>
			</a-space>
		</template>
	</div>
</template>

<script setup lang="ts">

import {ECommon_Model_Project_Issue_Priority} from "../../../../../../../common/model/project_issue";
import FieldPriority from "../fieldPriority.vue";
import {ref, watch} from "vue";
import {apiIssue} from "../../../request/request";

const props=defineProps<{
	isEdit:boolean,
	showValue?:ECommon_Model_Project_Issue_Priority,
	projectIssueId:string
}>()
const emit=defineEmits<{
	cancel:[],
	update:[value:ECommon_Model_Project_Issue_Priority]
}>()

const editValue=ref<ECommon_Model_Project_Issue_Priority>()

const assignValue=()=>{
	editValue.value=props.showValue
}
watch(()=>props.showValue,()=>{
	assignValue()
},{
	immediate:true,
	deep:true
})

const onClick=async ()=>{
	let res=await apiIssue.editBasicField({
		projectIssueId:props.projectIssueId,
		priority:editValue.value
	})
	if(res?.code==0) {
		emit("update",editValue.value)
	}
}

const onBlur=()=>{
	emit('cancel')
	assignValue()
}
</script>

<style scoped>

</style>