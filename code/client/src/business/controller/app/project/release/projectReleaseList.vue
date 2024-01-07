<template>
  <div>
	  <a-alert closable style="margin-bottom: 10px;">
		  {{$t("help.release")}}
	  </a-alert>
    <a-row>
      <a-space wrap>
        <a-input-search v-model="keyword" :placeholder="$t('placeholder.typeReleaseName')" style="width: 250px" @search="onSearch" v-if="checkPermission(permission,Permission_Types.Project.READ)"></a-input-search>
        <a-select v-model="status">
          <template #label="{data}">
            <span>{{$t("util.status")}}:{{data?.label}}</span>
          </template>
          <a-option :value="-1">{{$t("util.all")}}</a-option>
          <a-option :value="ECommon_Model_Project_Release_Status.ARCHIVED">{{$t("util.archived")}}</a-option>
          <a-option :value="ECommon_Model_Project_Release_Status.RELEASE">{{$t("util.released")}}</a-option>
          <a-option :value="ECommon_Model_Project_Release_Status.UNRELEASE">{{$t("util.unReleased")}}</a-option>
        </a-select>
        <a-button type="primary" @click="onCreate" v-if="checkPermission(permission,Permission_Types.Project.CREATE)">{{$t("util.create")}}</a-button>
      </a-space>
    </a-row>
    <a-table style="margin-top: 10px" :columns="columns" :data="releaseList" :pagination="pagination" @pageChange="onPageChange">
      <template #name="{record}">
        <a-link href="javascript:void(0)" @click="onProfile(record,$event)">{{record.name}}</a-link>
      </template>
      <template #status="{record}">
        <a-tag color="blue" v-if="record.status===ECommon_Model_Project_Release_Status.UNRELEASE">{{$t("util.unReleased")}}</a-tag>
        <a-tag color="green" v-else-if="record.status===ECommon_Model_Project_Release_Status.RELEASE">{{$t("util.released")}}</a-tag>
        <a-tag v-else-if="record.status===ECommon_Model_Project_Release_Status.ARCHIVED">{{$t("util.archived")}}</a-tag>
      </template>
      <template #progress="{record}">
        <span v-if="record.notstart+record.inprogress+record.done==0">
          {{$t("controller.app.project.release.projectReleaseList.noIssues")}}
        </span>
        <a-progress v-else :percent="Number((record.done/(record.notstart+record.inprogress+record.done)).toFixed(2))" style="width: 180px" color="green"></a-progress>
      </template>
      <template #startDate="{record}">
        {{record.start_time}}
      </template>
      <template #releaseDate="{record}">
        {{record.release_time}}
      </template>
      <template #description="{record}">
        {{record.description}}
      </template>
      <template #operation="{record}">
        <a-space v-if="checkPermission(permission,Permission_Types.Project.EDIT)" wrap>
          <a-button size="small" @click="onEdit(record)">{{$t("util.edit")}}</a-button>
          <a-dropdown-button size="small">
	          {{$t("util.action")}}
            <template #icon>
              <icon-down />
            </template>
            <template #content>
              <template v-if="record.status==ECommon_Model_Project_Release_Status.ARCHIVED">
                <a-doption @click="onUnRelease(record)">{{$t("util.unRelease")}}</a-doption>
                <a-doption @click="onRelease(record)">{{$t("util.release")}}</a-doption>
              </template>
              <template v-else-if="record.status==ECommon_Model_Project_Release_Status.RELEASE">
                <a-doption @click="onUnRelease(record)">{{$t("util.unRelease")}}</a-doption>
                <a-doption @click="onArchive(record)">{{$t("util.archive")}}</a-doption>
              </template>
              <template v-if="record.status==ECommon_Model_Project_Release_Status.UNRELEASE">
                <a-doption @click="onRelease(record)">{{$t("util.release")}}</a-doption>
                <a-doption @click="onArchive(record)">{{$t("util.archive")}}</a-doption>
              </template>
            </template>
          </a-dropdown-button>
          <a-button size="small" status="danger" @click="onDelete(record)" v-if="checkPermission(permission,Permission_Types.Project.DELETE) || record?.created_by.id===myOrganizationUserId">{{$t("util.delete")}}</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, markRaw, onBeforeMount, reactive, ref} from "vue";
import {injectProjectInfo} from "../../../../common/util/symbol";
import {ECommon_Model_Project_Release_Status} from "../../../../../../../common/model/project_release";
import {apiRelease} from "../../../../common/request/request";
import {ICommon_Route_Res_Release_Item} from "../../../../../../../common/routes/response";
import {checkPermission, Permission_Types} from "../../../../../../../common/permission/permission";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {
	ETeamOS_Navigator_Action,
	getCurrentNavigator,
	getRootNavigatorRef,
	onNavigatorShow
} from "../../../../../teamOS/common/component/navigator/navigator";
import ProjectReleaseEdit from "./projectReleaseEdit.vue";
import {Message} from "@arco-design/web-vue";
import ProjectReleaseIfCan from "./projectReleaseIfCan.vue";
import ProjectReleaseProfile from "./projectReleaseProfile.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {useI18n} from "vue-i18n";
import {SessionStorage} from "@/business/common/storage/session";
import {DCSType} from "../../../../../../../common/types";

const objInject=inject(injectProjectInfo)
const projectId=objInject.id
const permission=objInject.permission
const key=objInject.key
const {t}=useI18n()
const columns=[
  {
    title:t("util.name"),
    slotName:"name"
  },
  {
    title:t("util.status"),
    slotName: "status"
  },
  {
    title:t("util.progress"),
    slotName: "progress"
  },
  {
    title:t("util.startDate"),
    slotName: "startDate"
  },
  {
    title:t("util.releaseDate"),
    slotName: "releaseDate"
  },
  {
    title:t("util.description"),
    slotName: "description"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const root=getRootNavigatorRef()
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const appContext=getCurrentInstance().appContext
const keyword=ref("")
const status=ref(-1)
const releaseList=ref<DCSType<ICommon_Route_Res_Release_Item[]>>([])
const navigator=getCurrentNavigator()
navigator.register("profile",markRaw(ProjectReleaseProfile));
const search=async (page:number)=>{
  let res=await apiRelease.list({
    projectId:projectId,
    page:page-1,
    size:10,
    name:keyword.value,
    ...(status.value!=-1 && {
      status:status.value
    })
  })
  if(res?.code==0) {
    releaseList.value=res.data.data
    pagination.total=res.data.count;
    pagination.current=page
  }
}
const onSearch=()=>{
  search(1)
}
const onPageChange=(page:number)=>{
  search(page)
}
const onCreate=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(ProjectReleaseEdit),{
    type:"add",
    projectId:projectId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEdit=async (item:DCSType<ICommon_Route_Res_Release_Item>)=>{
  let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(ProjectReleaseEdit),{
    type:"edit",
    projectId:projectId,
    item:item
  })
  if(ret) {
    search(pagination.current)
  }
}
const onDelete=async (item:DCSType<ICommon_Route_Res_Release_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteRelease"))
  if(ret) {
    let res=await apiRelease.remove({
      projectReleaseId:item.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      search(pagination.current)
    }
  }
}
const onRelease=async (item:DCSType<ICommon_Route_Res_Release_Item>)=>{
  let res=await apiRelease.checkIfCanRelease({
    projectReleaseId:item.id
  })
  if(res?.code==0) {
    if(!res.data.result) {
      let ret=await Dialog.open(root.value,appContext,t("controller.app.project.release.projectReleaseIfCan.unresolvedIssues"),markRaw(ProjectReleaseIfCan),{
        releaseId:item.id,
        items:res.data.unDoneIssueList,
        projectKey:key.value,
        projectId:projectId
      })
      if(ret) {
        search(pagination.current)
      }
    } else {
      let res=await apiRelease.changeStatus({
        projectReleaseId:item.id,
        status:ECommon_Model_Project_Release_Status.RELEASE
      })
      if(res?.code==0) {
        Message.success(t("tip.releaseSuccess"))
        search(pagination.current)
      } else {
        Message.error(res.msg)
      }
    }
  } else {
    Message.error(res.msg)
  }
}
const onUnRelease=async (item:DCSType<ICommon_Route_Res_Release_Item>)=>{
  let res=await apiRelease.changeStatus({
    projectReleaseId:item.id,
    status:ECommon_Model_Project_Release_Status.UNRELEASE
  })
  if(res?.code==0) {
    Message.success(t("tip.unReleaseSuccess"))
    search(pagination.current)
  } else {
    Message.error(res.msg)
  }
}
const onArchive=async (item:DCSType<ICommon_Route_Res_Release_Item>)=>{
  let res=await apiRelease.changeStatus({
    projectReleaseId:item.id,
    status:ECommon_Model_Project_Release_Status.ARCHIVED
  })
  if(res?.code==0) {
    Message.success(t("tip.archiveSuccess"))
    search(pagination.current)
  } else {
    Message.error(res.msg)
  }
}
const onProfile=async (item:DCSType<ICommon_Route_Res_Release_Item>,event:MouseEvent)=>{
  if(event.metaKey || event.ctrlKey) {
    eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,projectId,item.id)
  } else {
    navigator.push("profile",{
      projectReleaseId:item.id
    })
  }
}
onNavigatorShow(action => {
  if(action===ETeamOS_Navigator_Action.POP || action===ETeamOS_Navigator_Action.BACK) {
    search(pagination.current)
  }
})

onBeforeMount(()=>{
	search(pagination.current)
})
</script>

<style scoped>

</style>