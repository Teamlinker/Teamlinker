<template>
	<a-row align="center" justify="center" style="height: 100%;position: relative;background: radial-gradient(circle at center, rgb(228,232,249), #ffffff);" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
		<a-space style="position: absolute;left: 20px;top: 20px">
			<img :src="logo" style="width: 20px;aspect-ratio: 1/1" />
			<span style="font-size: 24px;font-weight: bolder">
				<router-link :to="{name:'index'}" style="text-decoration: none;color:rgb(35,110,184)">
					Teamlinker
				</router-link>
			</span>
		</a-space>
		<div style="width:40%;box-shadow: rgba(22, 14, 45, 0.02) 0px 0px 40px, rgba(22, 14, 45, 0.06) 0px 0px 104px;padding: 20px;box-sizing: border-box;border: 1px solid rgb(234, 236, 240);border-radius: 10px;background-color: white">
			<a-form :model="form" auto-label-width @submit="onSubmit">
				<h1 style="text-align: center;margin-bottom: 50px">{{$t("util.reset")}}</h1>
				<a-form-item field="username" :label="$t('util.username')" :rules="[{
					match:/^[A-Za-z0-9\u4e00-\u9fa5_\-\.]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
					message:$t('tip.emailNotMatch')
				}]" required>
					<a-input v-model="form.username"></a-input>
				</a-form-item>
				<a-form-item>
					<a-button html-type="submit" type="primary">{{$t("util.submit")}}</a-button>
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
import logo from "@/assert/logo.png";
import {Message} from "@arco-design/web-vue";

const form=reactive({
	username:""
})
const router=useRouter()

const onSubmit=async ()=>{
	if(form.username) {
		let res=await apiUser.resetCode({
			username:form.username
		})
		if(res?.code==0) {
			await router.push({
				name:"resetCode",
				query:{
					username:form.username
				}
			})
		} else {
			Message.error(res.msg)
		}
	}
}
</script>

<style scoped>

</style>