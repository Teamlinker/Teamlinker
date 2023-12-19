<template>
	<a-form :model="form" ref="eleForm">
		<a-form-item field="progress" :label="$t('util.progress')">
			<a-slider v-model="form.progress" :min="1" :max="99"></a-slider>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";
import {apiPlan} from "@/business/common/request/request";

const props=defineProps<{
	planItemId:string,
	progress:number
}>()
const form=reactive({
	progress:props.progress
})
const eleForm=ref(null)
onDialogOk(dialogFuncGenerator({
	func:()=>{
		return apiPlan.editProgress({
			progress:form.progress,
			planItemId:props.planItemId
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>