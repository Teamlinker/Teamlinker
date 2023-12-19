<template>
  <a-form :model="form">
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {ICommon_Model_Member_Tag} from "../../../../../../../common/model/member_tag";
import {reactive} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {apiOrganization} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {SessionStorage} from "../../../../common/storage/session";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  type:"edit"|"add"
  item?:ICommon_Model_Member_Tag
}>()
let form=reactive<ICommon_Model_Member_Tag>(props.type=="edit"?JSON.parse(JSON.stringify(props.item)):{
  name:"",
  description:"",
  organization_id:SessionStorage.get("organizationId")
})
const {t}=useI18n()
onDialogOk(async ()=>{
  let ret=await (props.type=="edit"?apiOrganization.editTag({
    memberTagId:form.id,
    name:form.name,
    description:form.description
  }):apiOrganization.addTag({
    name:form.name,
    description:form.description
  }))
  if(ret?.code==0) {
    Message.success(t("tip.operationSuccess"))
    return true
  } else {
    Message.error(ret.msg)
    return false;
  }
})
</script>

<style scoped>

</style>