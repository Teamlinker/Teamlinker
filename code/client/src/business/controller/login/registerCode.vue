<template>
	<a-row align="center" justify="center" style="height: 100%" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE && username">
		<a-form :model="form" style="width: 700px" @submit="onSubmit">
			<router-link :to="{name:'index'}" style="text-decoration: none;">
				<h3 style="text-align: center;margin-bottom: 50px">Teamlinker</h3>
			</router-link>
			<a-form-item field="code" label="code">
				<template #extra>
					if you don't receive verification code email,you can <a href="javascript:void(0)" style="text-decoration: none" @click="onResend">resend</a>
				</template>
				<a-input v-model="form.code"></a-input>
			</a-form-item>
			<a-form-item>
				<a-button html-type="submit" type="primary">Submit</a-button>
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

const props=defineProps<{
	username:string
}>()
const form=reactive({
	code:""
})
const router=useRouter()
const onResend=async ()=>{
	let res=await apiUser.resendCode({
		username:props.username
	})
	if(res?.code==0) {
		Message.info("send success")
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
		Message.info("register success")
		await router.replace("login")
	} else {
		Message.error(res.msg)
	}
}
</script>

<style scoped>

</style>