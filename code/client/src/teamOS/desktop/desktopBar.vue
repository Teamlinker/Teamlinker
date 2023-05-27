<template>
  <a-row>
    <a-col flex="80px" style="height: 100%;justify-content: center;align-items: center;display: flex">
      <slot name="topLeft"></slot>
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
	    <slot name="topRight"></slot>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import {desktop} from "./desktop";
import {windowManager} from "../window/windowManager";
import {ETeamOS_Window_Status} from "../window/window.js";
import Sicon from "../../icon/sicon.vue";
import {iconGroupMap} from "../icon/icon";

const list=windowManager.getList();
const color=desktop.getBaseColor();
</script>

<style scoped>

</style>