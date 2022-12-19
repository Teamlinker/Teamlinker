<template>
<div style="background-color: blanchedalmond">7777777  <button v-navigator:[navigator]="{name:'test5',props:{name:'xxxxxxxxx'}}">click</button></div>
</template>

<script setup lang="ts">
import {inject} from "vue";
import {getCurrentNavigator, Navigator, onNavigatorShow} from "./teamOS/common/component/navigator/navigator";
import {vNavigator} from "./teamOS/common/directive/navigator";

vNavigator;
let navigator=getCurrentNavigator();
onNavigatorShow((action)=>{
  console.log(action)
})
</script>

<style scoped>

</style>