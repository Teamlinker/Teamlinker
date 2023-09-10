<template>
	<a-row align="center" justify="center" style="height: 100%" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE && username">
		<a-form :model="form" style="width: 700px" @submit="onSubmit">
			<router-link :to="{name:'index'}" style="text-decoration: none;">
				<h3 style="text-align: center;margin-bottom: 50px">Teamlinker</h3>
			</router-link>
			<a-form-item field="code" :label="$t('util.code')">
				<template #extra>
					{{$t("controller.login.registerCode.receiveCode")}} <a href="javascript:void(0)" style="text-decoration: none" @click="onResend">{{$t("util.resend")}}</a>
				</template>
				<a-input v-model="form.code"></a-input>
			</a-form-item>
			<a-form-item>
				<a-button html-type="submit" type="primary">{{$t("util.submit")}}</a-button>
			</a-form-item>
		</a-form>
	</a-row>
</template>

<script setup lang="ts">

import {ECommon_Application_Mode} from "../../../../../common/types";
import {reactive} from "vue";
import {apiUser} from "../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const props=defineProps<{
	username:string
}>()

const form=reactive({
	code:""
})
const {t}=useI18n()
const router=useRouter()
const onResend=async ()=>{
	let res=await apiUser.resendCode({
		username:props.username
	})
	if(res?.code==0) {
		Message.info(t("tip.sendSuccess"))
	} else {
		Message.error(res.msg)
	}
}

const onSubmit=async()=>{
	if(!form.code) {
		return
	}
	let res=await apiUser.confirmRegister({
		username:props.username,
		code:form.code
	})
	if(res?.code==0) {
		Message.info(t("tip.registerSuccess"))
		await router.replace("login")
	} else {
		Message.error(res.msg)
	}
}
</script>

<style scoped>

</style>