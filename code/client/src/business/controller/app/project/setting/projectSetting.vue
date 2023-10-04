<template>
  <a-collapse :default-active-key="['basic']" accordion>
    <a-collapse-item :header="$t('util.basic')" key="basic">
      <ProjectSettingBasic :project-id="projectId"></ProjectSettingBasic>
    </a-collapse-item>
    <a-collapse-item :header="$t('util.module')" key="module">
      <ModuleList :project-id="projectId"></ModuleList>
    </a-collapse-item>
    <a-collapse-item :header="$t('util.label')" key="label">
      <LabelList :project-id="projectId"></LabelList>
    </a-collapse-item>
    <a-collapse-item :header="$t('util.access')" key="access">
      <EditProjectAccess :project-id="projectId"></EditProjectAccess>
    </a-collapse-item>
    <a-collapse-item :header="$t('util.role')" key="role">
      <ProjectSettingRole :project-id="projectId"></ProjectSettingRole>
    </a-collapse-item>
    <a-collapse-item :header="$t('util.issueSolution')" key="solution">
      <ProjectSettingIssueSolution :project-id="projectId"></ProjectSettingIssueSolution>
    </a-collapse-item>
  </a-collapse>
</template>

<script setup lang="ts">
import {inject} from "vue";
import {injectProjectInfo} from "../../../../common/util/symbol";
import ProjectSettingBasic from "./projectSettingBasic.vue";
import ModuleList from "../../setting/project/moduleList.vue";
import LabelList from "../../setting/project/labelList.vue";
import EditProjectAccess from "../../setting/project/editProjectAccess.vue";
import ProjectSettingRole from "./projectSettingRole.vue";
import ProjectSettingIssueSolution from "./projectSettingIssueSolution.vue";


const projectId=inject(injectProjectInfo).id;

</script>

<style scoped>

</style>