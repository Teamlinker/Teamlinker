<template>
  <div>
	  <a-alert closable style="margin-bottom: 10px">
		  {{$t("help.issue")}}
	  </a-alert>
    <a-row>
      <a-space wrap>
        {{$t("util.filter")}}:
        <a-input-search v-model="keyword" :placeholder="$t('placeholder.typeNameOrUniqueId')" style="width: 250px" @search="onSearchIssue" v-if="checkPermission(permission,Permission_Types.Project.READ)"></a-input-search>
        <a-select v-model="issueType">
          <template #label="{data}">
            <span>{{$t("util.issueType")}}:{{data?.label}}</span>
          </template>
          <a-option value="all" :label="$t('util.all')"></a-option>
          <a-option v-for="item in issueTypeList" :label="item.name" :value="item.id"></a-option>
        </a-select>
        <a-select style="width: 160px" v-model="priority">
          <template #label="{data}">
            <span>{{$t("util.priority")}}:{{data?.label}}</span>
          </template>
          <a-option :value="-1" :label="$t('util.all')"></a-option>
          <a-option :value="ECommon_Model_Project_Issue_Priority.LOW">{{$t('util.low')}}</a-option>
          <a-option :value="ECommon_Model_Project_Issue_Priority.MEDIUM">{{$t('util.medium')}}</a-option>
          <a-option :value="ECommon_Model_Project_Issue_Priority.HIGH">{{$t('util.high')}}</a-option>
          <a-option :value="ECommon_Model_Project_Issue_Priority.URGENT">{{$t('util.urgent')}}</a-option>
        </a-select>
        <a-select style="width: 170px" v-model="status">
          <template #label="{data}">
            <span>{{$t("util.status")}}:{{data?.label}}</span>
          </template>
          <a-option :value="-1" :label="$t('util.all')"></a-option>
          <a-option :value="ECommon_Model_Workflow_Node_Status.NOTSTART">{{$t('util.notStart')}}</a-option>
          <a-option :value="ECommon_Model_Workflow_Node_Status.INPROGRESS">{{$t('util.inProgress')}}</a-option>
          <a-option :value="ECommon_Model_Workflow_Node_Status.DONE">{{$t('util.done')}}</a-option>
        </a-select>
        <a-cascader v-model="module" :field-names="fields" :options="moduleList" :placeholder="$t('placeholder.pleaseSelect')" :format-label="format" check-strictly></a-cascader>
	      {{$t("util.label")}}:
        <a-select v-model="label" @search="onSearchLabel" allow-search :placeholder="$t('placeholder.typeLabel')">
          <a-option :label="$t('util.all')" value="all"></a-option>
          <a-option v-for="item in labelList" :label="item.name" :value="item.id"></a-option>
        </a-select>
	      {{$t("util.assigner")}}:
        <a-select v-model="assignerId" @search="onSearchAssigner" allow-search :placeholder="$t('placeholder.typeAssigner')">
          <a-option :label="$t('util.all')" value="all"></a-option>
          <a-option v-for="item in assignerList" :label="item.organizationUser.nickname" :value="item.organizationUser.id"></a-option>
        </a-select>
	      {{$t("util.reporter")}}:
        <a-select v-model="reporterId" @search="onSearchReporter" allow-search :placeholder="$t('placeholder.typeReporter')">
          <a-option :label="$t('util.all')" value="all"></a-option>
          <a-option v-for="item in reporterList" :label="item.organizationUser.nickname" :value="item.organizationUser.id"></a-option>
        </a-select>
        <a-button type="primary" @click="onCreate" v-if="checkPermission(permission,Permission_Types.Project.CREATE)">{{$t("util.create")}}</a-button>
      </a-space>
    </a-row>
    <a-divider></a-divider>
	  <span style="font-size: small;color: gray">{{$t("controller.app.project.issue.projectIssueList.remark")}}</span>
    <a-table style="margin-top: 10px" :columns="columns" :data="issueList" :pagination="pagination" @pageChange="onPageChange">
      <template #type="{record}">
        {{record.issueType.name}}
      </template>
      <template #key="{record}">
        {{key+"-"+record.unique_id}}
      </template>
      <template #name="{record}">
        <a-link href="javascript:void(0)" @click="onProfile(record.id,$event)">
          {{record.name}}
        </a-link>
      </template>
      <template #assigner="{record}">
        <UserAvatar :organization-user-id="record.assigner_id.organizationUserId" :name="record.assigner_id.nickname" :photo="record.assigner_id.photo" v-if="record.assigner_id"></UserAvatar>
      </template>
      <template #reporter="{record}">
        <UserAvatar :organization-user-id="record.reporter_id.organizationUserId" :name="record.reporter_id.nickname" :photo="record.reporter_id.photo" v-if="record.reporter_id"></UserAvatar>
      </template>
      <template #priority="{record}">
        <FieldPriority :priority="record.priority"></FieldPriority>
      </template>
      <template #status="{record}">
        <a-tag color="gray" v-if="record.status===ECommon_Model_Workflow_Node_Status.NOTSTART">{{$t("util.notStart")}}</a-tag>
        <a-tag color="blue" v-else-if="record.status===ECommon_Model_Workflow_Node_Status.INPROGRESS">{{$t("util.inProgress")}}</a-tag>
        <a-tag color="green" v-else-if="record.status===ECommon_Model_Workflow_Node_Status.DONE">{{$t("util.done")}}</a-tag>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">

import {ECommon_Model_Project_Issue_Priority} from "../../../../../../../common/model/project_issue";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import {getCurrentInstance, inject, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiIssue, apiOrganization, apiProject} from "../../../../common/request/request";
import {
	ICommon_Route_Res_Organization_User_Item,
	ICommon_Route_Res_Project_CreateModule_Data,
	ICommon_Route_Res_Project_Issue_filter_Item
} from "../../../../../../../common/routes/response";
import {injectProjectInfo} from "../../../../common/util/symbol";
import {checkPermission, Permission_Types} from "../../../../../../../common/permission/permission";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {
	ETeamOS_Navigator_Action,
	getCurrentNavigator,
	getRootNavigatorRef,
	onNavigatorShow
} from "../../../../../teamOS/common/component/navigator/navigator";
import ProjectIssueCreate from "./projectIssueCreate.vue";
import UserAvatar from "../../../../common/component/userAvatar.vue";
import FieldPriority from "../../../../common/component/field/fieldPriority.vue";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import ProjectIssueProfile from "./projectIssueProfile.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {SessionStorage} from "../../../../common/storage/session";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const objInject=inject(injectProjectInfo)
const projectId=objInject.id
const permission=objInject.permission
const key=objInject.key
const {t}=useI18n()
const fields={
  label:"name",
  value:"id",
  children:"data"
}
const columns=[
  {
    title:t("util.type"),
    slotName:"type"
  },
  {
    title:t("util.issueKey"),
    slotName: "key"
  },
  {
    title:t("util.name"),
    slotName: "name"
  },
  {
    title:t("util.assigner"),
    slotName: "assigner"
  },
  {
    title:t("util.reporter"),
    slotName: "reporter"
  },
  {
    title:t("util.priority"),
    slotName: "priority"
  },
  {
    title:t("util.status"),
    slotName: "status"
  }
]
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("")
const issueType=ref("all")
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type[]>>([])
const priority=ref(-1)
const status=ref(-1)
const module=ref("all")
const moduleList=ref<ICommon_Route_Res_Project_CreateModule_Data[]>([])
const label=ref("all")
const labelList=ref<{
  id:string,
  name:string
}[]>([])
const assignerId=ref("all")
const assignerList=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const reporterId=ref("all")
const reporterList=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const issueList=ref<DCSType<ICommon_Route_Res_Project_Issue_filter_Item[]>>([])
const root=getRootNavigatorRef();
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator();
navigator.register("profile",markRaw(ProjectIssueProfile));
const getModuleList=async ()=>{
  let res=await apiProject.listModule({
    projectId
  })
  if(res?.code==0) {
    moduleList.value=[{
      name:t("util.all"),
      id:"all",
      data:[]
    },...res.data]
  }
}
const onSearchLabel=async (value:string)=>{
  let res=await apiProject.listLabel({
    projectId,
    page:0,
    size:20,
    keyword:value
  })
  if(res?.code==0) {
    labelList.value=res.data.data
  }
}
const onSearchAssigner=async (value:string)=> {
  let res = await apiOrganization.listUser({
    organizationId: SessionStorage.get("organizationId"),
    page: 0,
    size: 20,
    keyword: value
  })
  if(res?.code==0) {
    assignerList.value=res.data.data
  }
}
const onSearchReporter=async (value:string)=> {
  let res = await apiOrganization.listUser({
    organizationId: SessionStorage.get("organizationId"),
    page: 0,
    size: 20,
    keyword: value
  })
  if(res?.code==0) {
    reporterList.value=res.data.data
  }
}
onBeforeMount(async ()=>{
  getModuleList()
  getIssueTypeList()
})
const format = (options) => {
  const labels = options.map(option => option.name)
  return `${t("util.module")}:`+labels.join('/')
}
const search=async (page:number)=>{
  let res = await apiIssue.filter({
    projectId:projectId,
    page:page-1,
    size:10,
    ...(issueType.value!="all" && {
      issueTypeId:issueType.value
    }),
    ...(priority.value!=-1 && {
      priority:priority.value
    }),
    ...(keyword.value && {
      name:keyword.value
    }),
    ...(assignerId.value!="all" && {
      assignerId:assignerId.value
    }),
    ...(reporterId.value!="all" && {
      reporterId:reporterId.value
    }),
    ...(status.value!=-1 && {
      status:status.value
    }),
    ...(module.value!="all" && {
      moduleId:module.value
    }),
    ...(label.value!="all" && {
      labelId:label.value
    })
  })
  if(res?.code==0) {
    issueList.value=res.data.data
    pagination.total=res.data.count;
    pagination.current=page
  }
}
const onSearchIssue=async ()=>{
  search(1)
}
const onPageChange=(page:number)=>{
  search(page)
}
const onCreate=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.create"),markRaw(ProjectIssueCreate),{
    projectId:projectId
  });
  if(ret) {
    search(pagination.current)
  }
}
const getIssueTypeList=async ()=>{
  let ret=await apiProject.issueTypeList({
    projectId
  })
  if(ret?.code==0) {
    issueTypeList.value=ret.data
  }
}
const onProfile=async (id:string,event:MouseEvent)=>{
  if(event.metaKey || event.ctrlKey) {
    eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,id);
  } else {
    navigator.push("profile",{
      projectIssueId:id
    })
  }
}
onNavigatorShow(action => {
  if(action===ETeamOS_Navigator_Action.POP) {
    search(pagination.current)
  }
})

onBeforeMount(()=>{
	search(pagination.current)
})
</script>

<style scoped>

</style>