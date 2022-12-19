<template>
  <a-layout style="height: 100%">
    <a-layout-sider :resize-directions="['right']">
      <a-menu style="width: 100%" @menu-item-click="onSubMenuClick">
        <a-sub-menu key="organization">
          <template #title>Organization</template>
          <a-menu-item key="organizationEdit">Edit</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="userTeam">
          <template #title>User & Team</template>
          <a-menu-item key="userManage">User Manage</a-menu-item>
          <a-menu-item key="teamManage">Team Manage</a-menu-item>
          <a-menu-item key="tagManage">Tag Manage</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="role">
          <template #title>Role</template>
          <a-menu-item key="organizationRole">Organization</a-menu-item>
          <a-sub-menu key="roleProject">
            <template #title>Project</template>
            <a-menu-item key="projectGlobalRole">Global</a-menu-item>
            <a-menu-item key="projectSpecificRole">Specific</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="roleTeam">
            <template #title>Team</template>
            <a-menu-item key="teamGlobalRole">Global</a-menu-item>
            <a-menu-item key="teamSpecificRole">Specific</a-menu-item>
          </a-sub-menu>
        </a-sub-menu>
        <a-sub-menu key="project">
          <template #title>Project</template>
          <a-menu-item key="projectManage">Manage</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="issueSolution">
          <template #title>Issue Solution</template>
          <a-menu-item key="issueSolution">Manage</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout-content style="flex-direction: column;display: flex;padding: 10px">
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
import {markRaw, onMounted, ref} from "vue";
import IssueIndex from "./issue/index.vue"
import OrganizationIndex from "./organization/index.vue"
import ProjectIndex from "./project/index.vue"
import UserIndex from "./user&team/user.vue"
import TeamIndex from "./user&team/team.vue"
import TagIndex from "./user&team/tag.vue"
import RoleOrganizationIndex from "./role/organizationRoleList.vue"
import RoleProjectList from "./role/projectList.vue"
import RoleGlobalProjectIndex from "./role/projectRoleList.vue"
import RoleTeamGlobalIndex from "./role/teamRoleList.vue"
import RoleTeamList from "./role/teamList.vue"
import NavigatorContainer from "../../../../teamOS/common/component/navigator/navigatorContainer.vue";

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
}
let type=ref("")
let objCrumb={
  organizationEdit:"Organization Edit",
  userManage:"User",
  teamManage:"Team",
  tagManage:"Tag",
  project:"Project",
  issueSolution:"Issue Solution",
  organizationRole:"Organization Role",
  projectGlobalRole:"Global Project Role",
  projectSpecificRole:"Project List",
  teamGlobalRole:"Team Role",
  teamSpecificRole:"Team List"
}
const eleNavigator=ref<InstanceType<typeof NavigatorContainer>>(null)
let pathList=ref([]);
onMounted(()=>{
  pathList.value=eleNavigator.value.navigator.getPath();
})
const onSubMenuClick=(key:string)=>{
  type.value=key;
  eleNavigator.value.navigator.replaceRoot(key,null,objCrumb[key]);
}
</script>

<style scoped>

</style>