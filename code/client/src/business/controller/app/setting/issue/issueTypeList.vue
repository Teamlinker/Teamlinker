<template>
  <div ref="root">
    <a-dropdown-button type="primary" size="small">
      Add
      <template #icon>
        <icon-down></icon-down>
      </template>
      <template #content>
        <a-doption @click="onAdd">Add</a-doption>
        <a-doption @click="onCopyFrom">Copy From</a-doption>
      </template>
    </a-dropdown-button>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="false">
      <template #operation="{record}">
        <a-space wrap>
          <a-dropdown-button size="small">
            Edit
            <template #icon>
              <icon-down></icon-down>
            </template>
            <template #content>
              <a-doption @click="onEditProfile(record)">Profile</a-doption>
              <a-doption @click="onEditWorkflow(record)">Workflow</a-doption>
            </template>
          </a-dropdown-button>
          <a-button size="small" @click="onCopy(record)">Copy</a-button>
          <a-button status="danger" size="small" @click="onDelete(record)">Remove</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {apiIssueType, DCSType} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import EditIssueType from "./editIssueType.vue";
import IssueTypeCopyFrom from "./issueTypeCopyFrom.vue";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import Workflow from "./workflow.vue";
import IssueTypeDeleteConvert from "@/business/controller/app/setting/issue/issueTypeDeleteConvert.vue";

const props=defineProps<{
  issueTypeSolutionId:string
}>()
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
    title:"operation",
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Model_Issue_Type[]>>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator();
navigator.register("workflow",markRaw(Workflow))
const search=async ()=>{
  let res=await apiIssueType.list({
    issueTypeSolutionId:props.issueTypeSolutionId
  })
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
  let ret=await Dialog.open(root.value,appContext,"Add",markRaw(EditIssueType),{
    type:"add",
    issueTypeSolutionId:props.issueTypeSolutionId
  })
  if(ret) {
    search();
  }
}
const onEditProfile=async (item:DCSType<ICommon_Model_Issue_Type>)=>{
  let ret=await Dialog.open(root.value,appContext,"Edit",markRaw(EditIssueType),{
    type:"edit",
    item:item
  })
  if(ret) {
    search();
  }
}
const onEditWorkflow=async (item:DCSType<ICommon_Model_Issue_Type>)=>{
  navigator.push("workflow",{
    issueTypeId:item.id
  },`${item.name} -> Workflow`)
}

const onCopyFrom=async ()=>{
  let ret=await Dialog.open(root.value,appContext,"Copy From",markRaw(IssueTypeCopyFrom),{
    issueTypeSolutionId:props.issueTypeSolutionId
  })
  if(ret) {
    search();
  }
}

const onCopy=async (item:DCSType<ICommon_Model_Issue_Type>)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to copy this issue type solution?")
  if(ret) {
    let name=await Dialog.input(root.value,appContext,"type new issue type solution name")
    if(name) {
      let res=await apiIssueType.copy({
        issueTypeId:item.id,
        newIssueTypeSolutionId:props.issueTypeSolutionId,
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
const onDelete=async (item:DCSType<ICommon_Model_Issue_Type>)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove this issue type from this issue type solution?")
  if(ret) {
		let ret=await Dialog.open(root.value,appContext,"Issue Type Convert",markRaw(IssueTypeDeleteConvert),{
			issueTypeId:item.id,
			issueTypeSolutionId:props.issueTypeSolutionId
		})
	  if(ret) {
			search()
	  }
  }
}
</script>

<style scoped>

</style>