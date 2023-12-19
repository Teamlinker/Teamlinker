<template>
  <a-row class="row" style="font-size:14px;width: 120px;">
    <a-row class="row" v-for="(item,index) in data" style="height: 35px;line-height: 35px;overflow: hidden;text-overflow: ellipsis;width: 100%;padding-left: 10px;padding-right: 10px" @mouseenter="$event.currentTarget.style.backgroundColor='rgba(39,139,207,0.6)'" @mouseleave="$event.currentTarget.style.backgroundColor=''" @click="select(item)" justify="left" align="center" :style="{borderBottom:index!=data.length-1?'1px solid rgb(230,230,230)':''}">
	    <template v-if="item.icon">
		    <sicon name="Ant" :type="item.icon" color="" size=""></sicon>&nbsp;&nbsp;
	    </template>
      {{item.title}}
    </a-row>
  </a-row>
</template>

<script setup lang="ts">

import {ITeamOS_Menu} from "../type";

const props=defineProps<{
  data:ITeamOS_Menu[],
}>()
const select=(item:ITeamOS_Menu)=>{
  if(item.func) {
    item.func(item.value);
  }
}
</script>