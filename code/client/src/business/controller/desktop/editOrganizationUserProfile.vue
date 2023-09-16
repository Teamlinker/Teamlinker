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
		</a-form>
	</div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {apiOrganization} from "@/business/common/request/request";
import {SessionStorage} from "@/business/common/storage/session";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";

const eleForm=ref(null)
const store=useDesktopStore()
const form=reactive({
	nickname:store.organizationUserInfo.nickname,
	email:store.organizationUserInfo.email,
	location:store.organizationUserInfo.location,
	phone:store.organizationUserInfo.phone,
})

const {t}=useI18n()
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