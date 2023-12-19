<template>
  <div ref="root">
    <a-dropdown-button type="primary" size="small">
	    {{$t("util.add")}}
      <template #icon>
        <icon-down></icon-down>
      </template>
      <template #content>
        <a-doption @click="onAdd">{{$t("util.add")}}</a-doption>
        <a-doption @click="onCopyFrom">{{$t("controller.app.setting.issue.filedList.copyFrom")}}</a-doption>
      </template>
    </a-dropdown-button>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="false">
      <template #operation="{record}">
        <a-space wrap>
          <a-dropdown-button size="small">
	          {{$t("util.edit")}}
            <template #icon>
              <icon-down></icon-down>
            </template>
            <template #content>
              <a-doption @click="onEditProfile(record)">{{$t("util.profile")}}</a-doption>
              <a-doption @click="onEditWorkflow(record)">{{$t("util.workflow")}}</a-doption>
            </template>
          </a-dropdown-button>
          <a-button size="small" @click="onCopy(record)">{{$t("util.copy")}}</a-button>
          <a-button status="danger" size="small" @click="onDelete(record)">{{$t("util.remove")}}</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {apiIssueType} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import EditIssueType from "./editIssueType.vue";
import IssueTypeCopyFrom from "./issueTypeCopyFrom.vue";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import Workflow from "./workflow.vue";
import IssueTypeDeleteConvert from "@/business/controller/app/setting/issue/issueTypeDeleteConvert.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  issueTypeSolutionId:string
}>()
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
    title:t("util.operation"),
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
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditIssueType),{
    type:"add",
    issueTypeSolutionId:props.issueTypeSolutionId
  })
  if(ret) {
    search();
  }
}
const onEditProfile=async (item:DCSType<ICommon_Model_Issue_Type>)=>{
  let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(EditIssueType),{
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
  },`${item.name} -> ${t("util.workflow")}`)
}

const onCopyFrom=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.setting.issue.filedList.copyFrom"),markRaw(IssueTypeCopyFrom),{
    issueTypeSolutionId:props.issueTypeSolutionId
  })
  if(ret) {
    search();
  }
}

const onCopy=async (item:DCSType<ICommon_Model_Issue_Type>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.copyIssueType"))
  if(ret) {
    let name=await Dialog.input(root.value,appContext,t("tip.typeNewIssueSolutionName"))
    if(name) {
      let res=await apiIssueType.copy({
        issueTypeId:item.id,
        newIssueTypeSolutionId:props.issueTypeSolutionId,
        name
      })
      if(res?.code==0) {
        Message.success(t("tip.copySuccess"))
        search()
      } else {
        Message.error(res.msg);
      }
    }
  }
}
const onDelete=async (item:DCSType<ICommon_Model_Issue_Type>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteIssueType"))
  if(ret) {
		let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingIssueSolution.issueTypeConvert"),markRaw(IssueTypeDeleteConvert),{
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