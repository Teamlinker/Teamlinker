<template>
  <a-layout style="height: 100%">
    <a-layout-sider :resize-directions="['right']">
      <a-menu style="width: 100%" @menu-item-click="onSubMenuClick" :default-selected-keys="['profile']">
        <a-menu-item key="profile">{{$t("controller.app.account.account.profile")}}</a-menu-item>
        <a-menu-item key="accountSetting">{{$t("controller.app.account.account.accountSetting")}}</a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content style="flex-direction: column;display: flex;padding: 10px">
      <a-breadcrumb style="margin: 10px 0;flex: 0 1 auto">
        <a-breadcrumb-item v-for="item in pathList">{{item}}</a-breadcrumb-item>
      </a-breadcrumb>
      <a-divider margin="0"></a-divider>
      <div style="width: 100%;display: flex;flex: 1 1 auto;padding-top: 20px">
        <NavigatorContainer :routes="objComponent" ref="eleNavigator"></NavigatorContainer>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import {computed, markRaw, onMounted, ref} from "vue";
import NavigatorContainer from "../../../../teamOS/common/component/navigator/navigatorContainer.vue";
import Profile from "./profile.vue";
import AccountSetting from "./accountSetting.vue";
import {useI18n} from "vue-i18n";

let type=ref("profile")
const eleNavigator=ref<InstanceType<typeof NavigatorContainer>>(null)
let objComponent={
  profile:markRaw(Profile),
  accountSetting:markRaw(AccountSetting)
}
const {t}=useI18n()
let objCrumb={
  profile:t("util.profile"),
  accountSetting: t("controller.app.account.account.accountSetting")
}
let pathList=computed(()=>{
  if(eleNavigator.value) {
    return eleNavigator.value.navigator.getPath().slice(0,eleNavigator.value.navigator.getIndex().value+1);
  } else {
    return []
  }
});
onMounted(()=>{
  eleNavigator.value.navigator.replaceRoot(type.value,null,objCrumb[type.value]);
})
const onSubMenuClick=(key:string)=>{
  type.value=key;
  eleNavigator.value.navigator.replaceRoot(key,null,objCrumb[key]);
}

</script>

<style scoped>

</style>