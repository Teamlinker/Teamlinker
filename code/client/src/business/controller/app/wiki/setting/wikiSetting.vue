<template>
  <a-collapse :default-active-key="['basic']" accordion>
    <a-collapse-item header="Basic" key="basic">
      <WikiSettingBasic :wiki-id="wikiId"></WikiSettingBasic>
    </a-collapse-item>
    <a-collapse-item header="Access" key="access">
      <EditWikiAccess :wiki-id="wikiId"></EditWikiAccess>
    </a-collapse-item>
    <a-collapse-item header="Role" key="role">
      <WikiSettingRole :wiki-id="wikiId"></WikiSettingRole>
    </a-collapse-item>
  </a-collapse>
</template>

<script setup lang="ts">
import WikiSettingBasic from "./wikiSettingBasic.vue";
import EditWikiAccess from "../../setting/wiki/editWikiAccess.vue";
import WikiSettingRole from "./wikiSettingRole.vue";

const props=defineProps<{
  wikiId:string
}>()
</script>

<style scoped>

</style>