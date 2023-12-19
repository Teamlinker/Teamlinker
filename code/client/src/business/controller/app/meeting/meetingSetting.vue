<template>
	<div style="width: 100%">
		<a-divider orientation="left">{{$t("controller.app.meeting.meetingSetting.personalSetting")}}</a-divider>
		<a-form :model="form" auto-label-width ref="formPersonalEle" style="margin-top: 50px">
			<a-form-item field="id" :label="$t('util.meetingId')">
				{{form.id}}
			</a-form-item>
			<a-form-item field="password" :label="$t('util.meetingPassword')" required>
				<a-input v-model="form.password"></a-input>
			</a-form-item>
		</a-form>
		<a-divider orientation="left" style="margin-top: 30px">{{$t("controller.app.meeting.meetingSetting.backgroundSetting")}}</a-divider>
		<a-form :model="formBackground" auto-label-width ref="formBackgroundEle" style="margin-top: 50px">
			<a-form-item field="enable" :label="$t('controller.app.meeting.meetingSetting.backgroundImage')">
				<a-switch v-model="formBackground.enable"></a-switch>
			</a-form-item>
			<a-form-item field="photo" v-if="formBackground.enable">
				<Upload :default-uri="formBackground.photo" types=".png,.jpg,.jpeg,.gif,.bmp,.svg,.webp" @upload="onUpload"></Upload>
			</a-form-item>
		</a-form>
	</div>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {apiMeeting, apiUser} from "../../../common/request/request";
import {onDialogOk} from "../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../common/util/helper";
import Upload from "@/business/common/component/upload.vue";

const formPersonalEle=ref()
const formBackgroundEle=ref()
const form=reactive({
    id:"",
    password:""
})
const formBackground=reactive({
	enable:false,
	photo:"",
	uploadUriId:""
})

const onUpload=(id:string)=> {
	formBackground.uploadUriId=id
}

const getPersonalMeeting=async ()=>{
    let res=await apiMeeting.getPersonalRoom()
    if(res?.code==0) {
        form.id=res.data.id
        form.password=res.data.password
    }
}

const getBackgroundImage=async ()=>{
	let res=await apiUser.setting()
	if(res?.code==0) {
		formBackground.enable=!!res.data.meeting_background_img
		formBackground.photo=res.data.meeting_background_img
	}
}

onBeforeMount(()=>{
	getPersonalMeeting()
	getBackgroundImage()
})

onDialogOk(dialogFuncGenerator({
    form:()=>[formPersonalEle.value,formBackgroundEle.value],
    func:()=>Promise.all([
	    apiMeeting.editRoom({
		    meetingRoomId:form.id,
		    password:form.password
	    }),
	    !formBackground.enable?apiUser.setMeetingBackgroundImg({}):formBackground.uploadUriId?apiUser.setMeetingBackgroundImg({
				photo:formBackground.uploadUriId
			}):null
    ]).then(res=>{
	    return res[0]
    })
}))
</script>

<style scoped>

</style>