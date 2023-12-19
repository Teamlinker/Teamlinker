<template>
  <a-layout style="height: 100%">
    <a-layout-sider :resize-directions="['right']">
      <a-menu style="width: 100%" @menu-item-click="onSubMenuClick" v-model:selected-keys="menuKey">
	      <a-menu-item key="home">{{$t("util.home")}}</a-menu-item>
        <a-menu-item key="issue">{{$t("util.issue")}}</a-menu-item>
	      <a-menu-item key="board">{{$t("util.board")}}</a-menu-item>
        <a-menu-item key="release">{{$t("util.release")}}</a-menu-item>
	      <a-menu-item key="plan">{{$t("util.plan")}}</a-menu-item>
        <a-menu-item key="setting" v-if="checkPermission(permission,Permission_Types.Project.ADMIN)">{{$t("util.setting")}}</a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content style="flex-direction: column;display: flex;padding: 10px;">
      <div style="width: 100%;display: flex;flex: 1 1 auto;" :style="{overflowY:type=='issueProfile'?'hidden':'auto'}">
        <NavigatorContainer :routes="objComponent" ref="eleNavigator"></NavigatorContainer>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import {markRaw, onBeforeMount, onMounted, provide, ref} from "vue";
import NavigatorContainer from "../../../../teamOS/common/component/navigator/navigatorContainer.vue";
import ProjectIssueList from "./issue/projectIssueList.vue";
import ProjectReleaseList from "./release/projectReleaseList.vue";
import ProjectSetting from "./setting/projectSetting.vue";
import {apiProject} from "../../../common/request/request";
import {checkPermission, Permission_Types} from "../../../../../../common/permission/permission";
import {injectProjectInfo} from "../../../common/util/symbol";
import ProjectIssueProfile from "./issue/projectIssueProfile.vue";
import {getCurrentNavigator, getCurrentNavigatorMeta} from "../../../../teamOS/common/component/navigator/navigator";
import ProjectReleaseProfile from "./release/projectReleaseProfile.vue";
import {Message} from "@arco-design/web-vue";
import BoardList from "@/business/controller/app/project/board/boardList.vue";
import BoardProfile from "@/business/controller/app/project/board/boardProfile.vue";
import ProjectHome from "@/business/controller/app/project/home/projectHome.vue";
import PlanList from "@/business/controller/app/project/plan/planList.vue";
import PlanProfile from "@/business/controller/app/project/plan/planProfile.vue";

const props=defineProps<{
  projectId:string
}>()
const menuKey=ref(['home'])
const permission=ref(0)
let type=ref("home")
const eleNavigator=ref<InstanceType<typeof NavigatorContainer>>(null)
const navigator=getCurrentNavigator()
let objComponent={
  issue:markRaw(ProjectIssueList),
  release:markRaw(ProjectReleaseList),
  setting:markRaw(ProjectSetting),
  issueProfile:markRaw(ProjectIssueProfile),
  releaseProfile:markRaw(ProjectReleaseProfile),
	board:markRaw(BoardList),
	boardProfile:markRaw(BoardProfile),
	home:markRaw(ProjectHome),
	plan:markRaw(PlanList),
	planProfile:markRaw(PlanProfile)
}
const objProvide={
  id:props.projectId,
  permission:permission,
  key:ref("")
}
provide(injectProjectInfo,objProvide);
let objMeta=getCurrentNavigatorMeta()?.data as {
  projectIssueId?:string
  projectReleaseId?:string,
	boardSprintId?:string,
	boardId?:string,
	planId?:string
}
if(objMeta?.projectReleaseId) {
  menuKey.value=["release"]
} else if(objMeta?.boardSprintId || objMeta?.boardId) {
	menuKey.value=["board"]
} else if(objMeta?.projectIssueId) {
	menuKey.value=["issue"]
} else if(objMeta?.planId) {
	menuKey.value=["plan"]
}
onMounted(()=>{
  if(objMeta?.projectIssueId) {
    eleNavigator.value.navigator.replaceRoot("issueProfile",{
      projectIssueId:objMeta?.projectIssueId
    });
    delete objMeta.projectIssueId
  } else if(objMeta?.projectReleaseId) {
    eleNavigator.value.navigator.replaceRoot("releaseProfile",{
      projectReleaseId:objMeta?.projectReleaseId
    });
    delete objMeta.projectIssueId
  } else if(objMeta?.boardSprintId) {
	  eleNavigator.value.navigator.replaceRoot("boardProfile",{
		  boardId:objMeta?.boardId,
		  boardSprintId:objMeta?.boardSprintId
	  });
	  delete objMeta.boardId
	  delete objMeta.boardSprintId
  } else if(objMeta?.boardId) {
	  eleNavigator.value.navigator.replaceRoot("boardProfile",{
		  boardId:objMeta?.boardId,
	  });
	  delete objMeta.boardId
  } else if(objMeta?.planId) {
	  eleNavigator.value.navigator.replaceRoot("planProfile",{
		  planId:objMeta?.planId,
	  });
	  delete objMeta.planId
  } else {
    eleNavigator.value.navigator.replaceRoot(type.value,null);
  }
})
onBeforeMount(async ()=>{
  getPermission()
  getInfo()
})
const onSubMenuClick=(key:string)=>{
  type.value=key;
  eleNavigator.value.navigator.replaceRoot(key,null);
}
const getPermission=async ()=>{
  let res=await apiProject.getPermission({
    projectId:props.projectId
  })
  if(res?.code==0) {
    permission.value=res.data.value;
  }
}
const getInfo=async ()=>{
  let res=await apiProject.basic({
    projectId:props.projectId
  })
  if(res?.code==0) {
    objProvide.key.value=res.data.keyword
    navigator.setCurrentPath(res.data.name)
  } else {
		Message.error(res.msg)
  }
}
</script>

<style scoped>

</style>