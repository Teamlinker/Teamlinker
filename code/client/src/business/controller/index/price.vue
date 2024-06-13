<template>
  <div style="overflow: hidden;margin-bottom: 40px">
  <div  class="topBg" style="width: 100%;height: 360px;">
    <div style="width:100%;height: 84px;padding-top:139px;text-align:center;font-size: 3.75rem;font-family: PingFangSC, PingFang SC;font-weight: 600;color: #FFFFFF;line-height: 84px;">{{$t("controller.index.price.choosePlan")}}</div>
  </div>

  <div style="margin:0px 20%;padding-top: 20px;">
    <div style="float:left; background-color: rgba(255, 255, 255, 1);border-radius: 8px;width: 40%;height: 580px;border: 1px solid rgba(201, 201, 201, 1);">
      <div style="background-color: rgba(0, 160, 255, 1);border-radius: 8px 8px 0px 0px;height: 80px;width: 100%;text-align: center">
        <span style="overflow-wrap: break-word;color: rgba(255, 255, 255, 1);font-size: 2rem;font-family: PingFangSC, PingFang SC;font-weight: 500;text-align: center;white-space: nowrap;line-height: 75px;">{{$t("controller.index.price.onlineEdition")}}</span>
      </div>
      <div style="overflow-wrap: break-word;
    color: rgba(0, 160, 255, 1);
font-size: 3.125rem;
font-family: PingFangSC, PingFang SC;
font-weight: 600;
color: #00A0FF;
line-height: 70px;
    text-align: center;
    white-space: nowrap;
    margin-top: 20px;
    text-align:center">{{$t("util.free")}}</div>

      <div style="box-shadow: inset 0px -1px 0px 0px rgba(201, 201, 201, 1);
    background-color: rgba(255, 255, 255, 1);
    height: 30px;
    width: 90%;
    margin: 0px auto;
    padding-top: 20px;
    padding-bottom: 20px;
    text-align: center">
        <span class="text_10">✓</span>
        <span class="text_11">&nbsp;</span>
        <span class="text_12">{{$t("controller.index.price.1")}}</span>
      </div>

      <div style="box-shadow: inset 0px -1px 0px 0px rgba(201, 201, 201, 1);
    background-color: rgba(255, 255, 255, 1);
    height: 30px;
    width: 90%;
    margin: 0px auto;
    padding-top: 20px;
    padding-bottom: 20px;
    text-align: center">
        <span class="text_10">✓</span>
        <span class="text_11">&nbsp;</span>
        <span class="text_12">{{$t("controller.index.price.2")}}</span>
      </div>

      <div style="box-shadow: inset 0px -1px 0px 0px rgba(201, 201, 201, 1);
    background-color: rgba(255, 255, 255, 1);
       height: 30px;
    width: 90%;
    margin: 0px auto;
    padding-top: 20px;
    padding-bottom: 20px;text-align: center">
        <span class="text_10">✓</span>
        <span class="text_11">&nbsp;</span>
        <span class="text_12">{{$t("controller.index.price.3")}}</span>
      </div>

      <div style="box-shadow: inset 0px -1px 0px 0px rgba(201, 201, 201, 1);
    background-color: rgba(255, 255, 255, 1);
    height: 30px;
    width: 90%;
    margin: 0px auto;
    padding-top: 20px;
    padding-bottom: 20px;text-align: center">
        <span class="text_19">{{$t("controller.index.price.4")}} : 5MB</span>
      </div>

      <div style="margin: 0px auto;text-align: center">
        <a-button style="width: 80%;
height: 60px;
background: #00A0FF;font-size: 1.375rem;
font-family: PingFangSC, PingFang SC;
font-weight: 500;
color: #FFFFFF;
line-height: 30px;margin-top: 20px" @click="onRegister">{{$t("controller.index.home.section5.3")}}</a-button>
      </div>
    </div>

    <div style="float:right; background-color: rgba(255, 255, 255, 1);border-radius: 8px;width: 40%;height: 580px;border: 1px solid rgba(201, 201, 201, 1);">
      <div style="background-color: #2864FF;border-radius: 8px 8px 0px 0px;height: 80px;width: 100%;text-align: center">
        <span style="overflow-wrap: break-word;color: rgba(255, 255, 255, 1);font-size: 2rem;font-family: PingFangSC, PingFang SC;font-weight: 500;text-align: center;white-space: nowrap;line-height: 75px;">{{$t("controller.index.price.offlineEdition")}}</span>
      </div>
      <div style="overflow-wrap: break-word;
    color: rgba(0, 160, 255, 1);
font-size: 3.125rem;
font-family: PingFangSC, PingFang SC;
font-weight: 600;
color: #00A0FF;
line-height: 70px;
    text-align: center;
    white-space: nowrap;
    margin-top: 20px;
    text-align:center">{{$t("util.free")}}</div>

      <div style="box-shadow: inset 0px -1px 0px 0px rgba(201, 201, 201, 1);
    background-color: rgba(255, 255, 255, 1);
    height: 30px;
    width: 90%;
    margin: 0px auto;
    padding-top: 20px;
    padding-bottom: 20px;
    text-align: center">
        <span class="text_10">✓</span>
        <span class="text_11">&nbsp;</span>
        <span class="text_12">{{$t("controller.index.price.1")}}</span>
      </div>

      <div style="box-shadow: inset 0px -1px 0px 0px rgba(201, 201, 201, 1);
    background-color: rgba(255, 255, 255, 1);
    height: 30px;
    width: 90%;
    margin: 0px auto;
    padding-top: 20px;
    padding-bottom: 20px;
    text-align: center">
        <span class="text_10">✓</span>
        <span class="text_11">&nbsp;</span>
        <span class="text_12">{{$t("controller.index.price.2")}}</span>
      </div>

      <div style="box-shadow: inset 0px -1px 0px 0px rgba(201, 201, 201, 1);
    background-color: rgba(255, 255, 255, 1);
       height: 30px;
    width: 90%;
    margin: 0px auto;
    padding-top: 20px;
    padding-bottom: 20px;text-align: center">
        <span class="text_10">✓</span>
        <span class="text_11">&nbsp;</span>
        <span class="text_12">{{$t("controller.index.price.3")}}</span>
      </div>


      <div style="box-shadow: inset 0px -1px 0px 0px rgba(201, 201, 201, 1);
    background-color: rgba(255, 255, 255, 1);
    height: 30px;
    width: 90%;
    margin: 0px auto;
    padding-top: 20px;
    padding-bottom: 20px;text-align: center">
        <span class="text_10">✓</span>
        <span class="text_11">&nbsp;</span>
        <span class="text_12">{{$t("controller.index.price.5")}}</span>
      </div>

      <div style="margin: 0px auto;text-align: center">
        <a-button style="width: 75%;
height: 60px;
background: #2864FF;font-size: 1.375rem;
font-family: PingFangSC, PingFang SC;
font-weight: 500;
color: #FFFFFF;
line-height: 30px;margin-top: 20px">{{$t("controller.index.home.section5.4")}}</a-button>
      </div>
    </div>

  </div>

  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";

const router=useRouter()
const onRegister=async()=>{
	await router.push("register")
}
</script>

<style scoped>
.topBg{
  height: 360px;
  background: url('@/assert/priceTopBg.png') 100% no-repeat;
  background-size: 100% 100%;
  width: 1920px;
}
.text_10 {
  width: auto;
  height: 30px;
  overflow-wrap: break-word;
  color: rgba(0, 171, 68, 1);
  font-size: 1.375rem;
  font-family: LucidaGrande;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 26px;
}

.text_11 {
  width: auto;
  height: 30px;
  overflow-wrap: break-word;
  color: rgba(86, 86, 86, 1);
  font-size: 1.375rem;
  font-family: LucidaGrande;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 26px;
}

.text_12 {
  width: auto;
  height: 30px;
  overflow-wrap: break-word;
  color: rgba(86, 86, 86, 1);
  font-size: 1.375rem;
  font-family: PingFangSC-Regular;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 26px;
}

.text_19 {
  width: auto;
  height: 30px;
  overflow-wrap: break-word;
  color: rgba(86, 86, 86, 1);
  font-size: 1.375rem;
  font-family: PingFangSC-Regular;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 30px;
  margin-top: 20px;
}
</style>