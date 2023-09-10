<template>
	<a-form auto-label-width :model="form" ref="formEle">
		<a-form-item field="id" :label="$t('util.meetingId')" required>
			<a-input v-model="form.id"></a-input>
		</a-form-item>
		<a-form-item field="password" :label="$t('util.meetingPassword')" required>
			<a-input v-model="form.password"></a-input>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../common/util/helper";
import {apiMeeting} from "../../../common/request/request";

const formEle=ref()
const form=reactive({
	id:"",
	password:""
})
onDialogOk(dialogFuncGenerator({
	form:()=>formEle.value,
	func:()=>{
		return apiMeeting.validateRoom({
			meetingRoomId:form.id,
			password:form.password
		})
	}
}))
</script>


<style scoped>

</style>