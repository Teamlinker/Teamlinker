<template>
  <div style="padding: 10px 20px">
    <a-row>
      <a-input-search :placeholder="$t('placeholder.typeName')" style="width: 400px" v-model="keyword" @search="onSearch"></a-input-search>
    </a-row>
    <a-space wrap style="margin-top: 20px" size="large">
      <CardItem v-for="item in userList" :name="item.organizationUser.nickname" :photo="item.user.photo" :description="item.organizationUser.job" @click="showProfile(item.organizationUser)"></CardItem>
    </a-space>
    <a-pagination :page-size="20" :total="pagination.total" style="margin-top: 10px" @change="onPageChange"></a-pagination>
  </div>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {ICommon_Route_Res_Organization_User_Item} from "../../../../../../common/routes/response";
import CardItem from "../../../common/component/cardItem.vue";
import {apiOrganization} from "../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {getCurrentNavigator} from "../../../../teamOS/common/component/navigator/navigator";
import {ICommon_Model_Organization_User} from "../../../../../../common/model/organization_user";
import {SessionStorage} from "../../../common/storage/session";
import {DCSType} from "../../../../../../common/types";

let userList=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const keyword=ref("")
const pagination=reactive({
  total:0,
  current:1,
  pageSize:20
})
onBeforeMount(async ()=>{
  search(1)
})
const search=async (page:number)=>{
  let res=await apiOrganization.listUser({
    organizationId:SessionStorage.get("organizationId"),
    size:pagination.pageSize,
    page:page-1,
    keyword:keyword.value
  })
  if(res?.code==0) {
    userList.value=res.data.data
    pagination.total=res.data.count;
    pagination.current=page
  } else {
    Message.error(res.msg)
  }
}
const onPageChange=(page:number)=>{
  search(page)
}
const onSearch=()=>{
  search(1)
}
const navigator=getCurrentNavigator();
const showProfile=(organizationUser:ICommon_Model_Organization_User)=>{
  navigator.push("profile",{
    organizationUserId:organizationUser.id
  },organizationUser.nickname)
}
</script>

<style scoped>

</style>