<template>
  <div ref="root">
    <a-button type="primary" @click="onAdd">Add</a-button>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="false">
      <template #issue="{record}">
        <a-space wrap>
          <a-tag v-for="item in record.issueTypeList">{{item.name}}</a-tag>
        </a-space>
      </template>
      <template #reserved="{record}">
        <icon-check v-if="record.reserved" style="color: green"></icon-check>
        <icon-close v-else style="color: red"></icon-close>
      </template>
      <template #operation="{record}">
        <a-space wrap v-if="!record.reserved">
          <a-dropdown-button size="small">
            Edit
            <template #icon>
              <icon-down></icon-down>
            </template>
            <template #content>
              <a-doption @click="onEditProfile(record)">Profile</a-doption>
              <a-doption @click="onEditIssue(record)">Issue</a-doption>
              <a-doption @click="onEditBindProject(record)">Bind Project</a-doption>
            </template>
          </a-dropdown-button>
          <a-button size="small" @click="onCopy(record)">Copy</a-button>
          <a-button status="danger" size="small" @click="onDelete(record)">Remove</a-button>
        </a-space>
        <a-space wrap v-else>
          <a-button size="small" @click="onEditBindProject(record)">Bind Project</a-button>
          <a-button size="small" @click="onCopy(record)">Copy</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {apiIssueType, DCSType} from "../../../../common/request/request";
import {ICommon_Route_Res_IssueTypeSolution_List_Item} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import EditIssueSolution from "./editIssueTypeSolution.vue";
import BindProjectList from "./bindProjectList.vue";
import IssueTypeList from "./issueTypeList.vue";

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
    title:"issue",
    slotName:"issue"
  },
  {
    title:"reserved",
    slotName:"reserved"
  },
  {
    title:"operation",
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item[]>>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator();
navigator.register("bindProjectList",markRaw(BindProjectList))
navigator.register("issueTypeList",markRaw(IssueTypeList))
const search=async ()=>{
  let res=await apiIssueType.solutionList()
  if(res?.code==0) {
    data.value=res.data
  } else {
    Message.error(res.msg)
  }
}
onBeforeMount(async ()=>{
  search()
})
const onAdd=async ()=>{
  let ret=await Dialog.open(root.value,appContext,"Add",markRaw(EditIssueSolution),{
    type:"add"
  })
  if(ret) {
    search();
  }
}
const onEditProfile=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  let ret=await Dialog.open(root.value,appContext,"Edit",markRaw(EditIssueSolution),{
    type:"edit",
    item:item
  })
  if(ret) {
    search();
  }
}
const onEditIssue=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  navigator.push("issueTypeList",{
    issueTypeSolutionId:item.id
  },`${item.name} -> IssueType List`)
}
const onEditBindProject=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  navigator.push("bindProjectList",{
    issueTypeSolutionId:item.id,
    reserved:item.reserved
  },`${item.name} -> Bind Project`)
}
const onCopy=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to copy this issue type solution?")
  if(ret) {
    let name=await Dialog.input(root.value,appContext,"type new issue type solution name")
    if(name) {
      let res=await apiIssueType.copySolution({
        issueTypeSolutionId:item.id,
        name
      })
      if(res?.code==0) {
        Message.success("copy success")
        search()
      } else {
        Message.error(res.msg);
      }
    }
  }
}
const onDelete=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove this solution from this organization?")
  if(ret) {
    let res=await apiIssueType.solutionDelete({
      issueTypeSolutionId:item.id
    })
    if(res?.code==0) {
      Message.success("remove success")
      search()
    }
  }
}
</script>

<style scoped>

</style>