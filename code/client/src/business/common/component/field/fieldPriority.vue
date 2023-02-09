<template>
  <span style="display: inline-block">
    <span v-if="priority==ECommon_Model_Project_Issue_Priority.LOW">
      <icon-down style="color: lightblue"></icon-down>&nbsp;
      Low
    </span>
    <span v-else-if="priority==ECommon_Model_Project_Issue_Priority.MEDIUM">
      <icon-unordered-list style="color: orange"></icon-unordered-list>&nbsp;
      Medium
    </span>
    <span v-else-if="priority==ECommon_Model_Project_Issue_Priority.HIGH">
      <icon-up style="color: #ea6e41"></icon-up>&nbsp;
      High
    </span>
    <span v-if="priority==ECommon_Model_Project_Issue_Priority.URGENT">
      <icon-double-up style="color: red"></icon-double-up>&nbsp;
      Urgent
    </span>
  </span>
</template>

<script setup lang="ts">
import {ECommon_Model_Project_Issue_Priority} from "../../../../../../common/model/project_issue";

const props=defineProps<{
  priority:ECommon_Model_Project_Issue_Priority
}>()
</script>

<style scoped>

</style>