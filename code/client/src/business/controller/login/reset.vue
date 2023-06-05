<template>
	<a-row align="center" justify="center" style="height: 100%" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
		<a-form :model="form" style="width: 700px" @submit="onSubmit">
			<router-link :to="{name:'index'}" style="text-decoration: none;">
				<h3 style="text-align: center;margin-bottom: 50px">Teamlinker</h3>
			</router-link>
			<a-form-item field="username" label="username">
				<a-input v-model="form.username"></a-input>
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
import {useRouter} from "vue-router";

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
		}
	}
}
</script>

<style scoped>

</style>