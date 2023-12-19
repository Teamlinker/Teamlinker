<template>
  <WindowItem v-for="(item,index) in windowList" :item="item" :index="index" :key="item.id"></WindowItem>
</template>

<script setup lang="ts">
import {windowManager} from "./windowManager";

import WindowItem from "./windowItem.vue";


let windowList=windowManager.getList();

</script>

<style scoped>

</style>