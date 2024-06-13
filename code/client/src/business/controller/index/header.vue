<template>
  <a-row style="height: 8rem;width: 100%;position: sticky;top:0;background-color: rgba(255, 255, 255, 1);z-index: 1;">
    <a-col :span="4" style="height: 100%;display:flex;justify-content: center;align-items: center">
	    <img :src="logo2">
    </a-col>
    <a-col :span="6" style="align-items: center;justify-content: left;display: flex;height: 100%">
      <a-space>
        <a-button type="text" style="color: #333333; font-size: 1.375rem; font-family: PingFangSC-Medium; font-weight: 500" @click="$emit('change','product')">
          {{$t("controller.index.home.product")}}
        </a-button>
        <a-dropdown type="text" trigger="hover">
          <a-button type="text" style="color: #333333; font-size: 1.375rem; font-family: PingFangSC-Medium; font-weight: 500">
            {{$t("controller.index.home.resource")}}
          </a-button>
          <template #content>
            <a-doption @click="onManual">{{$t("controller.index.home.doc")}}</a-doption>
            <a-doption @click="onDocker">Docker</a-doption>
            <a-doption @click="onGithub">Github</a-doption>
          </template>
        </a-dropdown>
        <a-button type="text" style="color: #333333; font-size: 1.375rem; font-family: PingFangSC-Medium; font-weight: 500" @click="$emit('change','price')">
          {{$t("controller.index.home.price")}}
        </a-button>
      </a-space>
    </a-col>
    <a-col :span="9">
    </a-col>
    <a-col :span="4" style="align-items: center;justify-content: center;display: flex;height: 100%">
      <a-space v-if="userInfo" size="mini">
        <a-avatar :size="30" :image-url="userInfo?.photo">
          {{imgName}}
        </a-avatar>
        <a-dropdown trigger="hover">
          <a-button type="text" style="color: rgb(35, 110, 184)">
            {{userInfo?.username}}
            <icon-caret-down></icon-caret-down>
          </a-button>
          <template #content>
            <a-doption @click="onConsole">{{$t("util.console")}}</a-doption>
            <a-doption @click="onLogout">{{$t("util.logout")}}</a-doption>
          </template>
        </a-dropdown>
      </a-space>
      <a-space v-else>
        <a-button type="text" style="color: #333333; font-size: 1.375rem; font-family: PingFangSC-Medium; font-weight: 500" @click="onLogin">
          {{$t("controller.index.home.login")}}
        </a-button>
        <a-button type="primary" style="width:auto; padding: 0rem 3.5rem; height:3.125rem; color: white;font-size: medium;background-color: #2864FF;"  @click="onRegister">
          {{$t("controller.index.home.started")}}
        </a-button>
      </a-space>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {SessionStorage} from "@/business/common/storage/session";
import {computed, onBeforeMount, ref} from "vue";
import {DCSType} from "../../../../../common/types";
import {ICommon_Model_User} from "../../../../../common/model/user";
import {apiUser} from "@/business/common/request/request";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";
import logo2 from "@/assert/logo2.png";

const emit=defineEmits<{
	change:[name:string]
}>()
const {t}=useI18n()
const store=useDesktopStore()
const userId=ref(SessionStorage.get("userId"))
const userInfo = ref<Omit<DCSType<ICommon_Model_User>,"password">>();
const router=useRouter()

const imgName=computed(()=>{
	if(userInfo.value?.username?.includes(" ")) {
		let arr=userInfo.value.username.split(" ")
		return arr[0][0].toUpperCase()+arr[1][0].toUpperCase()
	} else {
		return userInfo.value?.username?userInfo.value?.username[0].toUpperCase():""
	}
})
const onLogin=async () =>{
	await router.push("login")
}

const onRegister=async()=>{
	await router.push("register")
}

const onDocker=()=>{
	window.open('https://hub.docker.com/r/teamlinkeroffical/teamlinker','_blank')
}

const onGithub=()=>{
	window.open('https://github.com/teamlinker','_blank')
}

const onManual=()=>{
	window.open(t("controller.index.home.docLink"),"_blank")
}

const onConsole=async ()=>{
	await router.push("desktop")
}

const onLogout=async ()=>{
	await store.logout()
	userId.value=null
	userInfo.value=null
}

const getUserInfo=async ()=>{
	let res=await apiUser.refresh()
	if(res?.code==0) {
		userInfo.value=res.data
	}
}

onBeforeMount(()=>{
	if(userId) {
		getUserInfo()
		if(store.userInfo) {
			store.initNotificationSocket()
		}
	}
})
</script>

<style scoped>
.logo-box{
  background-color: #2864FF;
  border-radius: 50%;
  height: 2rem;
  width: 2rem;
}
.logo-l{
  display: block;
  overflow-wrap: break-word;
  color: #FFFFFF;
  font-size: 1.75rem;
  font-family: DingTalk-JinBuTi;
  text-align: left;
  white-space: nowrap;
  /*line-height: 34px;*/
  margin-left: 7px;
  margin-top: 1px;
}
.logo-r{
  width: auto;
  height: 2.06rem;
  overflow-wrap: break-word;
  color: #2864FF;
  font-size: 1.68rem;
  font-family: DingTalk-JinBuTi;
  text-align: left;
  white-space: nowrap;
  line-height: 1.93rem;
}
</style>