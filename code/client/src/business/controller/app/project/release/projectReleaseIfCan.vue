<template>
  <div>
    there are still <span style="font-weight: bold;color: blue">{{items.length}}</span> unresolved issues!<br><br>
    <span style="font-weight: bold;color: red">Do you Still continue to Release?</span>
    <a-table style="margin-top: 15px" :data="items" :columns="columns">
      <template #key="{record}">
        {{projectKey+"-"+record.unique_id}}
      </template>
      <template #name="{record}">
        <a-link href="javascript:void(0)" @click="onIssueProfile(record)">{{record.name}}</a-link>
      </template>
      <template #priority="{record}">
        <FieldPriority :priority="record.priority"></FieldPriority>
      </template>
      <template #assigner="{record}">
        <UserAvatar :organization-user-id="record.assigner_id.organizationUserId" :name="record.assigner_id.nickname" :photo="record.assigner_id.photo" v-if="record.assigner_id"></UserAvatar>
      </template>
      <template #reporter="{record}">
        <UserAvatar :organization-user-id="record.reporter_id.organizationUserId" :name="record.reporter_id.nickname" :photo="record.reporter_id.photo" v-if="record.reporter_id"></UserAvatar>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {ICommon_Model_Project_Issue} from "../../../../../../../common/model/project_issue";
import {apiRelease, DCSType} from "../../../../common/request/request";
import FieldPriority from "../../../../common/component/field/fieldPriority.vue";
import UserAvatar from "../../../../common/component/userAvatar.vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {ECommon_Model_Project_Release_Status} from "../../../../../../../common/model/project_release";
import {Message} from "@arco-design/web-vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";

const props=defineProps<{
  projectReleaseId:string,
  items:DCSType<ICommon_Model_Project_Issue[]>
  projectKey:string,
  projectId:string
}>()
const columns=[
  {
    title:"Key",
    slotName: "key"
  },
  {
    title:"Name",
    slotName:"name"
  },
  {
    title:"Priority",
    slotName: "priority"
  },
  {
    title:"Assigner",
    slotName: "assigner"
  },
  {
    title:"Reporter",
    slotName: "reporter"
  }
]
const onIssueProfile=async (item:ICommon_Model_Project_Issue)=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,props.projectId,item.id)
}
onDialogOk(async ()=>{
  let res=await apiRelease.changeStatus({
    projectReleaseId:props.projectReleaseId,
    status:ECommon_Model_Project_Release_Status.RELEASE
  })
  if(res?.code==0) {
    Message.success("release success")
    return true;
  } else {
    Message.error(res.msg)
    return false;
  }
})
</script>

<style scoped>

</style>