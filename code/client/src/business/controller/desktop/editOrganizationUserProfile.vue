<template>
	<div>
		<a-form :model="form" ref="eleForm" auto-label-width>
			<a-form-item field="nickname" :label="$t('util.nickname')" required>
				<a-input v-model="form.nickname"></a-input>
			</a-form-item>
			<a-form-item field="email" :label="$t('util.email')">
				<a-input v-model="form.email"></a-input>
			</a-form-item>
			<a-form-item field="location" :label="$t('util.location')">
				<a-input v-model="form.location"></a-input>
			</a-form-item>
			<a-form-item field="phone" :label="$t('util.phone')">
				<a-input v-model="form.phone"></a-input>
			</a-form-item>
			<a-form-item v-if="store.organizationInfo.created_by_pure.id!==userId">
				<a-button html-type="button" type="primary" status="danger" @click="onQuit">{{$t("util.quit")}}</a-button>
			</a-form-item>
		</a-form>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, reactive, ref} from "vue";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {apiOrganization} from "@/business/common/request/request";
import {SessionStorage} from "@/business/common/storage/session";
import {Dialog, onDialogOk} from "@/business/common/component/dialog/dialog";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";

const props=defineProps<{
	onClose:()=>void
}>()
const eleForm=ref(null)
const store=useDesktopStore()
const userId=SessionStorage.get("userId")
const appContext=getCurrentInstance().appContext
const form=reactive({
	nickname:store.organizationUserInfo.nickname,
	email:store.organizationUserInfo.email,
	location:store.organizationUserInfo.location,
	phone:store.organizationUserInfo.phone,
})

const {t}=useI18n()

const onQuit=async ()=>{
	let ret=await Dialog.confirm(document.body,appContext,t("tip.quitOrganization"))
	if(ret) {
		let res=await apiOrganization.quit()
		if(res?.code==0) {
			Message.success(t("tip.operationSuccess"))
			props.onClose()
			location.reload()
		} else {
			Message.error(res.msg)
		}
	}
}

onDialogOk(async ()=>{
	let ret=await eleForm.value.validate()
	if(ret) {
		return false;
	}
	let res=await apiOrganization.updateUser({
		organizationUserId:SessionStorage.get("organizationUserId"),
		...form,
	})
	if(res?.code==0) {
		Message.success(t("tip.operationSuccess"))
		store.organizationUserInfo=res.data.organizationUser
		return true
	} else {
		Message.error(res.msg)
		return false
	}
})
</script>

<style scoped>

</style>