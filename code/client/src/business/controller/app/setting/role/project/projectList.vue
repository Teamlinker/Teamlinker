<template>
  <div ref="root">
    <a-input-search style="width: 300px;margin-bottom: 10px" :placeholder="$t('placeholder.typeProjectName')" @search="search" search-button></a-input-search>
    <a-table :columns="columns" :data="data" @pageChange="onPageChange" :pagination="pagination">
      <template #operation="{record}">
        <a-button type="primary" size="small" @click="onEdit(record)">{{$t("controller.app.setting.role.project.projectList.manageRole")}}</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {ICommon_Model_Project} from "../../../../../../../../common/model/project";
import {apiProject} from "../../../../../common/request/request";
import {getCurrentNavigator} from "../../../../../../teamOS/common/component/navigator/navigator";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../../common/types";

const {t}=useI18n()
const columns=[
  {
    title:t("util.name"),
    dataIndex:"name"
  },
  {
    title:t("util.description"),
    dataIndex:"description"
  },
  {
    title:t("util.keyword"),
    dataIndex:"keyword"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Model_Project[]>>([])
const root=ref(null)
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const search=async (key:string)=>{
  keyword.value=key;
	pagination.current=1
  let ret=await apiProject.list({
    ...(key && {
      keyword:key
    }),
    page:0,
    size:10
  })
  if(ret?.code==0) {
    data.value=ret.data.data
    pagination.total=ret.data.count;
  }
}
let navigator=getCurrentNavigator();
const onEdit=async (item:ICommon_Model_Project)=>{
  navigator.push("projectGlobalRole",{
    projectId:item.id
  },"Project Role")
}
const onPageChange=async (page:number)=>{
  let ret=await apiProject.list({
    ...(keyword.value && {
      keyword:keyword.value
    }),
    page:page-1,
    size:10
  })
  if(ret?.code==0) {
    data.value=ret.data.data
    pagination.total=ret.data.count;
    pagination.current=ret.data.page
  }
}

onBeforeMount(()=>{
	search("")
})
</script>

<style scoped>

</style>