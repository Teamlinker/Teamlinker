<template>
  <div style="padding: 0px 10px" ref="root">
    <a-space>
      <a-input-search :placeholder="$t('placeholder.typeTeamName')" v-model="keyword" style="width: 300px" @search="onSearch"></a-input-search>
      <a-button type="primary" @click="onAddTeam" v-if="checkPermission(storeOrganization.organizationPermission,Permission_Types.Organization.CREATE_TEAM)">{{$t("util.create")}}</a-button>
    </a-space>
    <a-collapse style="margin-top: 10px" :default-active-key="['manage','join']">
      <a-collapse-item :header="`${$t('controller.app.team.team.managedTeam')}(${info.manage.length})`" key="manage">
        <a-space wrap style="margin-top: 20px" size="large" v-if="info.manage.length>0">
          <CardItem style="background-color: white" v-for="item in info.manage" :name="item.name" :photo="item.photo" :description="item.description" @click="onProfile(item.id)"></CardItem>
        </a-space>
        <a-empty v-else></a-empty>
      </a-collapse-item>
      <a-collapse-item :header="`${$t('controller.app.team.team.joinedTeam')}(${info.join.length})`" key="join">
        <a-space wrap style="margin-top: 20px" size="large" v-if="info.join.length>0">
          <CardItem style="background-color: white" v-for="item in info.join" :name="item.name" :photo="item.photo" :description="item.description" @click="onProfile(item.id)"></CardItem>
        </a-space>
        <a-empty v-else></a-empty>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {apiUser} from "../../../common/request/request";
import {ICommon_Route_Res_User_TeamList} from "../../../../../../common/routes/response";
import CardItem from "../../../common/component/cardItem.vue";
import {Dialog} from "../../../common/component/dialog/dialog";
import EditTeamProfile from "../setting/user&team/editTeamProfile.vue";
import {getCurrentNavigator} from "../../../../teamOS/common/component/navigator/navigator";
import {useDesktopStore} from "../../desktop/store/desktop";
import {checkPermission, Permission_Types} from "../../../../../../common/permission/permission";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";

const keyword=ref("")
const root=ref(null);
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator()
const info=ref<DCSType<ICommon_Route_Res_User_TeamList>>({
  manage:[],
  join:[]
})
const {t}=useI18n()
const storeOrganization=useDesktopStore()
const search=async ()=>{
  let res=await apiUser.teamList({
    keyword:keyword.value
  })
  if(res?.code==0) {
    info.value=res.data
  }
}
onBeforeMount(async ()=>{
  search()
})
const onSearch=()=>{
  search()
}
const onAddTeam=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditTeamProfile),{
    type:"add"
  })
  if(ret) {
    keyword.value=""
    search()
  }
}
const onProfile=async (teamId:string)=>{
  navigator.push("profile",{
    teamId:teamId
  })
}
</script>

<style scoped>

</style>