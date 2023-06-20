<template>
  <div>
    <a-row style="justify-content: space-between;">
      <a-space size="large">
        <span style="font-size: 20px;font-weight: bold" v-drag.shortcut="()=>({
          shortcutType:ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE,
					shortcutRefId:projectReleaseId,
					shortcutName:info?.name
        })">
          {{info?.name}}
        </span>
        <a-tag color="blue" v-if="info?.status===ECommon_Model_Project_Release_Status.UNRELEASE">UNRELEASED</a-tag>
        <a-tag color="green" v-else-if="info?.status===ECommon_Model_Project_Release_Status.RELEASE">RELEASED</a-tag>
        <a-tag v-else-if="info?.status===ECommon_Model_Project_Release_Status.ARCHIVED">ARCHIVED</a-tag>
      </a-space>
      <a-space>
        <a-button size="small" @click="onEdit">Edit</a-button>
        <a-dropdown-button size="small">
          Action
          <template #icon>
            <icon-down />
          </template>
          <template #content>
            <template v-if="info?.status==ECommon_Model_Project_Release_Status.ARCHIVED">
              <a-doption @click="onUnRelease">UnRelease</a-doption>
              <a-doption @click="onRelease">Release</a-doption>
            </template>
            <template v-else-if="info?.status==ECommon_Model_Project_Release_Status.RELEASE">
              <a-doption @click="onUnRelease">UnRelease</a-doption>
              <a-doption @click="onArchive">Archive</a-doption>
            </template>
            <template v-if="info?.status==ECommon_Model_Project_Release_Status.UNRELEASE">
              <a-doption @click="onRelease">Release</a-doption>
              <a-doption @click="onArchive">Archive</a-doption>
            </template>
          </template>
        </a-dropdown-button>
        <a-button size="small" status="danger" @click="onDelete">Delete</a-button>
      </a-space>
    </a-row>
    <a-row style="margin-top: 20px">
      <a-space>
        <icon-calendar></icon-calendar>
        {{info?.start_time}}
        &nbsp;-&nbsp;
        <icon-calendar></icon-calendar>
        {{info?.release_time}}
      </a-space>
    </a-row>
    <a-row style="margin-top: 20px">
      {{info?.description}}
    </a-row>
    <a-row style="justify-content: space-between;margin-top: 30px">
      <span style="font-weight: bold">Issues</span>
      <a-button type="primary" size="small" @click="onAddIssue">Add Issue</a-button>
    </a-row>
    <a-table style="margin-top: 10px" :data="info?.issueList" :columns="columns">
      <template #key="{record}">
        {{key+"-"+record.unique_id}}
      </template>
      <template #name="{record}">
        <a-link href="javascript:void(0)" @click="onIssueProfile(record,$event)">{{record.name}}</a-link>
      </template>
      <template #issueType="{record}">
        {{record.issueType.name}}
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
      <template #status="{record}">
        <a-tag color="gray" v-if="record.workflowNode.status===ECommon_Model_Workflow_Node_Status.NOTSTART">Not Start</a-tag>
        <a-tag color="blue" v-else-if="record.workflowNode.status===ECommon_Model_Workflow_Node_Status.INPROGRESS">InProgress</a-tag>
        <a-tag color="green" v-else-if="record.workflowNode.status===ECommon_Model_Workflow_Node_Status.DONE">Done</a-tag>
      </template>
      <template #operation="{record}">
        <a-button type="text" @click="onRemoveIssue(record)">
          <template #icon>
            <icon-close style="color: red"></icon-close>
          </template>
        </a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, markRaw, onBeforeMount, ref} from "vue";
import {injectProjectInfo} from "../../../../common/util/symbol";
import {
	ICommon_Route_Res_Release_Info,
	ICommon_Route_Res_Release_Info_Issue_Item
} from "../../../../../../../common/routes/response";
import {apiRelease, DCSType} from "../../../../common/request/request";
import {ECommon_Model_Project_Release_Status} from "../../../../../../../common/model/project_release";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getCurrentNavigator, getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import {Message} from "@arco-design/web-vue";
import ProjectReleaseEdit from "./projectReleaseEdit.vue";
import ProjectReleaseIfCan from "./projectReleaseIfCan.vue";
import FieldPriority from "../../../../common/component/field/fieldPriority.vue";
import UserAvatar from "../../../../common/component/userAvatar.vue";
import ProjectIssueBind from "../issue/projectIssueBind.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {vDrag} from "../../../../../teamOS/common/directive/drag";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../../common/model/finder_item";

const props=defineProps<{
  projectReleaseId:string
}>()
const columns=[
  {
    title:"Key",
    slotName:"key"
  },
  {
    title:"Name",
    slotName: "name"
  },
  {
    title:"Issue Type",
    slotName: "issueType"
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
  },
  {
    title:"Status",
    slotName: "status"
  },
  {
    title:"Operation",
    slotName: "operation"
  },
]
const key=inject(injectProjectInfo).key
const projectId=inject(injectProjectInfo).id
const info=ref<DCSType<ICommon_Route_Res_Release_Info>>()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator()
const getInfo=async ()=>{
  let res=await apiRelease.info({
    projectReleaseId:props.projectReleaseId
  })
  if(res?.code==0) {
    info.value=res.data
    navigator.setCurrentPath(res.data.name)
  }
}
const onRemoveIssue=async (item:DCSType<ICommon_Route_Res_Release_Info_Issue_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove this issue?")
  if(ret) {
    let res=await apiRelease.removeIssue({
      projectReleaseId:props.projectReleaseId,
      projectIssueId:item.id
    })
    if(res?.code==0) {
      Message.success("remove success")
      getInfo()
    }
  }
}
const onEdit=async ()=>{
  let ret=await Dialog.open(root.value,appContext,"Edit",markRaw(ProjectReleaseEdit),{
    type:"edit",
    item:info.value
  })
  if(ret) {
    getInfo()
  }
}
const onDelete=async ()=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to delete this release?")
  if(ret) {
    let res=await apiRelease.remove({
      projectReleaseId:info.value.id
    })
    if(res?.code==0) {
      Message.success("delete success")
      navigator.pop()
    }
  }
}
const onRelease=async ()=>{
  let res=await apiRelease.checkIfCanRelease({
    projectReleaseId:info.value.id
  })
  if(res?.code==0) {
    if(!res.data.result) {
      let ret=await Dialog.open(root.value,appContext,"UnResolved Issues",markRaw(ProjectReleaseIfCan),{
        projectReleaseId:info.value.id,
        items:res.data.unDoneIssueList,
        projectKey:key.value,
        projectId:projectId
      })
      if(ret) {
        getInfo()
      }
    } else {
      let res=await apiRelease.changeStatus({
        projectReleaseId:info.value.id,
        status:ECommon_Model_Project_Release_Status.RELEASE
      })
      if(res?.code==0) {
        Message.success("release success")
        getInfo()
      } else {
        Message.error(res.msg)
      }
    }
  } else {
    Message.error(res.msg)
  }
}
const onUnRelease=async ()=>{
  let res=await apiRelease.changeStatus({
    projectReleaseId:info.value.id,
    status:ECommon_Model_Project_Release_Status.UNRELEASE
  })
  if(res?.code==0) {
    Message.success("unrelease success")
    getInfo()
  } else {
    Message.error(res.msg)
  }
}
const onArchive=async ()=>{
  let res=await apiRelease.changeStatus({
    projectReleaseId:info.value.id,
    status:ECommon_Model_Project_Release_Status.ARCHIVED
  })
  if(res?.code==0) {
    Message.success("archive success")
    getInfo()
  } else {
    Message.error(res.msg)
  }
}
const onAddIssue=async ()=>{
  let ret=await Dialog.open(root.value,appContext,"Add Issue",markRaw(ProjectIssueBind),{
    projectId:projectId,
    projectKey:key.value
  })
  if(ret) {
    let res=await apiRelease.addIssue({
      projectReleaseId:props.projectReleaseId,
      projectIssueId:ret as string
    })
    if(res?.code==0) {
      Message.success("add success")
      getInfo()
    }
  }
}
const onIssueProfile=async (item:ICommon_Route_Res_Release_Info_Issue_Item,event:MouseEvent)=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,item.id);
}
onBeforeMount(()=>{
  getInfo()
})
</script>

<style scoped>

</style>