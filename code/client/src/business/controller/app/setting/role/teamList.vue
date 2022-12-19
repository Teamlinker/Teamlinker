<template>
  <div ref="root">
    <a-input-search style="width: 300px;margin-bottom: 10px" placeholder="please type team name" @search="search" search-button></a-input-search>
    <a-table :columns="columns" :data="data" @pageChange="onPageChange" :pagination="pagination">
      <template #operation="{record}">
        <a-button type="primary" size="small" @click="onEdit(record)">manage role</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {apiTeam, DCSType} from "../../../../common/request/request";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import {ICommon_Model_Team} from "../../../../../../../common/model/team";

const columns=[
  {
    title:"name",
    dataIndex:"name"
  },
  {
    title:"description",
    dataIndex:"description"
  },
  {
    title:"keyword",
    dataIndex:"keyword"
  },
  {
    title:"operation",
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Model_Team[]>>([])
const root=ref(null)
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const search=async (key:string)=>{
  keyword.value=key;
  let ret=await apiTeam.list({
    ...(key && {
      keyword:key
    }),
    page:0,
    size:10
  })
  if(ret?.code==0) {
    data.value=ret.data.data
    pagination.total=ret.data.count;
    pagination.current=ret.data.page+1
  }
}
let navigator=getCurrentNavigator();
const onEdit=async (item:ICommon_Model_Team)=>{
  navigator.push("teamGlobalRole",{
    teamId:item.id
  },"Team Role")
}
const onPageChange=async (page:number)=>{
  let ret=await apiTeam.list({
    ...(keyword.value && {
      keyword:keyword.value
    }),
    page:page-1,
    size:10
  })
  if(ret?.code==0) {
    data.value=ret.data.data
    pagination.total=ret.data.count;
    pagination.current=ret.data.page+1
  }
}
</script>

<style scoped>

</style>