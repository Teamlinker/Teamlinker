<template>
  <a-form :model="form" ref="eleForm">
    <a-form-item :label="$t('util.name')" field="name" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item :label="$t('util.description')" field="description">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
    <a-form-item :label="$t('util.dateRange')" field="dateRange" required>
      <a-range-picker v-model="form.dateRange" :placeholder="[$t('util.startDate'),$t('util.releaseDate')]"></a-range-picker>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {apiRelease} from "../../../../common/request/request";
import {ICommon_Route_Res_Release_Item} from "../../../../../../../common/routes/response";
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  type:"add"|"edit",
  projectId?:string,
  item?:DCSType<ICommon_Route_Res_Release_Item>
}>()
const {t}=useI18n()
const form=reactive({
  name:props.type=="edit"?props.item.name:"",
  dateRange:props.type=="edit"?[props.item.start_time,props.item.release_time]:["",""],
  description:props.type=="edit"?props.item.description:""
})
const eleForm=ref(null)
onDialogOk(dialogFuncGenerator({
  func:()=>{
    if(!form.dateRange[0] || !form.dateRange[1]) {
      Message.error(t("tip.selectBothDate"))
      return false;
    }
    return props.type=="add"?apiRelease.create({
      projectId:props.projectId,
      name:form.name,
      description:form.description,
      start_time:form.dateRange[0],
      release_time:form.dateRange[1]
    }):apiRelease.edit({
      projectReleaseId:props.item.id,
      name:form.name,
      description:form.description,
      start_time:form.dateRange[0],
      release_time:form.dateRange[1]
    })
  },
  form:()=>{
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>