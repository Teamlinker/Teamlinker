<template>
	<a-row align="center" justify="center" style="height: 100%" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE && username">
		<a-form :model="form" style="width: 700px" @submit="onSubmit">
			<router-link :to="{name:'index'}" style="text-decoration: none;">
				<h3 style="text-align: center;margin-bottom: 50px">Teamlinker</h3>
			</router-link>
			<a-form-item field="code" :label="$t('util.code')">
				<a-input v-model="form.code"></a-input>
			</a-form-item>
			<a-form-item field="password" :label="$t('util.password')">
				<a-input v-model="form.password"></a-input>
			</a-form-item>
			<a-form-item field="passwordRepeat" :label="$t('util.passwordConfirm')">
				<a-input v-model="form.passwordRepeat"></a-input>
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
import {Message} from "@arco-design/web-vue";
import {apiUser} from "../../common/request/request";
import md5 from "blueimp-md5";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const props=defineProps<{
	username:string
}>()

const form=reactive({
	code:"",
	password:"",
	passwordRepeat:""
})
const {t}=useI18n()
const router=useRouter()
const onSubmit=async ()=>{
	if(!form.code) {
		Message.error(t("tip.typeCode"))
		return
	} else if(!form.password) {
		Message.error(t("tip.typePassword"))
		return
	} else if(form.password!==form.passwordRepeat) {
		Message.error(t("tip.passwordNotMatch"))
		return
	}
	let res=await apiUser.reset({
		username:props.username,
		code:form.code,
		password:md5(form.password)
	})
	if(res?.code==0) {
		Message.info(t("tip.resetSuccess"))
		await router.replace("login")
	}
}
</script>

<style scoped>

</style>