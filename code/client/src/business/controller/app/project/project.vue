<template>
  <div style="height: 100%;overflow-y: auto;padding: 0px 10px" ref="root">
    {{$t("controller.app.project.project.yourWork")}}
    <a-collapse :default-active-key="['recent','all']" style="margin-top: 10px">
      <a-collapse-item :header="$t('controller.app.project.project.recentProjectList')" key="recent">
        <a-space wrap style="margin-top: 20px" size="large" v-if="recentList.length>0">
          <ProjectItem v-for="item in recentList" style="background-color: white" :done-title="$t('controller.app.project.project.myDoneIssue')" :done-count="item.done" :open-title="$t('controller.app.project.project.myOpenIssue')" :open-count="item.notstart+item.inprogress" :name="item.name" :project-id="item.id" :photo="item.photo" @click="onClickProjectItem(item.id,item.name)" v-drag.shortcut="()=>({
						shortcutType:ECommon_Model_Finder_Shortcut_Type.PROJECT,
						shortcutRefId:item.id,
						shortcutName:item.name
          })"></ProjectItem>
        </a-space>
        <a-empty v-else></a-empty>
      </a-collapse-item>
      <a-collapse-item :header="$t('controller.app.project.project.allProjectList')" key="all">
        <a-row>
          <a-space>
            {{$t("util.type")}}
            <a-select v-model="type" style="width: 100px">
              <a-option :label="$t('util.all')" value="all"></a-option>
              <a-option :label="$t('util.created')" value="created"></a-option>
              <a-option :label="$t('util.joined')" value="joined"></a-option>
            </a-select>
            <a-input-search style="width: 250px" v-model="keyword" :placeholder="$t('placeholder.typeProjectName')" @search="onSearch"></a-input-search>
            <a-button type="primary" @click="onAddProject" v-if="checkPermission(storeOrganization.organizationPermission,Permission_Types.Organization.CREATE_PROJECT)">{{$t("util.create")}}</a-button>
          </a-space>
        </a-row>
        <a-space wrap style="margin-top: 20px" size="large" v-if="list.length>0">
          <ProjectItem v-for="item in list" style="background-color: white" :done-title="$t('controller.app.project.project.doneIssue')" :done-count="item.done" :open-title="$t('controller.app.project.project.openIssue')" :open-count="item.notstart+item.inprogress" :name="item.name" :project-id="item.id" :photo="item.photo" @click="onClickProjectItem(item.id,item.name)" v-drag.shortcut="()=>({
						shortcutType:ECommon_Model_Finder_Shortcut_Type.PROJECT,
						shortcutRefId:item.id,
						shortcutName:item.name
          })"></ProjectItem>
        </a-space>
        <a-empty v-else></a-empty>
        <a-pagination :page-size="20" :total="pagination.total" style="margin-top: 10px" @change="onPageChange"></a-pagination>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {ICommon_Route_Res_recentProjectList_Item} from "../../../../../../common/routes/response";
import ProjectItem from "./projectItem.vue";
import {apiProject} from "../../../common/request/request";
import {checkPermission, Permission_Types} from "../../../../../../common/permission/permission";
import {useDesktopStore} from "../../desktop/store/desktop";
import {Dialog} from "../../../common/component/dialog/dialog";
import EditProjectProfile from "../setting/project/editProjectProfile.vue";
import {
	ETeamOS_Navigator_Action,
	getCurrentNavigator,
	onNavigatorShow
} from "../../../../teamOS/common/component/navigator/navigator";
import {vDrag} from "../../../../teamOS/common/directive/drag";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";
import {useI18n} from "vue-i18n";

const recentList=ref<ICommon_Route_Res_recentProjectList_Item[]>([])
const list=ref<ICommon_Route_Res_recentProjectList_Item[]>([])
const type=ref<"all"|"created"|"joined">("all")
const keyword=ref("")
const storeOrganization=useDesktopStore()
const root=ref(null);
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator()
const {t}=useI18n()
const pagination=reactive({
  total:0,
  current:1,
  pageSize:20
})
const listAllProject=async (page:number)=>{
  let res=await apiProject.userProjectList({
    keyword:keyword.value,
    type:type.value,
    size:pagination.pageSize,
    page:page-1
  })
  if(res?.code==0) {
    list.value=res.data.data
    pagination.total=res.data.count;
    pagination.current=page
  }
}
const listRecentProject=async()=>{
  let res=await apiProject.recentProjectList()
  if(res?.code==0) {
    recentList.value=res.data
  }
}
const onPageChange=(page:number)=>{
  listAllProject(page)
}
onBeforeMount(async ()=>{
  listRecentProject()
  listAllProject(pagination.current)
})
const onSearch=async ()=>{
  listAllProject(1)
}
const onAddProject=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditProjectProfile),{
    type:"add"
  })
  if(ret) {
    keyword.value=""
    listAllProject(1)
  }
}
const onClickProjectItem=(projectId:string,name:string)=>{
  navigator.push("profile",{
    projectId:projectId
  },name)
}
onNavigatorShow(action => {
  if(action===ETeamOS_Navigator_Action.BACK) {
    listRecentProject()
    listAllProject(pagination.current)
  }
})
</script>

<style scoped>

</style>