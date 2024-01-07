<template>
	<div>
		<template v-if="!isEdit">
			{{showValue}}
		</template>
		<template v-else>
			<a-space size="mini">
				<a-input-number v-model="editValue" :min="1" :max="100" :precision="0"></a-input-number>
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

import {ref, watch} from "vue";
import {apiIssue} from "../../../request/request";

const props=defineProps<{
	isEdit:boolean,
	showValue?:number,
	projectIssueId:string
}>()
const emit=defineEmits<{
	cancel:[],
	update:[value:number]
}>()

const editValue=ref<number>()

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
		manDay:editValue.value
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