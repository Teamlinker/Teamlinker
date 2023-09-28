<template>
	<a-form :model="form" ref="formEle" auto-label-width>
		<a-form-item field="cameraId" :label="$t('util.selectCamera')">
			<div style="width: 80%">
				<a-select v-model="form.cameraId" :placeholder="$t('placeholder.meetingPreview')">
					<a-option v-for="item in cameraList" :value="item.id">{{item.name}}</a-option>
				</a-select>
				<div style="width: 100%;margin-top: 10px">
					<video autoplay :srcObject="stream" v-if="stream" style="width: 100%"></video>
				</div>
			</div>
		</a-form-item>
		<a-form-item field="enableVideo" :label="$t('util.videoOn')">
			<a-switch v-model="form.enableVideo"></a-switch>
		</a-form-item>
		<a-form-item field="enableAudio" :label="$t('util.audioOn')">
			<a-switch v-model="form.enableAudio"></a-switch>
		</a-form-item>
		<a-form-item style="color: red">
			{{$t("controller.app.meeting.meetingPreview.tip")}}
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, onBeforeUnmount, reactive, ref, watch} from "vue";
import {MeetingClient} from "../../../common/component/meeting/client";
import {onDialogOk} from "../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../common/util/helper";

const formEle=ref()
const form=reactive({
	cameraId:"",
	enableVideo:true,
	enableAudio:true
})
const cameraList=ref<{
	id:string,
	name:string
}[]>([])
const stream=ref<MediaStream>()
watch(()=>form.cameraId,async ()=>{
	if(form.cameraId) {
		stream.value=await MeetingClient.checkVideoStream(form.cameraId)
	}
})
const getCameraList=async ()=>{
	cameraList.value=(await MeetingClient.enumVideoDevice()).filter(item=>item.id!=="")
}
onBeforeMount(()=>{
	getCameraList()
})
onBeforeUnmount(()=>{
	stream.value?.getVideoTracks()[0]?.stop()
})
onDialogOk(dialogFuncGenerator({
	form:()=>formEle.value,
	func:()=>({
		code:0,
		...form
	})
},true))
</script>

<style scoped>

</style>