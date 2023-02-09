<template>
  <a-form :model="form" ref="eleForm">
    <a-form-item label="name" field="name" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item label="description" field="description">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
    <a-form-item label="dateRange" field="dateRange" required>
      <a-range-picker v-model="form.dateRange" :placeholder="['Start Date','Release Date']"></a-range-picker>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {apiRelease, DCSType} from "../../../../common/request/request";
import {ICommon_Route_Res_Release_Item} from "../../../../../../../common/routes/response";
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {Message} from "@arco-design/web-vue";

const props=defineProps<{
  type:"add"|"edit",
  projectId?:string,
  item?:DCSType<ICommon_Route_Res_Release_Item>
}>()
const form=reactive({
  name:props.type=="edit"?props.item.name:"",
  dateRange:props.type=="edit"?[props.item.start_time,props.item.release_time]:["",""],
  description:props.type=="edit"?props.item.description:""
})
const eleForm=ref(null)
onDialogOk(dialogFuncGenerator({
  func:()=>{
    if(!form.dateRange[0] || !form.dateRange[1]) {
      Message.error("you must select both date!")
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