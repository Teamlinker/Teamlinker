<template>
	<a-row align="center" justify="center" style="height: 100%;position: relative;background: radial-gradient(circle at center, rgb(228,232,249), #ffffff);">
		<a-space style="position: absolute;left: 20px;top: 20px">
			<span style="font-size: 24px;font-weight: bolder">
				<router-link :to="{name:'index'}" style="text-decoration: none;color:rgb(35,110,184)">
					Teamlinker
				</router-link>
			</span>
		</a-space>
		<div style="width:40%;box-shadow: rgba(22, 14, 45, 0.02) 0px 0px 40px, rgba(22, 14, 45, 0.06) 0px 0px 104px;padding: 20px;box-sizing: border-box;border: 1px solid rgb(234, 236, 240);border-radius: 10px;background-color: white">
			<a-form :model="form"  auto-label-width @submit="onSubmit" v-if="!organizationList">
				<h1 style="text-align: center;margin-bottom: 50px;color: rgba(16, 24, 40, 0.8)">{{$t("util.login")}}</h1>
				<a-form-item field="username" :label="$t('util.username')" required>
					<a-input v-model="form.username" :placeholder="$t('placeholder.enterUsername')"></a-input>
				</a-form-item>
				<a-form-item field="password" :label="$t('util.password')" required>
					<a-input v-model="form.password" type="password" :placeholder="$t('placeholder.typePassword')"></a-input>
				</a-form-item>
				<a-form-item>
					<a-row style="justify-content: space-between;width: 100%">
						<a-space size="large">
							<a-button html-type="submit" type="primary" style="background-color: rgb(147, 115, 238)">{{ $t("util.submit") }}</a-button>
						</a-space>
					</a-row>
				</a-form-item>
			</a-form>
			<div v-else style="display: flex;flex-direction: column;justify-content: center;align-items: center">
				<h2 style="text-align: center;">{{$t("util.organizationList")}}</h2>
				<template v-if="organizationList.create?.length>0 || organizationList.join?.length>0">
					<a-list v-if="organizationList.create?.length>0" style="width: 80%" :bordered="false" hoverable size="small">
						<template #header>
							{{$t("util.created")}}:
						</template>
						<a-list-item v-for="item in organizationList.create as ICommon_Model_Organization[]" style="cursor: pointer;justify-content: center;" @click="onDesktop(item.id)">
							<div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center">
								<a-space>
									<a-image :src="item.photo" width="50px" v-if="item.photo"></a-image>
									<span style="font-size: larger">{{item.name}}</span>
								</a-space>
							</div>
						</a-list-item>
					</a-list>
					<a-list v-if="organizationList.join?.length>0" style="width: 80%" :bordered="false" hoverable size="small">
						<template #header>
							{{$t("util.joined")}}:
						</template>
						<a-list-item v-for="item in organizationList.join as ICommon_Model_Organization[]" style="cursor: pointer" @click="onDesktop(item.id)">
							<div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center">
								<a-space>
									<a-image :src="item.photo" width="50px"  v-if="item.photo"></a-image>
									<span style="font-size: larger">{{item.name}}</span>
								</a-space>
							</div>
						</a-list-item>
					</a-list>
				</template>
				<a-button type="text" style="color: grey;margin-top: 20px" @click="onDesktop()">{{$t("util.skip")}}</a-button>
			</div>
		</div>

	</a-row>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, reactive, ref} from "vue";
import {apiGateway, apiOrganization, apiUser} from "../../common/request/request";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import {NotificationWrapper} from "../../common/component/notification/notification";
import {SessionStorage} from "../../common/storage/session";
import md5 from "blueimp-md5"
import {DCSType, ECommon_Platform_Type} from "../../../../../common/types";
import {ICommon_Route_Res_Organization_List} from "../../../../../common/routes/response";
import {ICommon_Model_Organization} from "../../../../../common/model/organization";
import {Dialog} from "@/business/common/component/dialog/dialog";
import CreateOrganization from "@/business/controller/desktop/createOrganization.vue";
import {useI18n} from "vue-i18n";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";

const organizationList=ref<DCSType<ICommon_Route_Res_Organization_List>>()
let form = reactive({
	username: "",
	password: ""
})
const appContext=getCurrentInstance().appContext
const store=useDesktopStore()
const {t}=useI18n()
let router = useRouter();
const login=(userId:string)=>{
	SessionStorage.remove("organizationId")
	SessionStorage.set("userId",userId);
	getOrganizationList()
	store.initNotificationSocket()
}


const onSubmit = async () => {
	let ret = await apiUser.login({
		username: form.username,
		password: md5(form.password),
		lang:localStorage.getItem("lang")??(navigator.language || "en").toLowerCase().split("-")[0],
		platform:ECommon_Platform_Type.WEB
	})
	if (ret.code == 0) {
		login(ret.data.id)
	} else {
		Message.error(ret.msg);
	}
}

const onDesktop=async (organizationId?:string)=>{
	if(organizationId) {
		SessionStorage.set("organizationId",organizationId)
		let retEnter=await apiOrganization.enter({
			organizationId
		});
		if(retEnter?.code==0) {
			SessionStorage.set("organizationUserId",retEnter.data.organizationUserId)
		}
	}
	NotificationWrapper.init()
	await router.push("desktop")
}

const onRegister = async () => {
	await router.push("register")
}

const onReset = async () => {
	await router.push("reset")
}

const onCreate=async ()=>{
	let ret=await Dialog.open(document.body,appContext,t("controller.desktop.desktop.createOrganization"),markRaw(CreateOrganization))
	if(ret) {
		getOrganizationList()
	}
}

const onWechat=async ()=>{
	SessionStorage.remove("wechatOpenId")
	let res=await apiGateway.wechatAppId()
	if(res?.code==0) {
		window.open(`https://open.weixin.qq.com/connect/qrconnect?appid=${res.data.appId}&redirect_uri=${encodeURIComponent(location.protocol+"//"+location.host+"/#/wechat")}&response_type=code&scope=snsapi_login#wechat_redirect`,"_blank","popup=yes,width=600,height=600,top=100,left=300")
		window.onmessage= async ev => {
			let openId=ev.data
			let res=await apiUser.wechatLogin({
				openId,
				lang:localStorage.getItem("lang")??(navigator.language || "en").toLowerCase().split("-")[0],
				platform:ECommon_Platform_Type.WEB
			})
			if(res?.code==0) {
				if(res.data) {
					login(res.data.id)
				} else {
					SessionStorage.set("wechatOpenId",openId)
					let ret=await Dialog.confirm(document.body,appContext,t("tip.bindExistedAccount"))
					if(ret) {
						await router.replace("bindAccount")
					} else {
						await router.replace("register")
					}
				}
			}
		}
	}
}

const getOrganizationList=async ()=>{
	let ret=await apiOrganization.list()
	if(ret && ret.code==0) {
		organizationList.value=ret.data;
	}
}
</script>

<style scoped>

</style>