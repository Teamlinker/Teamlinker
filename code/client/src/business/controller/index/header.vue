<template>
	<a-row style="height: 60px;width: 100%;position: sticky;top:0;background-color: white;z-index: 1">
			<a-col :span="3" style="align-items: center;justify-content: center;display: flex;height: 100%">
				<span style="font-size: 24px;color: rgb(35,110,184);font-weight: bolder">
					Teamlinker
				</span>
			</a-col>
		<a-col :span="6" style="align-items: center;justify-content: left;display: flex;height: 100%">
			<a-space>
				<a-button type="text" style="color: #050505;font-size: medium" @click="emit('change','product')">
					{{$t("controller.index.home.product")}}
				</a-button>
				<a-dropdown type="text" trigger="hover">
					<a-button type="text" style="color: #050505;font-size: medium">
						{{$t("controller.index.home.resource")}}
					</a-button>
					<template #content>
						<a-doption @click="onManual">{{$t("controller.index.home.doc")}}</a-doption>
						<a-doption @click="onDocker">Docker</a-doption>
						<a-doption @click="onGithub">Github</a-doption>
					</template>
				</a-dropdown>
				<a-button type="text" style="color: #050505;font-size: medium" @click="emit('change','price')">
					{{$t("controller.index.home.price")}}
				</a-button>
			</a-space>
		</a-col>
		<a-col :span="11">

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
				<a-button type="text" style="color: #050505;font-size: medium" @click="onLogin">
					{{$t("controller.index.home.login")}}
				</a-button>
				<a-button style="color: white;font-size: medium;background-color: #859ACC" shape="round" @click="onRegister">
					{{$t("controller.index.home.getFree")}}
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

</style>