<template>
  <a-collapse :default-active-key="['basic']" accordion>
    <a-collapse-item :header="$t('util.basic')" key="basic">
      <WikiSettingBasic :wiki-id="wikiId"></WikiSettingBasic>
    </a-collapse-item>
    <a-collapse-item :header="$t('util.access')" key="access">
      <EditWikiAccess :wiki-id="wikiId"></EditWikiAccess>
    </a-collapse-item>
    <a-collapse-item :header="$t('util.role')" key="role">
      <WikiSettingRole :wiki-id="wikiId"></WikiSettingRole>
    </a-collapse-item>
  </a-collapse>
</template>

<script setup lang="ts">
import WikiSettingBasic from "./wikiSettingBasic.vue";
import EditWikiAccess from "../../setting/wiki/editWikiAccess.vue";
import WikiSettingRole from "./wikiSettingRole.vue";
import {Err} from "../../../../../../../common/status/error";

const props=defineProps<{
  wikiId:string
}>()
</script>

<style scoped>

</style>