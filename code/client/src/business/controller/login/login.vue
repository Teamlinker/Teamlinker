<template>
	<a-row align="center" justify="center" style="height: 100%;position: relative;background: radial-gradient(circle at center, rgb(228,232,249), #ffffff);">
		<a-space style="position: absolute;left: 20px;top: 20px">
			<img :src="logo" style="width: 20px;aspect-ratio: 1/1" />
			<span style="font-size: 24px;font-weight: bolder">
				<router-link :to="{name:'index'}" style="text-decoration: none;color:rgb(35,110,184)">
					Teamlinker
				</router-link>
			</span>
		</a-space>
		<div style="width:40%;box-shadow: rgba(22, 14, 45, 0.02) 0px 0px 40px, rgba(22, 14, 45, 0.06) 0px 0px 104px;padding: 20px;box-sizing: border-box;border: 1px solid rgb(234, 236, 240);border-radius: 10px;background-color: white">
			<a-form :model="form"  auto-label-width @submit="onSubmit">
				<h1 style="text-align: center;margin-bottom: 50px">{{$t("util.login")}}</h1>
				<a-form-item field="username" :label="$t('util.username')" required>
					<a-input v-model="form.username" :placeholder="$t('placeholder.enterUsername')"></a-input>
				</a-form-item>
				<a-form-item field="password" :label="$t('util.password')" required>
					<a-input v-model="form.password" type="password" :placeholder="$t('placeholder.typePassword')"></a-input>
				</a-form-item>
				<a-form-item>
					<a-row style="justify-content: space-between;width: 100%">
						<a-button html-type="submit" type="primary">{{ $t("util.submit") }}</a-button>
						<a-space v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
							<a-button html-type="button" type="primary" status="success" @click="onRegister">{{ $t("util.register") }}
							</a-button>
							<a-button html-type="button" type="primary" status="warning" @click="onReset">{{ $t("util.reset") }}
							</a-button>
						</a-space>
					</a-row>
				</a-form-item>
			</a-form>
		</div>

	</a-row>
</template>

<script setup lang="ts">
import {reactive} from "vue";
import {apiUser} from "../../common/request/request";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import {NotificationWrapper} from "../../common/component/notification/notification";
import {SessionStorage} from "../../common/storage/session";
import md5 from "blueimp-md5"
import {ECommon_Application_Mode} from "../../../../../common/types";
import logo from "@/assert/logo.png"

let form = reactive({
	username: "",
	password: ""
})
let router = useRouter();
const onSubmit = async () => {
	NotificationWrapper.init()
	let ret = await apiUser.login({
		username: form.username,
		password: md5(form.password)
	})
	if (ret.code == 0) {
		SessionStorage.remove("organizationId")
		await router.push("desktop")
	} else {
		Message.error(ret.msg);
	}
}

const onRegister = async () => {
	await router.push("register")
}

const onReset = async () => {
	await router.push("reset")
}
</script>

<style scoped>

</style>