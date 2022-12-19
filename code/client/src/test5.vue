<template>
  <div style="background-color: cornflowerblue">55555555{{name}}</div>
</template>

<script setup lang="ts">
import {getCurrentNavigatorManager, getCurrentNavigatorMeta} from "./teamOS/common/component/navigator/navigator";
import {useStore} from "./business/common/store/store";
import {testStore} from "./testStore";

defineProps<{
  name?:string
}>()
let meta=getCurrentNavigatorMeta<string>()
if(meta) {
  meta.title="11"
}
let store=useStore(getCurrentNavigatorManager().id,testStore)
store.aaa();
</script>

<style scoped>

</style>