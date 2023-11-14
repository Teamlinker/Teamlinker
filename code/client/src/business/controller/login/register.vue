<template>
	<a-row align="center" justify="center" style="height: 100%;position: relative;background: radial-gradient(circle at center, rgb(228,232,249), #ffffff);" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
		<a-space style="position: absolute;left: 20px;top: 20px">
			<span style="font-size: 24px;font-weight: bolder">
				<router-link :to="{name:'index'}" style="text-decoration: none;color:rgb(35,110,184)">
					Teamlinker
				</router-link>
			</span>
		</a-space>
		<div style="width:40%;box-shadow: rgba(22, 14, 45, 0.02) 0px 0px 40px, rgba(22, 14, 45, 0.06) 0px 0px 104px;padding: 20px;box-sizing: border-box;border: 1px solid rgb(234, 236, 240);border-radius: 10px;background-color: white">
			<a-form :model="form" auto-label-width @submit="onSubmit">
				<h1 style="text-align: center;margin-bottom: 50px">{{$t("util.register")}}</h1>
				<a-form-item field="username" :label="$t('util.email')" :rules="[{
					match:/^[A-Za-z0-9\u4e00-\u9fa5_\-\.]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
					message:$t('tip.emailNotMatch')
				}]" required>
					<a-input v-model="form.username" :placeholder="$t('placeholder.typeEmail')"></a-input>
				</a-form-item>
				<a-form-item field="password" :label="$t('util.password')" required>
					<a-input v-model="form.password" type="password" :placeholder="$t('placeholder.typePassword')"></a-input>
				</a-form-item>
				<a-form-item field="passwordRepeat" :label="$t('util.passwordConfirm')" required>
					<a-input v-model="form.passwordRepeat" type="password" :placeholder="$t('placeholder.typePasswordAgain')"></a-input>
				</a-form-item>
				<a-form-item>
					<a-button html-type="submit" type="primary">{{$t("util.register")}}</a-button>
				</a-form-item>
			</a-form>
		</div>
	</a-row>
</template>

<script setup lang="ts">

import {ECommon_Application_Mode} from "../../../../../common/types";
import {reactive} from "vue";
import {apiUser} from "../../common/request/request";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import md5 from "blueimp-md5";
import {useI18n} from "vue-i18n";

let form=reactive({
	username:"",
	password:"",
	passwordRepeat:""
})
const router=useRouter()
const {t}=useI18n()
const onSubmit=async ()=>{
	if(!form.username) {
		Message.error(t("tip.typeUsername"))
		return
	} else if(!form.password) {
		Message.error(t("tip.typePassword"))
		return
	} else if(form.password!==form.passwordRepeat) {
		Message.error(t("tip.passwordNotMatch"))
		return
	}
	let res=await apiUser.register({
		username:form.username,
		password:md5(form.password)
	})
	if(res?.code==0) {
		await router.push({
			name:"registerCode",
			query:{
				username:form.username
			}
		})
	} else {
		Message.error(res.msg)
	}
}
</script>

<style scoped>

</style>