<template>
  <div class="footerBox">
    <div class="footerBg">
      <div style="overflow: hidden;margin: 0px 14%;display: flex; justify-content: space-between">
        <div style="float:left;margin-bottom: 30px">
          <ul class="footerList">
            <li @click="$emit('change','product')">{{$t("util.home")}}</li>
            <li @click="onManual">{{$t("util.help")}}</li>
            <li @click="$emit('change','price')">{{$t("util.price")}}</li>
            <li>
	            <a-space size="medium">
		            <a-popover>
			            <icon-qq style="font-size: larger"></icon-qq>
			            <template #content>
				            <img :src="qq" style="width: 250px;height: auto"/>
			            </template>
		            </a-popover>
		            <a href="https://discord.gg/Yj94qwF8AX" target="_blank"><img :src="discord" style="height: 20px;transform: translateY(3px);"/></a>
	            </a-space>
            </li>
            <li>{{$t("util.about")}}</li>
            <li>teamlinkeronline&#64;gmail.com</li>
          </ul>
          <a-select size="mini" style="width: 100px;margin-left: 21%;margin-top: 10px" v-model="language">
            <a-option value="zh">简体中文</a-option>
            <a-option value="en">English</a-option>
          </a-select>
        </div>
        <div class="footerR">
          <div>
            <img :src="footerQq" style="margin-right: 60px;"/>
            <img :src="footerDiscord"/>
          </div>
        </div>
      </div>
      <div class="footerBottom">
        <img :src="footerLogo" style="width: auto; aspect-ratio: auto;margin-top: 5px"/>
        <span>© 2022-2023 Teamlinker Labs,Inc <a style="color: #00A0FF" href="https://beian.miit.gov.cn/" target="_blank" v-if="language==='zh'">皖ICP备2023006742号</a></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import footerQq from "@/assert/footerQq.png"
import footerDiscord from "@/assert/footerDiscord.png"
import footerLogo from "@/assert/footerLogo.png"
import {apiUser} from "@/business/common/request/request";
import {useI18n} from "vue-i18n";
import qq from "@/assert/qq.jpg"
import discord from "@/assert/discord.png"

const {t}=useI18n()
const emit=defineEmits<{
	change:[name:string]
}>()
const getLang=()=>{
	let lang=localStorage.getItem("lang")
	if(lang) {
		if(lang==="zh") {
			return "zh"
		} else {
			return "en"
		}
	} else {
		let lang=(navigator.language || "en").toLowerCase().split("-")[0]
		if(lang==="zh") {
			return "zh"
		} else {
			return "en"
		}
	}
}
const language=ref(getLang())
watch(language,async ()=>{
	localStorage.setItem("lang",language.value)
	await apiUser.changeLang({
		lang:language.value
	})
	location.reload()
})


const onManual=()=>{
	window.open(t("controller.index.home.docLink"),"_blank")
}
</script>

<style scoped>
.footerBox{
  height: auto;
  width: 100%;
  margin-bottom: 1px;
  background-color: #39394D;
}
.footerBg{
  background-image: url('@/assert/footerBg.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.footerList{
  width: 40%;
  height: 7.87rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  list-style: none;
  margin: 0px;
  padding: 0px;
  margin-top: 60px;
}
.footerList li {
  width: 48%;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 1.25rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #FFFFFF;
  line-height: 1.75rem;
}
.footerList li* {
  text-decoration: none;
}
.footerR{
  float: left;
  margin-top: 4.05rem;
  width: 60%;
  display: flex;
  justify-content: center;
}
.footerBottom{
  width: 66%;
  height: 3.75rem;
  margin: 0px auto;
  margin-top: 6.125rem;
  padding-bottom: 3.75rem;
  display: flex;
  justify-content: space-between;
}
.footerBottom span{
  font-size: 1.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #FFFFFF;
  line-height: 2.06rem;
  float: right;
  margin-top: 27px;
  white-space: nowrap;
  text-align: left;
  margin-right: 15%;
}
</style>