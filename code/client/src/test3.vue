<template>
 <div>zzzzzzz{{time}}
  <button @click="onClick" draggable="true">home</button>
   <NavigatorContainer :routes="router" :default="{name:'test4'}" name="nav1"></NavigatorContainer>
 </div>
</template>

<script setup lang="ts">
import {inject, markRaw, onMounted} from "vue";
import {Navigator} from "./teamOS/common/component/navigator/navigator";
import NavigatorContainer from "./teamOS/common/component/navigator/navigatorContainer.vue";
import Test4 from "./test4.vue";
import Test5 from "./test5.vue";

defineProps<{
  time?:number
}>()
let obj=inject("navigator",null) as Navigator;
const onClick=()=>{
  obj.replace("test")
}
let router={
  test4:markRaw(Test4),
  test5:markRaw(Test5)
}
onMounted(()=>{
  console.log("mounted test3")
})
</script>

<style scoped>

</style>