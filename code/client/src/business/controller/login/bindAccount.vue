<template>
	<a-row align="center" justify="center" style="height: 100%;position: relative;background: radial-gradient(circle at center, rgb(228,232,249), #ffffff);">
		<a-space style="position: absolute;left: 20px;top: 20px">
			<span style="font-size: 24px;font-weight: bolder">
				<router-link :to="{name:'index'}" style="text-decoration: none;color:rgb(35,110,184)">
					Teamlinker
				</router-link>
			</span>
		</a-space>
		<div style="width:40%;box-shadow: rgba(22, 14, 45, 0.02) 0px 0px 40px, rgba(22, 14, 45, 0.06) 0px 0px 104px;padding: 20px;box-sizing: border-box;border: 1px solid rgb(234, 236, 240);border-radius: 10px;background-color: white">
			<a-form :model="form"  auto-label-width @submit="onSubmit">
				<h1 style="text-align: center;margin-bottom: 50px;color: rgba(16, 24, 40, 0.8)">{{$t("controller.login.bindAccount.bindExistedAccount")}}</h1>
				<a-form-item field="username" :label="$t('util.username')" required>
					<a-input v-model="form.username" :placeholder="$t('placeholder.enterUsername')"></a-input>
				</a-form-item>
				<a-form-item field="password" :label="$t('util.password')" required>
					<a-input v-model="form.password" type="password" :placeholder="$t('placeholder.typePassword')"></a-input>
				</a-form-item>
				<a-form-item>
					<a-button html-type="submit" type="primary" style="background-color: rgb(147, 115, 238)">{{ $t("util.bind") }}</a-button>
				</a-form-item>
			</a-form>
		</div>
	</a-row>
</template>

<script setup lang="ts">
import {getCurrentInstance, reactive} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";
import {apiUser} from "@/business/common/request/request";
import {SessionStorage} from "@/business/common/storage/session";
import md5 from "blueimp-md5";
import {Message} from "@arco-design/web-vue";

let form = reactive({
	username: "",
	password: ""
})
const appContext=getCurrentInstance().appContext
const store=useDesktopStore()
const {t}=useI18n()
let router = useRouter();

const onSubmit = async () => {
	let res=await apiUser.bindWechat({
		openId:SessionStorage.get("wechatOpenId"),
		username:form.username,
		password:md5(form.password)
	})
	if(res?.code==0) {
		Message.success(t("tip.operationSuccess"))
		SessionStorage.remove("wechatOpenId")
		await router.replace("login")
	} else {
		Message.error(res.msg)
	}
}
</script>

<style scoped>

</style>