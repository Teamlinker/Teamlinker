<template>
  <div class="commonBox">
    <a-row style="width: 100%;margin: 0px auto;height: 100%">
      <a-col :span="10" style="background:#F2F6FA;height: 100%">
        <!--<div class="commonL" style="width: 100%"></div>-->
        <div style="background:#F2F6FA;min-width:40rem"><img :src="loginBg" style="width: 95%; aspect-ratio: auto;"/></div>
      </a-col>
      <a-col :span="14">
      <div class="commonR">
        <div style="width: 100%;height: 34px">
          <div style="display: flex; flex-direction: row;float: left">
            <img :src="logo2">
            <!--<div class="logo-box"><span class="logo-l">T</span></div>
            <span class="logo-r">eamlinker</span>-->
          </div>
          <div class="commonTopR" style="float: right"><a-link @click="onIndex">{{$t("controller.login.goToHomePage")}}</a-link></div>
        </div>
        <div class="commonHi" style="margin-top: 46px">{{$t("controller.login.welcomeBack")}}！</div>
        <div class="commonSubTitle" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE" style="margin-top: 13px;margin-bottom: 55px;">{{$t("controller.login.noAccount")}}？<a-link @click="onRegister">{{$t("controller.login.signUp")}}</a-link></div>
        <div>
          <a-form :model="form"  auto-label-width @submit="onSubmit" v-if="!organizationList">
            <span class="commonTitle">{{$t('util.username')}}</span>
            <a-form-item field="username" required>
              <a-input v-model="form.username" :placeholder="$t('placeholder.enterUsername')" class="formInput"></a-input>
            </a-form-item>
            <span class="commonTitle" style="margin-top: 20px">{{$t('util.password')}}</span>
            <a-form-item field="password" required>
              <a-input v-model="form.password" type="password" :placeholder="$t('placeholder.typePassword')" class="formInput"></a-input>
            </a-form-item>

            <a-form-item>
              <a-row style="justify-content: center;width: 100%">
                <span style="width:100%;text-align:right;" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE"><a-link @click="onReset" style="font-size: 18px;font-family: PingFangSC, PingFang SC;font-weight: 500;color: #2864FF;line-height: 25px;">{{$t("controller.login.forgetPassword")}}？</a-link></span>
	              <a-button html-type="submit" type="primary" style="width: 100%; height: 60px;background: #2864FF;font-size: 22px;
  font-family: PingFangSC, PingFang SC;font-weight: 500;color: #FFFFFF;line-height: 30px;margin-top: 45px">{{ $t("util.login") }}</a-button>
                <div style="text-align: center" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
                  <div style="width: 40rem;margin-top: 40px; margin-bottom: 15px;font-size: 18px">{{$t("controller.login.thirdLogin")}}</div>
                  <a-button type="text" @click="onWechat">
                    <template #icon>
                      <icon-wechat style="color: green;font-size: x-large;border: 1px solid #C9C9C9;border-radius: 8px;padding: 5px"></icon-wechat>
                    </template>
                  </a-button>
                </div>
              </a-row>
            </a-form-item>
          </a-form>
	        <div v-else style="display: flex;flex-direction: column;justify-content: center;align-items: center">
		        <h2 style="text-align: center;">{{$t("util.organizationList")}}</h2>
		        <template v-if="organizationList.create?.length>0 || organizationList.join?.length>0">
			        <div v-if="organizationList.create?.length>0" style="width: 80%">
				        <span style="font-weight: bold">{{$t("util.created")}}:</span><br>
				        <a-space style="margin-top: 20px" wrap>
					        <a-tag v-for="item in organizationList.create as ICommon_Model_Organization[]" style="cursor: pointer;" @click="onDesktop(item.id)">
						        <span style="font-size: larger">{{item.name}}</span>
					        </a-tag>
				        </a-space>
			        </div>
			        <div v-if="organizationList.join?.length>0" style="width: 80%;margin-top: 20px" >
				        <span style="font-weight: bold">
					        {{$t("util.joined")}}:
				        </span><br>
				        <a-space style="margin-top: 20px" wrap>
					        <a-tag v-for="item in organizationList.join as ICommon_Model_Organization[]" style="cursor: pointer;" @click="onDesktop(item.id)">
						        <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center">
							        <span style="font-size: larger">{{item.name}}</span>
						        </div>
					        </a-tag>
				        </a-space>
			        </div>
		        </template>
		        <a-button type="primary" status="success" @click="onCreate" size="large" style="width: 200px;" v-else-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
			        {{$t("controller.desktop.desktop.createOrganization")}}
		        </a-button>
		        <a-button type="text" style="color: grey;margin-top: 20px" @click="onDesktop()">{{$t("util.skip")}}</a-button>
	        </div>
        </div>
      </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, reactive, ref} from "vue";
import {apiGateway, apiOrganization, apiUser} from "../../common/request/request";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import {NotificationWrapper} from "../../common/component/notification/notification";
import {SessionStorage} from "../../common/storage/session";
import md5 from "blueimp-md5"
import {DCSType, ECommon_Application_Mode, ECommon_Platform_Type} from "../../../../../common/types";
import {ICommon_Route_Res_Organization_List} from "../../../../../common/routes/response";
import {Dialog} from "@/business/common/component/dialog/dialog";
import CreateOrganization from "@/business/controller/desktop/createOrganization.vue";
import {useI18n} from "vue-i18n";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";
import loginBg from "@/assert/loginBg.png"
import logo2 from "@/assert/logo2.png";
import {ICommon_Model_Organization} from "../../../../../common/model/organization";

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
const onIndex=async()=>{
  await router.push("/")
}
</script>

<style scoped>
.commonBox{
  background-color: #FFFFFF;
  height: 100vh;
}
.commonL{
  float: left;
  height: 860px;
  background: url('@/assert/loginBg.png') 100% no-repeat,#F2F6FA;
  background-size: 100% 100%;
  width: auto;
}
.commonR{
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
.commonSubTitle{
  font-size: 18px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #565656;
  line-height: 25px;
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