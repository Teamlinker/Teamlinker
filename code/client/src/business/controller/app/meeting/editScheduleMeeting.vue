<template>
	<a-form auto-label-width :model="form" ref="formEle">
		<a-form-item :label="$t('util.meetingId')" v-if="type==='edit'">
			{{props.data.id}}
		</a-form-item>
		<a-form-item field="name" :label="$t('util.name')" required>
			<a-input v-model="form.name"></a-input>
		</a-form-item>
		<a-form-item field="description" :label="$t('util.description')">
			<a-textarea v-model="form.description" allow-clear></a-textarea>
		</a-form-item>
		<a-form-item field="startTime" :label="$t('util.startDate')" required>
			<a-date-picker show-time v-model="form.startTime"></a-date-picker>
		</a-form-item>
		<a-form-item field="endTime" :label="$t('util.endDate')" required>
			<a-date-picker show-time v-model="form.endTime"></a-date-picker>
		</a-form-item>
		<a-form-item field="password" :label="$t('util.password')" required>
			<a-input v-model="form.password"></a-input>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {apiMeeting} from "../../../common/request/request";
import {ICommon_Model_Meeting_Room} from "../../../../../../common/model/meeting_room";
import {reactive, ref} from "vue";
import moment from "moment";
import {onDialogOk} from "../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../common/util/helper";
import {SessionStorage} from "../../../common/storage/session";
import {DCSType} from "../../../../../../common/types";

const props = defineProps<{
	type: "add" | "edit",
	data?: DCSType<ICommon_Model_Meeting_Room>
}>()
const formEle = ref()
const now = moment();
const form = reactive({
	name: props.type === "edit" ? props.data.name : "",
	description: props.type === "edit" ? props.data.description : "",
	startTime: props.type === "edit" ? moment(props.data.start_time).format('YYYY-MM-DD HH:mm:ss') : now.format('YYYY-MM-DD HH:mm:ss'),
	endTime: props.type === "edit" ? moment(props.data.end_time).format('YYYY-MM-DD HH:mm:ss') : now.format('YYYY-MM-DD HH:mm:ss'),
	password: props.type === "edit" ? props.data.password : "",
})
const organizationUserId = SessionStorage.get("organizationUserId")
onDialogOk(dialogFuncGenerator({
	form: () => formEle.value,
	func: () => {
		return props.type == "add" ? apiMeeting.createRoom({
			startTime: moment(form.startTime).toDate().getTime(),
			endTime: moment(form.endTime).toDate().getTime(),
			password: form.password,
			description: form.description,
			name: form.name,
			related_id: organizationUserId
		}) : apiMeeting.editRoom({
			name: form.name,
			description: form.description,
			password: form.password,
			startTime: moment(form.startTime).toDate().getTime(),
			endTime: moment(form.endTime).toDate().getTime(),
			meetingRoomId: props.data.id
		})
	}
}))
</script>

<style scoped>

</style>