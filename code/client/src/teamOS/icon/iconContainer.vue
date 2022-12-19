<template>
  <div id="teamOS-iconWindow" style="position: relative;overflow: hidden" v-menu.self="menu">
    <IconItem v-for="(item,index) in iconList" :index="index" :item="item" :key="item.id"></IconItem>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {iconManager} from "./iconManager";
import IconItem from "./iconItem.vue";
import {vMenu} from "../common/directive/menu";
import {ITeamOS_Menu} from "../common/type";

vMenu;
let iconList=iconManager.getList();
let menu:ITeamOS_Menu[]=[
  {
    icon:"sort-ascending",
    title:"sort",
    value:null,
    func:(value:any)=>{
      iconManager.sort();
    }
  }
]
</script>

<style scoped>

</style>