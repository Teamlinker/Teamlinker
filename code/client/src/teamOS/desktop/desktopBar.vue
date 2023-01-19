<template>
  <a-row>
    <a-col flex="80px" style="height: 100%;text-align: center;">
      <a-dropdown trigger="hover">
        <a-avatar :size="32" :image-url="avatar" style="margin-top: 4px">T</a-avatar>
        <template #content>
          <a-doption v-for="item in avatarOptions" @click="item.clickFunc">{{item.name}}</a-doption>
        </template>
      </a-dropdown>
    </a-col>
    <a-col flex="auto" style="height: 100%;padding-left: 30px">
      <a-row style="height: 100%" align="center" justify="start" :wrap="false">
        <a-col v-for="item in list" :key="item.id" flex="auto" style="height: 80%;line-height: 32px;max-width: 150px;text-align: center;box-shadow: 0px 2px 2px rgba(93, 93, 93, 0.2);margin-left: 5px;cursor: pointer;color: rgb(249,249,249);border-radius: 3px;color: rgb(249,249,249)" :style="{backgroundColor:item.isFocus?`rgb(255,255,255,0.3)`:`rgb(255,255,255,0.1)`}" @click="item.status==ETeamOS_Window_Status.MIN?windowManager.show(item.id):windowManager.setFocus(item.id)">
          <a-space>
            <sicon size="18" color="white" name="Ant" :type="iconGroupMap[item.group]"></sicon>
            {{item.title}}
          </a-space>
        </a-col>
      </a-row>
    </a-col>
    <a-col flex="250px" style="height: 100%;" id="teamOS-Desktop-Menu">
      <a-row style="height: 100%;" align="center">
        <a-col flex="80px" style="align-items: center;display: flex">
          <img :src="logo" style="height: 36px;width:80px;object-fit: cover;object-position: 50% 50%;" v-if="logo"/>
        </a-col>
        <a-col flex="170px">
          <a-select style="max-width: 170px;color: white" placeholder="organization" :bordered="false" @change="onMenuClick" v-model:model-value="menuValue">
            <a-optgroup v-for="(item,index) in menu" :label="item.group">
              <a-option v-for="(item1,index1) in item.data" :label="item1.name" :value="item1.value"></a-option>
            </a-optgroup>
          </a-select>
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import {desktop} from "./desktop";
import {windowManager} from "../window/windowManager";
import {ETeamOS_Window_Status} from "../window/window.js";
import Sicon from "../../icon/sicon.vue";
import {iconGroupMap} from "../icon/icon";

const logo=desktop.getLogo();
const avatar=desktop.getAvatar();
const avatarOptions=desktop.getAvatarOptions()
const menu=desktop.getMenu();
const list=windowManager.getList();
const color=desktop.getBaseColor();
const menuValue=desktop.getMenuValue()
const onMenuClick=(value:string)=>{
  if(desktop.onMenuClick) {
    desktop.onMenuClick(value)
  }
}
</script>

<style scoped>

</style>