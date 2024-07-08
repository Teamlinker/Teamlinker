<template>
  <div class="commonBox" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
    <a-row style="width: 100%;margin: 0px auto;">
      <a-col :span="12">
        <!--<div class="commonL" style="width: 100%"></div>-->
        <div style="background:#F2F6FA;min-width:40rem"><img :src="loginBg" style="width: auto; aspect-ratio: auto;"/></div>
      </a-col>
      <a-col :span="12">
        <div class="commonR">
          <div style="width: 100%;height: 34px">
            <div style="display: flex; flex-direction: row;float: left">
              <img :src="logo2">
              <!--<div class="logo-box"><span class="logo-l">T</span></div>
              <span class="logo-r">eamlinker</span>-->
            </div>
            <div class="commonTopR" style="float: right"><a-link @click="onIndex">{{$t("controller.login.goToHomePage")}}</a-link></div>
          </div>
          <div class="commonHi" style="margin-top: 46px">{{$t("controller.login.welcome")}}！</div>
          <div>
            <a-form :model="form"  auto-label-width @submit="onSubmit">
              <span class="commonTitle">{{$t('util.email')}}</span>
              <a-form-item field="username" :rules="[{
					match:/^[A-Za-z0-9\u4e00-\u9fa5_\-\.]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
					message:$t('tip.emailNotMatch')
				}]" required>
                <a-input v-model="form.username" :placeholder="$t('placeholder.typeEmail')" class="formInput"></a-input>
              </a-form-item>
              <span class="commonTitle">{{$t('util.password')}}</span>
              <a-form-item field="password" required>
                <a-input v-model="form.password" type="password" :placeholder="$t('placeholder.typePassword')" class="formInput"></a-input>
              </a-form-item>
              <span class="commonTitle">{{$t('util.passwordConfirm')}}</span>
              <a-form-item field="passwordRepeat" required>
                <a-input v-model="form.passwordRepeat" type="password" :placeholder="$t('placeholder.typePasswordAgain')" class="formInput"></a-input>
              </a-form-item>

              <a-form-item>
                <a-row style="justify-content: center;width: 100%">
	                <a-button html-type="submit" type="primary" style="width: 100%; height: 60px;background: #2864FF;font-size: 22px;
font-family: PingFangSC, PingFang SC;font-weight: 500;color: #FFFFFF;line-height: 30px;margin-top: 45px">{{$t("util.register")}}</a-button>
                </a-row>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">

import {reactive} from "vue";
import {apiUser} from "../../common/request/request";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import md5 from "blueimp-md5";
import {useI18n} from "vue-i18n";
import loginBg from "@/assert/loginBg.png";
import logo2 from "@/assert/logo2.png";
import {ECommon_Application_Mode} from "../../../../../common/types";

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
const onIndex=async()=>{
  await router.push("/")
}
</script>

<style scoped>
.commonBox{
  background-color: #FFFFFF;
  height: 860px;
}
.commonL{
  float: left;
  height: 860px;
  background: url('@/assert/loginBg.png') 100% no-repeat,#F2F6FA;
  background-size: 100% 100%;
  width: 640px;
}
.commonR{
  float: left;
  width: 80%;
  padding-top: 40px;
  margin-left: 10%;
}
.logo-box{
  background-color: #2864FF;
  border-radius: 50%;
  height: 32px;
  width: 32px;
}
.logo-l{
  width: 18px;
  height: 34px;
  overflow-wrap: break-word;
  color: #FFFFFF;
  font-size: 28px;
  font-family: DingTalk-JinBuTi;
  text-align: left;
  white-space: nowrap;
  line-height: 34px;
  margin-left: 7px;
}
.logo-r{
  width: auto;
  height: 33px;
  overflow-wrap: break-word;
  color: #2864FF;
  font-size: 27px;
  font-family: DingTalk-JinBuTi;
  text-align: left;
  white-space: nowrap;
  line-height: 33px;
}
.commonTopR,.commonTopR a{
  font-size: 18px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #565656;
  line-height: 25px;
}
.commonHi{
  font-size: 48px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  color: #000000;
  line-height: 67px;
  text-align: left;
  padding-bottom: 30px;
}
.commonTitle{
  color: #000000;
  font-size: 18px;
  font-family: PingFangSC-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 25px;
  margin-bottom: 20px;
}
.formInput{
  border: none;
  border-bottom: 2px #000000 solid;
}
.formInput.arco-input-focus{
  border-bottom-color: #2864FF;
}
.arco-input-wrapper{background-color:#FFFFFF}
</style>