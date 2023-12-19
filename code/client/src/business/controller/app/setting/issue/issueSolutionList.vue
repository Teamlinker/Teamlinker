<template>
  <div ref="root">
    <a-button type="primary" @click="onAdd">{{$t("util.add")}}</a-button>
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
	          {{$t("util.edit")}}
            <template #icon>
              <icon-down></icon-down>
            </template>
            <template #content>
              <a-doption @click="onEditProfile(record)">{{$t("util.profile")}}</a-doption>
              <a-doption @click="onEditIssue(record)">{{$t("util.issue")}}</a-doption>
              <a-doption @click="onEditBindProject(record)">{{$t("controller.app.setting.issue.issueSolutionList.bindProject")}}</a-doption>
            </template>
          </a-dropdown-button>
          <a-button size="small" @click="onCopy(record)">{{$t("util.copy")}}</a-button>
          <a-button status="danger" size="small" @click="onDelete(record)">{{$t("util.remove")}}</a-button>
        </a-space>
        <a-space wrap v-else>
          <a-button size="small" @click="onEditBindProject(record)">{{$t("controller.app.setting.issue.issueSolutionList.bindProject")}}</a-button>
          <a-button size="small" @click="onCopy(record)">{{$t("util.copy")}}</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {apiIssueType} from "../../../../common/request/request";
import {ICommon_Route_Res_IssueTypeSolution_List_Item} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getCurrentNavigator} from "../../../../../teamOS/common/component/navigator/navigator";
import EditIssueSolution from "./editIssueTypeSolution.vue";
import BindProjectList from "./bindProjectList.vue";
import IssueTypeList from "./issueTypeList.vue";
import IssueSolutionDeleteConvert from "@/business/controller/app/setting/issue/issueSolutionDeleteConvert.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

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
    title:t("util.issue"),
    slotName:"issue"
  },
  {
    title:t("util.reserved"),
    slotName:"reserved"
  },
  {
    title:t("util.operation"),
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
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditIssueSolution),{
    type:"add"
  })
  if(ret) {
    search();
  }
}
const onEditProfile=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(EditIssueSolution),{
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
  },`${item.name} -> ${t("util.issueTypeList")}`)
}
const onEditBindProject=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  navigator.push("bindProjectList",{
    issueTypeSolutionId:item.id,
    reserved:item.reserved
  },`${item.name} -> ${t("controller.app.setting.issue.issueSolutionList.bindProject")}`)
}
const onCopy=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.copyIssueSolution"))
  if(ret) {
    let name=await Dialog.input(root.value,appContext,t("tip.typeNewIssueSolutionName"))
    if(name) {
      let res=await apiIssueType.copySolution({
        issueTypeSolutionId:item.id,
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
const onDelete=async (item:DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteIssueSolution"))
  if(ret) {
		let res=await apiIssueType.list({
			issueTypeSolutionId:item.id
		})
	  if(res?.code==0) {
			if(res.data.length==0) {
				let res=await apiIssueType.solutionDelete({
					issueTypeSolutionId:item.id
				})
				if(res?.code==0) {
					Message.success(t("tip.deleteSuccess"))
					search()
				}
			} else {
				let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingIssueSolution.issueTypeConvert"),markRaw(IssueSolutionDeleteConvert),{
					issueTypeSolutionId:item.id
				})
				if(ret) {
					search()
				}
			}
	  }

  }
}
</script>

<style scoped>

</style>