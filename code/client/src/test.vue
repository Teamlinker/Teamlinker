<template>
  <div style="color: rebeccapurple">
    efewfwefew<h1>{{name}}</h1>{{aa}}
    <button @click="onClick" draggable="true">133</button>
    <button @click="go" draggable="true">go</button>
      <a-modal v-model:visible="visible" :render-to-body="false" style="position: absolute">
        <template #title>
          Title
        </template>
        <div>You can cusstomize modal body text by the current situation. This modal will be closed immediately once you press the OK button.</div>
      </a-modal>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue"
import {getCurrentNavigator, getCurrentNavigatorManager} from "./teamOS/common/component/navigator/navigator";
import {useStore} from "./business/common/store/store";
import {testStore} from "./testStore";

defineProps<{
  name?:string
}>()
let visible=ref(false)
const onClick=()=>{
  visible.value=true
}
let obj=getCurrentNavigator()
const go=()=>{
  obj.push("test1")
}
let aa=reactive<any>({})
aa.name=123
aa.aaa="fdf"
let store=useStore(getCurrentNavigatorManager().id,testStore);
console.log(store.name);
</script>

<style scoped>

</style>