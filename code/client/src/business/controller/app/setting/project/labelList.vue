<template>
  <div>
    <a-space>
      <a-input-search @search="onSearch" v-model="keyword" style="width: 300px" search-button :placeholder="$t('placeholder.typeLabel')"></a-input-search>
      <a-button type="primary" @click="onAdd">{{$t("util.add")}}</a-button>
    </a-space>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="pagination" @pageChange="onPageChange">
      <template #name="{record}">
        {{record.name}}
      </template>
      <template #operation="{record}">
        <a-space wrap>
          <a-button @click="onEdit(record)" size="small">{{$t("util.edit")}}</a-button>
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
import EditLabel from "./editLabel.vue";
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  projectId:string
}>()
const {t}=useI18n()
const columns=[
  {
    title:t("util.name"),
    slotName:"name"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
let data=ref<{
  id:string,
  name:string
}[]>([])
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const search=async (page:number)=>{
  let res=await apiProject.listLabel({
    projectId:props.projectId,
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
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditLabel),{
    type:"add",
    projectId:props.projectId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEdit=async (item:{
  id:string,
  name:string
})=>{
  let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(EditLabel),{
    type:"edit",
    item:item,
    projectId:props.projectId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onDelete=async (item:{
  id:string,
  name:string
})=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteLabel"))
  if(ret) {
    let res=await apiProject.removeLabel({
      labelId:item.id
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