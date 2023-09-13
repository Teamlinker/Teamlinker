<template>
  <div id="teamOS-iconWindow" style="position: relative;overflow: hidden;display: grid;grid-template-rows:repeat(auto-fill,120px);grid-template-columns: repeat(auto-fill,100px);grid-auto-flow: column;align-items: center;justify-items: center;padding-top: 20px;box-sizing: border-box">
    <IconItem v-for="(item,index) in iconList" :index="index" :item="item" :key="item.id" :id="item.meta+'Icon'"></IconItem>
	  <slot name="finderItemList"></slot>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {iconManager} from "./iconManager";
import IconItem from "./iconItem.vue";


let iconList=iconManager.getList();

</script>

<style scoped>

</style>