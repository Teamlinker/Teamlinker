<template>
	<div>
		<span style="font-size: 24px;font-weight: bold" v-if="!isEdit">{{ showValue }}</span>
		<template v-else>
			<a-row style="padding-right: 10px">
				<a-input v-model="editValue"></a-input>
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
			</a-row>
		</template>
	</div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {apiIssue} from "../../../request/request";

const props=defineProps<{
	isEdit:boolean,
	showValue?:string,
	projectIssueId:string
}>()
const emit=defineEmits<{
	cancel:[],
	update:[value:string]
}>()
const editValue=ref("")
const assignValue=()=>{
	editValue.value=props.showValue
}
watch(()=>props.showValue,()=>{
	assignValue()
},{
	immediate:true,
	deep:true
})

const onClick=async()=>{
	let res=await apiIssue.editBasicField({
		projectIssueId:props.projectIssueId,
		name:editValue.value as string
	})
	if(res?.code==0) {
		emit("update",res.data.name)
	}
}

const onBlur=()=>{
	emit('cancel')
	assignValue()
}

</script>

<style scoped>

</style>