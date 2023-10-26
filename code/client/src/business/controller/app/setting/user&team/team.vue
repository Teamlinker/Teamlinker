<template>
  <div ref="root">
    <a-space>
      <a-input-search @search="onSearch" v-model="keyword" style="width: 300px" search-button :placeholder="$t('placeholder.typeUsernameOrNickname')"></a-input-search>
      <a-button type="primary" @click="onCreate">{{$t("util.create")}}</a-button>
    </a-space>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="pagination" @pageChange="onPageChange">
      <template #name="{record}">
        <a-space>
          <a-avatar :image-url="record.photo" :size="30" v-if="record.photo"></a-avatar>
          {{record.name}}
        </a-space>
      </template>
      <template #creator="{record}">
        {{record.created_by?.nickname}}
      </template>
      <template #operation="{record}">
        <a-space wrap>
          <a-dropdown-button size="small">
	          {{$t("util.edit")}}
            <template #icon>
              <icon-down></icon-down>
            </template>
            <template #content>
              <a-doption @click="onEditProfile(record)">{{$t("util.profile")}}</a-doption>
              <a-doption @click="onEditMember(record)">{{$t("util.member")}}</a-doption>
            </template>
          </a-dropdown-button>
          <a-button status="danger" size="small" @click="onDelete(record)">{{$t("util.remove")}}</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiTeam} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {ICommon_Model_Team} from "../../../../../../../common/model/team";
import EditTeamProfile from "./editTeamProfile.vue";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import EditTeamMember from "./editTeamMember.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const {t}=useI18n()
const columns=[
  {
    title:t("util.name"),
    slotName:"name"
  },
  {
    title:t("util.description"),
    dataIndex:"description"
  },
  {
    title:t("util.creator"),
    slotName:"creator"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Model_Team[]>>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const navigator=getCurrentNavigator();
navigator.register("editTeamMember",markRaw(EditTeamMember));
const search=async (page:number)=>{
  let res=await apiTeam.list({
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
const onCreate=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditTeamProfile),{
    type:"add"
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditProfile=async (item:DCSType<ICommon_Model_Team>)=>{
  let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(EditTeamProfile),{
    type:"edit",
    item:item
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditMember=async (item:DCSType<ICommon_Model_Team>)=>{
  navigator.push("editTeamMember",{
    teamId:item.id
  },`${item.name} -> ${t("util.members")}`);
}
const onDelete=async (item:DCSType<ICommon_Model_Team>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteTeam"))
  if(ret) {
    let res=await apiTeam.remove({
      teamId:item.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      search(pagination.current)
    }
  }
}

onBeforeMount(()=>{
	search(pagination.current)
})
</script>

<style scoped>

</style>