<template>
  <div>
    {{$t("controller.app.project.release.projectReleaseIfCan.thereAreStill")}} <span style="font-weight: bold;color: blue">{{items.length}}</span> {{$t("controller.app.project.release.projectReleaseIfCan.unresolvedIssues")}}!<br><br>
    <span style="font-weight: bold;color: red">{{$t("controller.app.project.release.projectReleaseIfCan.continueToRelease")}}?</span>
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
import {apiRelease} from "../../../../common/request/request";
import FieldPriority from "../../../../common/component/field/fieldPriority.vue";
import UserAvatar from "../../../../common/component/userAvatar.vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {ECommon_Model_Project_Release_Status} from "../../../../../../../common/model/project_release";
import {Message} from "@arco-design/web-vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  projectReleaseId:string,
  items:DCSType<ICommon_Model_Project_Issue[]>
  projectKey:string,
  projectId:string
}>()
const {t}=useI18n()
const columns=[
  {
    title:t("util.issueKey"),
    slotName: "key"
  },
  {
    title:t("util.name"),
    slotName:"name"
  },
  {
    title:t("util.priority"),
    slotName: "priority"
  },
  {
    title:t("util.assigner"),
    slotName: "assigner"
  },
  {
    title:t("util.reporter"),
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
    Message.success(t("tip.releaseSuccess"))
    return true;
  } else {
    Message.error(res.msg)
    return false;
  }
})
</script>

<style scoped>

</style>