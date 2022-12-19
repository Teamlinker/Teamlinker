<template>
<a-row align="center" justify="center" style="height: 100%">
  <a-form :model="form" style="width: 600px" @submit="onSubmit">
    <h3 style="text-align: center;margin-bottom: 50px">Teamlinker</h3>
    <a-form-item field="username" label="username" required>
      <a-input v-model="form.username" placeholder="please enter username"></a-input>
    </a-form-item>
    <a-form-item field="password" label="password" required>
      <a-input v-model="form.password" type="password" placeholder="please enter password"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</a-row>
</template>

<script setup lang="ts">
import {reactive} from "vue";
import {apiUser} from "../../common/request/request";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";

let form=reactive({
  username:"",
  password:""
})
let router=useRouter();
const onSubmit=async ()=>{
  let ret=await apiUser.login({
    username:form.username,
    password:form.password
  })
  if(ret.code==0) {
    sessionStorage.removeItem("organizationId")
    await router.push("desktop")
  } else {
    Message.error(ret.msg);
  }
}
</script>

<style scoped>

</style>