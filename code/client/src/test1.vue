<template>
  <div style="color: rebeccapurple">
    111111
    <button @click="onClick" draggable="true">back</button>
    <button @click="push" draggable="true">push</button>
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
import {inject, onMounted, ref} from "vue"
import {getCurrentNavigatorMeta, Navigator} from "./teamOS/common/component/navigator/navigator";

let visible=ref(false)
let obj=inject("navigator",null) as Navigator;
const onClick=()=>{
  obj.back();
}
const go=()=>{
  obj.go()
}
const push=()=>{
  obj.push("test3",{
    time:Date.now()
  })
}
let meta=getCurrentNavigatorMeta<string>()
if(meta) {
  meta.title="eee"
}
onMounted(()=>{
  console.log("mounted test1")
})
</script>

<style scoped>

</style>