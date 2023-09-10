<template>
<a-row align="center" justify="center" style="height: 100%">
  <a-form :model="form" style="width: 600px" @submit="onSubmit">
    <router-link :to="{name:'index'}" style="text-decoration: none;">
	    <h3 style="text-align: center;margin-bottom: 50px">Teamlinker</h3>
    </router-link>
    <a-form-item field="username" :label="$t('util.username')" required>
      <a-input v-model="form.username" :placeholder="$t('placeholder.enterUsername')"></a-input>
    </a-form-item>
    <a-form-item field="password" :label="$t('util.password')" required>
      <a-input v-model="form.password" type="password" :placeholder="$t('placeholder.typePassword')"></a-input>
    </a-form-item>
    <a-form-item>
	    <a-row style="justify-content: space-between;width: 100%">
		    <a-button html-type="submit" type="primary">{{$t("util.submit")}}</a-button>
		    <a-space v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
			    <a-button html-type="button" type="primary" status="success"  @click="onRegister">{{$t("util.register")}}</a-button>
			    <a-button html-type="button" type="primary" status="warning"  @click="onReset">{{$t("util.reset")}}</a-button>
		    </a-space>
	    </a-row>
    </a-form-item>
  </a-form>
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

let form=reactive({
  username:"",
  password:""
})
let router=useRouter();
const onSubmit=async ()=>{
  NotificationWrapper.init()
  let ret=await apiUser.login({
    username:form.username,
    password:md5(form.password)
  })
  if(ret.code==0) {
    SessionStorage.remove("organizationId")
    await router.push("desktop")
  } else {
    Message.error(ret.msg);
  }
}

const onRegister=async()=>{
	await router.push("register")
}

const onReset=async ()=>{
	await router.push("reset")
}
</script>

<style scoped>

</style>