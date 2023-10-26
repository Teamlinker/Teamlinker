<template>
  <a-collapse :default-active-key="['basic']" accordion>
    <a-collapse-item :header="$t('util.basic')" key="basic">
      <ProjectSettingBasic :project-id="projectId"></ProjectSettingBasic>
    </a-collapse-item>
    <a-collapse-item key="module">
	    <template #header>
		    <a-space>
			    {{$t('util.module')}}
			    <a-popover trigger="hover" position="right">
				    <icon-question-circle-fill style="color: rgb(35,110,184)"></icon-question-circle-fill>
				    <template #content>
					    <span style="color: dodgerblue">
								{{$t("help.module")}}
					    </span>
				    </template>
			    </a-popover>
		    </a-space>
	    </template>
      <ModuleList :project-id="projectId"></ModuleList>
    </a-collapse-item>
    <a-collapse-item key="label">
	    <template #header>
		    <a-space>
			    {{$t('util.label')}}
			    <a-popover trigger="hover" position="right">
				    <icon-question-circle-fill style="color: rgb(35,110,184)"></icon-question-circle-fill>
				    <template #content>
					    <span style="color: dodgerblue">
								{{$t("help.label")}}
					    </span>
				    </template>
			    </a-popover>
		    </a-space>
	    </template>
      <LabelList :project-id="projectId"></LabelList>
    </a-collapse-item>
    <a-collapse-item key="access">
	    <template #header>
		    <a-space>
			    {{$t('util.access')}}
			    <a-popover trigger="hover" position="right">
				    <icon-question-circle-fill style="color: rgb(35,110,184)"></icon-question-circle-fill>
				    <template #content>
					    <span style="color: dodgerblue;white-space: pre-line">
								{{$t("help.access")}}
					    </span>
				    </template>
			    </a-popover>
		    </a-space>
	    </template>
      <EditProjectAccess :project-id="projectId"></EditProjectAccess>
    </a-collapse-item>
    <a-collapse-item key="role">
	    <template #header>
		    <a-space>
			    {{$t('util.role')}}
			    <a-popover trigger="hover" position="right">
				    <icon-question-circle-fill style="color: rgb(35,110,184)"></icon-question-circle-fill>
				    <template #content>
					    <span style="color: dodgerblue;white-space: pre-line">
								{{$t("help.role")}}
					    </span>
				    </template>
			    </a-popover>
		    </a-space>
	    </template>
      <ProjectSettingRole :project-id="projectId"></ProjectSettingRole>
    </a-collapse-item>
    <a-collapse-item key="solution">
	    <template #header>
		    <a-space>
			    {{$t('util.issueSolution')}}
			    <a-popover trigger="hover" position="right">
				    <icon-question-circle-fill style="color: rgb(35,110,184)"></icon-question-circle-fill>
				    <template #content>
					    <span style="color: dodgerblue;white-space: pre-line">
								{{$t("help.issueSolution")}}
					    </span>
				    </template>
			    </a-popover>
		    </a-space>
	    </template>
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