<template>
  <TeamOS/>
</template>

<script setup lang="ts">

import TeamOS from "../../../teamOS/index.vue";
import img from "../../../assert/back.png"
import {getDesktopInstance} from "../../../teamOS/teamOS";
import {getCurrentInstance, markRaw, nextTick, onBeforeMount, watchEffect} from "vue";
import {useDesktopStore} from "./store/desktop";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../common/component/dialog/dialog";
import {ETeamOS_Window_Type, Window} from "../../../teamOS/window/window";
import {v4} from "uuid";
import Account from "../app/account/account.vue";
import {SessionStorage} from "../../common/storage/session";

let desktop=getDesktopInstance().desktop;
desktop.setBackgroundImage(img)
const store=useDesktopStore()
const router=useRouter();
let iconManager=getDesktopInstance().iconManager
let windowManager=getDesktopInstance().windowManager
const appContext=getCurrentInstance().appContext
onBeforeMount(async ()=>{
  let isAuth=await store.isAuth();
  if(!isAuth) {
    await router.replace("login");
    return
  }
  await store.getOrganizationList()
  if(SessionStorage.get("organizationId")) {
    await store.enterOrganization(SessionStorage.get("organizationId"))
  }
  desktop.addEventListener("menuClick",async value => {
    await store.enterOrganization(value);
  })
  desktop.setAvatarOptions([{
    name:"Account",
    clickFunc:()=>{
      const win=new Window("account",ETeamOS_Window_Type.SIMPLE, "account",true,[
        {
          id:v4(),
          meta:{
            title:"account"
          },
          components:{
            account:markRaw(Account)
          },
          default:{
            name:"account"
          }
        }
      ],"account");
      windowManager.open(win);
    }
  },{
    name:"Logout",
    clickFunc:async ()=>{
      let ret=await Dialog.confirm(document.body,appContext,"Do you want to log out?")
      if(ret) {
        let res=await store.logout();
        if(res) {
          Message.success("logout success")
          watchStop();
          desktop.clear()
          iconManager.clear()
          windowManager.clear();
          await router.replace("login");
        }
      }
    }
  }])
})
const watchStop=watchEffect(()=>{
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
    if(store.userInfo?.photo) {
      desktop.setAvatar(store.userInfo.photo)
    }
    if(SessionStorage.get("organizationId")) {
      desktop.setMenu(arr,SessionStorage.get("organizationId"))
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