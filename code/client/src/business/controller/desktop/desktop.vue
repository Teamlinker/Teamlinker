<template>
  <TeamOS/>
</template>

<script setup lang="ts">

import TeamOS from "../../../teamOS/index.vue";
import img from "../../../assert/back.png"
import {getDesktopInstance} from "../../../teamOS/teamOS";
import {nextTick, onBeforeMount, watchEffect} from "vue";
import {useDesktopStore} from "./store/desktop";
import {useRouter} from "vue-router";

let desktop=getDesktopInstance().desktop;
desktop.setBackgroundImage(img)
const store=useDesktopStore()
const router=useRouter();
let iconManager=getDesktopInstance().iconManager

onBeforeMount(async ()=>{
  let isAuth=await store.isAuth();
  if(!isAuth) {
    await router.replace("login");
    return
  }
  await store.getOrganizationList()
  if(sessionStorage.getItem("organizationId")) {
    await store.enterOrganization(sessionStorage.getItem("organizationId"))
  }
  desktop.addEventListener("menuClick",async value => {
    await store.enterOrganization(value);
  })
})
watchEffect(()=>{
  if(store.organizationList) {
    let arr=[]
    if(store.organizationList.create.length>0) {
      arr.push({
        group:"Create",
        data:store.organizationList.create.map(item=>{
          return {
            name:item.name,
            value:item.id
          }
        })
      })
    }
    if(store.organizationList.join.length>0) {
      arr.push({
        group:"Join",
        data:store.organizationList.join.map(item=>{
          return {
            name:item.name,
            value:item.id
          }
        })
      })
    }
    if(store.organizationInfo?.photo) {
      desktop.setLogo(store.organizationInfo.photo)
    }
    if(sessionStorage.getItem("organizationId")) {
      desktop.setMenu(arr,sessionStorage.getItem("organizationId"))
    } else {
      desktop.setMenu(arr)
    }
  }
  iconManager.setList(store.appList)
  nextTick(()=>{
    iconManager.sort()
  })

})
</script>

<style scoped>

</style>