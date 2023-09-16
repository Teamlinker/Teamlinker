<template>
  <a-layout style="height: 100%">
    <a-layout-sider :resize-directions="['right']">
      <a-menu style="width: 100%" v-model:selected-keys="selectedKeys">
	      <a-menu-item key="home">
		      <template #icon>
			      <icon-home></icon-home>
		      </template>
		      {{$t("util.home")}}
	      </a-menu-item>
        <a-sub-menu key="organization">
          <template #icon>
            <sicon size="" color="" name="Ant" type="apartment"></sicon>
          </template>
          <template #title>{{$t("util.organization")}}</template>
          <a-menu-item key="organizationEdit">
            <template #icon>
              <sicon size="" color="" name="Ant" type="edit"></sicon>
            </template>
	          {{$t("util.edit")}}
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="userTeam">
          <template #icon>
            <sicon size="" color="" name="Ant" type="team"></sicon>
          </template>
          <template #title>{{$t("util.user")}} & {{$t("util.team")}}</template>
          <a-menu-item key="userManage">
            <template #icon>
              <sicon size="" color="" name="Ant" type="edit"></sicon>
            </template>
            {{$t("controller.app.setting.setting.userManage")}}
          </a-menu-item>
          <a-menu-item key="teamManage">
            <template #icon>
              <sicon size="" color="" name="Ant" type="edit"></sicon>
            </template>
	          {{$t("controller.app.setting.setting.teamManage")}}
          </a-menu-item>
          <a-menu-item key="tagManage">
            <template #icon>
              <sicon size="" color="" name="Ant" type="edit"></sicon>
            </template>
	          {{$t("controller.app.setting.setting.tagManage")}}
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="role">
          <template #icon>
            <sicon size="" color="" name="Ant" type="index"></sicon>
          </template>
          <template #title>{{$t("util.role")}}</template>
          <a-menu-item key="organizationRole">
            <template #icon>
              <sicon size="" color="" name="Ant" type="edit"></sicon>
            </template>
	          {{$t("util.organization")}}
          </a-menu-item>
          <a-sub-menu key="roleProject">
            <template #title>{{$t("util.project")}}</template>
            <a-menu-item key="projectGlobalRole">
              <template #icon>
                <sicon size="" color="" name="Ant" type="edit"></sicon>
              </template>
	            {{$t("util.global")}}
            </a-menu-item>
            <a-menu-item key="projectSpecificRole">
              <template #icon>
                <sicon size="" color="" name="Ant" type="edit"></sicon>
              </template>
	            {{$t("util.specific")}}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="roleTeam">
            <template #title>{{$t("util.team")}}</template>
            <a-menu-item key="teamGlobalRole">
              <template #icon>
                <sicon size="" color="" name="Ant" type="edit"></sicon>
              </template>
	            {{$t("util.global")}}
            </a-menu-item>
            <a-menu-item key="teamSpecificRole">
              <template #icon>
                <sicon size="" color="" name="Ant" type="edit"></sicon>
              </template>
	            {{$t("util.specific")}}
            </a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="roleWiki">
            <template #title>{{$t("util.wiki")}}</template>
            <a-menu-item key="wikiGlobalRole">
              <template #icon>
                <sicon size="" color="" name="Ant" type="edit"></sicon>
              </template>
	            {{$t("util.global")}}
            </a-menu-item>
            <a-menu-item key="wikiSpecificRole">
              <template #icon>
                <sicon size="" color="" name="Ant" type="edit"></sicon>
              </template>
	            {{$t("util.specific")}}
            </a-menu-item>
          </a-sub-menu>
        </a-sub-menu>
        <a-sub-menu key="project">
          <template #icon>
            <sicon size="" color="" name="Ant" type="project"></sicon>
          </template>
          <template #title>{{$t("util.project")}}</template>
          <a-menu-item key="projectManage">
            <template #icon>
              <sicon size="" color="" name="Ant" type="edit"></sicon>
            </template>
	          {{$t("util.manage")}}
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="issueSolution">
          <template #icon>
            <sicon size="" color="" name="Ant" type="solution"></sicon>
          </template>
          <template #title>{{$t("util.issueSolution")}}</template>
          <a-menu-item key="issueSolution">
            <template #icon>
              <sicon size="" color="" name="Ant" type="edit"></sicon>
            </template>
	          {{$t("util.manage")}}
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="wiki">
          <template #icon>
            <sicon size="" color="" name="Ant" type="file"></sicon>
          </template>
          <template #title>{{$t("util.wiki")}}</template>
          <a-menu-item key="wikiManage">
            <template #icon>
              <sicon size="" color="" name="Ant" type="edit"></sicon>
            </template>
	          {{$t("util.manage")}}
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout-content style="flex-direction: column;display: flex;padding: 10px;box-sizing: border-box">
      <a-breadcrumb style="margin: 10px 0;flex: 0 1 auto">
        <a-breadcrumb-item v-for="item in pathList">{{item}}</a-breadcrumb-item>
      </a-breadcrumb>
      <a-divider margin="0"></a-divider>
      <div style="width: 100%;display: flex;flex: 1 1 auto;padding-top: 20px">
        <NavigatorContainer :routes="objComponent" ref="eleNavigator"></NavigatorContainer>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import {computed, markRaw, onMounted, ref, watch} from "vue";
import NavigatorContainer from "../../../../teamOS/common/component/navigator/navigatorContainer.vue";
import IssueIndex from "./issue/issueSolutionList.vue";
import OrganizationIndex from "./organization/index.vue";
import ProjectIndex from "./project/index.vue";
import WikiIndex from "./wiki/index.vue";
import RoleOrganizationIndex from "./role/organization/organizationRoleList.vue";
import RoleProjectList from "./role/project/projectList.vue";
import RoleGlobalProjectIndex from "./role/project/projectRoleList.vue";
import RoleTeamList from "./role/team/teamList.vue";
import RoleTeamGlobalIndex from "./role/team/teamRoleList.vue";
import TagIndex from "./user&team/tag.vue";
import TeamIndex from "./user&team/team.vue";
import UserIndex from "./user&team/user.vue";
import RoleWikiList from "./role/wiki/wikiList.vue";
import RoleGlobalWikiIndex from "./role/wiki/wikiRoleList.vue";
import SettingHome from "@/business/controller/app/setting/home/settingHome.vue";
import {useI18n} from "vue-i18n";

let objComponent={
  issueSolution:markRaw(IssueIndex),
  organizationEdit:markRaw(OrganizationIndex),
  projectManage:markRaw(ProjectIndex),
  userManage:markRaw(UserIndex),
  teamManage:markRaw(TeamIndex),
  tagManage:markRaw(TagIndex),
  organizationRole:markRaw(RoleOrganizationIndex),
  projectSpecificRole:markRaw(RoleProjectList),
  projectGlobalRole:markRaw(RoleGlobalProjectIndex),
  teamGlobalRole:markRaw(RoleTeamGlobalIndex),
  teamSpecificRole:markRaw(RoleTeamList),
  wikiSpecificRole: markRaw(RoleWikiList),
  wikiGlobalRole:markRaw(RoleGlobalWikiIndex),
  wikiManage:markRaw(WikiIndex),
	home:markRaw(SettingHome)
}
let type=ref("")
const {t}=useI18n()
let objCrumb={
  organizationEdit:t("controller.app.setting.setting.organizationEdit"),
  userManage:t("util.user"),
  teamManage:t("util.team"),
  tagManage:t("util.tag"),
  projectManage:t("util.project"),
  issueSolution:t("util.issueSolution"),
  organizationRole:t("controller.app.setting.setting.organizationRole"),
  projectGlobalRole:t("controller.app.setting.setting.globalProjectRole"),
  projectSpecificRole:t("controller.app.setting.setting.projectList"),
  teamGlobalRole:t("controller.app.setting.setting.teamRole"),
  teamSpecificRole:t("controller.app.setting.setting.teamRole"),
  wikiGlobalRole:t("controller.app.setting.setting.globalWikiRole"),
  wikiSpecificRole:t("controller.app.setting.setting.wikiList"),
  wikiManage:t("util.wiki"),
	home:t("util.dashboard")
}
const selectedKeys=ref(["home"])
const eleNavigator=ref<InstanceType<typeof NavigatorContainer>>(null)
let pathList=computed(()=>{
  if(eleNavigator.value) {
    return eleNavigator.value.navigator.getPath().slice(0,eleNavigator.value.navigator.getIndex().value+1);
  } else {
    return []
  }
});
watch(selectedKeys,()=>{
	locate()
})
const locate=()=>{
	let key=selectedKeys.value[0]
	type.value=key;
	eleNavigator.value.navigator.replaceRoot(key,null,objCrumb[key]);
}
onMounted(()=>{
	locate()
})
</script>

<style scoped>

</style>