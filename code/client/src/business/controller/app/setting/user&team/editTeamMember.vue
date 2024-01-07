<template>
  <div ref="root">
    <a-space>
      <a-input-search @search="onSearch" v-model="keyword" style="width: 300px" search-button :placeholder="$t('placeholder.typeUsernameOrNickname')"></a-input-search>
      <a-button type="primary" @click="onAdd">{{$t("util.add")}}</a-button>
    </a-space>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="pagination" @pageChange="onPageChange">
      <template #nickname="{record}">
        {{record.organizationUser.nickname}}
      </template>
      <template #role="{record}">
        <a-tag>{{record.role.name}}</a-tag>
      </template>
      <template #operation="{record}">
        <a-space wrap>
          <a-button @click="onEditRole(record)" size="small">{{$t("util.role")}}</a-button>
          <a-button status="danger" size="small" @click="onDelete(record)">{{$t("util.remove")}}</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiTeam} from "../../../../common/request/request";
import {ICommon_Route_Res_Organization_User_Item} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import EditTeamMemberRole from "./editTeamMemberRole.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  teamId:string
}>()
const {t}=useI18n()
const columns=[
  {
    title:t("util.nickname"),
    slotName:"nickname"
  },
  {
    title:t("util.role"),
    slotName:"role"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const search=async (page:number)=>{
  let res=await apiTeam.members({
    teamId:props.teamId,
    size:pagination.pageSize,
    page:page-1,
    keyword:keyword.value
  })
  if(res?.code==0) {
    data.value=res.data.data
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
const onAdd=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditTeamMemberRole),{
    type:"add",
    teamId:props.teamId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditRole=async (item:DCSType<ICommon_Route_Res_Organization_User_Item>)=>{
  let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(EditTeamMemberRole),{
    type:"edit",
    item:item,
    teamId:props.teamId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onDelete=async (item:DCSType<ICommon_Route_Res_Organization_User_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.removeUser"))
  if(ret) {
    let res=await apiTeam.removeMember({
      organizationUserId:item.organizationUser.id,
      teamId:props.teamId
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      search(pagination.current)
    } else {
      Message.error(res.msg)
    }
  }
}

onBeforeMount(()=>{
	search(pagination.current)
})
</script>

<style scoped>

</style>