<template>
  <a-row>
    <a-col flex="80px" style="height: 100%">
      <a-row align="center" justify="center" style="height: 100%">
        <img :src="logo" style="max-height: 100%;max-width: 100%;height: auto;width: auto"/>
      </a-row>
    </a-col>
    <a-col flex="auto" style="height: 100%;padding-left: 50px">
      <a-row style="height: 100%" align="center" justify="start" :wrap="false">
        <a-col v-for="item in list" :key="item.id" flex="auto" style="height: 80%;line-height: 32px;max-width: 200px;text-align: center;box-shadow: 0px 2px 2px rgba(93, 93, 93, 0.2);margin-left: 5px;cursor: pointer;color: rgb(249,249,249);border-radius: 3px;color: rgb(249,249,249)" :style="{backgroundColor:item.isFocus?`rgb(255,255,255,0.3)`:`rgb(255,255,255,0.1)`}" @click="item.status==ETeamOS_Window_Status.MIN?windowManager.show(item.id):windowManager.setFocus(item.id)">
          {{item.title}}
        </a-col>
      </a-row>
    </a-col>
    <a-col flex="150px" style="height: 100%;" id="teamOS-Desktop-Menu">
      <a-row align="center" justify="center" style="height: 100%;">
        <a-select style="width: 100%;" placeholder="organization" :bordered="false" @change="onMenuClick" v-model:model-value="menuValue">
          <a-optgroup v-for="(item,index) in menu" :label="item.group">
            <a-option v-for="(item1,index1) in item.data" :label="item1.name" :value="item1.value"></a-option>
          </a-optgroup>
        </a-select>
      </a-row>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import {desktop} from "./desktop";
import {windowManager} from "../window/windowManager";
import {ETeamOS_Window_Status} from "../window/window.js";

const logo=desktop.getLogo();
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