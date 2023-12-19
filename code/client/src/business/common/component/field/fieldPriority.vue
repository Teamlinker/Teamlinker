<template>
  <span style="display: inline-block">
    <span v-if="priority==ECommon_Model_Project_Issue_Priority.LOW">
      <icon-down style="color: lightblue"></icon-down>&nbsp;
      <template v-if="!onlyIcon">
	      {{$t("util.low")}}
      </template>
    </span>
    <span v-else-if="priority==ECommon_Model_Project_Issue_Priority.MEDIUM">
      <icon-unordered-list style="color: orange"></icon-unordered-list>&nbsp;
	    <template v-if="!onlyIcon">
	      {{$t("util.medium")}}
      </template>

    </span>
    <span v-else-if="priority==ECommon_Model_Project_Issue_Priority.HIGH">
      <icon-up style="color: #ea6e41"></icon-up>&nbsp;
	    <template v-if="!onlyIcon">
	      {{$t("util.high")}}
      </template>

    </span>
    <span v-if="priority==ECommon_Model_Project_Issue_Priority.URGENT">
      <icon-double-up style="color: red"></icon-double-up>&nbsp;
	    <template v-if="!onlyIcon">
	      {{$t("util.urgent")}}
      </template>

    </span>
  </span>
</template>

<script setup lang="ts">
import {ECommon_Model_Project_Issue_Priority} from "../../../../../../common/model/project_issue";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
  priority:ECommon_Model_Project_Issue_Priority|DCSType<ECommon_Model_Project_Issue_Priority>,
	onlyIcon?:boolean
}>()
</script>

<style scoped>

</style>