<template>
  <div ref="root">
    <a-space>
      <a-input-search @search="onSearch" v-model="keyword" style="width: 300px" search-button :placeholder="$t('placeholder.typeProjectName')"></a-input-search>
      <a-button type="primary" @click="onCreate">
	      {{$t("util.create")}}
      </a-button>
    </a-space>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="pagination" @pageChange="onPageChange">
      <template #name="{record}">
        <a-space>
          <a-avatar :image-url="record.photo" :size="30" v-if="record.photo"></a-avatar>
          {{record.name}}
        </a-space>
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
              <a-doption @click="onEditAccess(record)">{{$t("util.access")}}</a-doption>
              <a-doption @click="onEditLabel(record)">{{$t("util.label")}}</a-doption>
              <a-doption @click="onEditModule(record)">{{$t("util.module")}}</a-doption>
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
import {apiProject} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import {ICommon_Model_Project} from "../../../../../../../common/model/project";
import EditProjectProfile from "./editProjectProfile.vue";
import EditProjectAccess from "./editProjectAccess.vue";
import LabelList from "./labelList.vue";
import ModuleList from "./moduleList.vue";
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
    title:"keyword",
    dataIndex:"keyword"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Model_Project[]>>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const navigator=getCurrentNavigator();
navigator.register("editProjectAccess",markRaw(EditProjectAccess));
navigator.register("labelList",markRaw(LabelList));
navigator.register("moduleList",markRaw(ModuleList));
const search=async (page:number)=>{
  let res=await apiProject.list({
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
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditProjectProfile),{
    type:"add"
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditProfile=async (item:DCSType<ICommon_Model_Project>)=>{
  let ret=await Dialog.open(root.value,appContext,t("util.editProfile"),markRaw(EditProjectProfile),{
    type:"edit",
    item:item
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditAccess=async (item:DCSType<ICommon_Model_Project>)=>{
  navigator.push("editProjectAccess",{
    projectId:item.id
  },`${item.name} -> ${t("util.access")}`);
}
const onEditLabel=async (item:DCSType<ICommon_Model_Project>)=>{
  navigator.push("labelList",{
    projectId:item.id
  },`${item.name} -> ${t("util.label")}`)
}
const onEditModule=async (item:DCSType<ICommon_Model_Project>)=>{
  navigator.push("moduleList",{
    projectId:item.id
  },`${item.name} -> ${t("util.module")}`)
}
const onDelete=async (item:DCSType<ICommon_Model_Project>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteProject"))
  if(ret) {
    let res=await apiProject.remove({
      projectId:item.id
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