<template>
	<a-row align="center" justify="center" style="height: 100%" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
		<a-form :model="form" style="width: 700px" @submit="onSubmit">
			<router-link :to="{name:'index'}" style="text-decoration: none;">
				<h3 style="text-align: center;margin-bottom: 50px">Teamlinker</h3>
			</router-link>
			<a-form-item field="username" label="email" required>
				<a-input v-model="form.username" placeholder="please enter email"></a-input>
			</a-form-item>
			<a-form-item field="password" label="password" required>
				<a-input v-model="form.password" type="password" placeholder="please enter password"></a-input>
			</a-form-item>
			<a-form-item field="passwordRepeat" label="password confirm" required>
				<a-input v-model="form.passwordRepeat" type="password" placeholder="please enter password again"></a-input>
			</a-form-item>
			<a-form-item>
				<a-button html-type="submit" type="primary">Register</a-button>
			</a-form-item>
		</a-form>
	</a-row>
</template>

<script setup lang="ts">

import {ECommon_Application_Mode} from "../../../../../common/types";
import {reactive} from "vue";
import {apiUser} from "../../common/request/request";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import md5 from "blueimp-md5";

let form=reactive({
	username:"",
	password:"",
	passwordRepeat:""
})
const router=useRouter()

const onSubmit=async ()=>{
	if(!form.username) {
		Message.error("please type username")
		return
	} else if(!form.password) {
		Message.error("please type password")
		return
	} else if(form.password!==form.passwordRepeat) {
		Message.error("twice password not match")
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
	}
}
</script>

<style scoped>

</style>