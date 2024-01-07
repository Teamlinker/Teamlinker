<template>
  <a-form style="width: 80%" :model="form" ref="eleForm">
    <a-form-item field="status" :label="$t('util.type')" required>
      <a-select v-model="form.status">
        <a-option :value="ECommon_Model_Workflow_Node_Status.INPROGRESS">{{$t("util.inProgress")}}</a-option>
        <a-option :value="ECommon_Model_Workflow_Node_Status.DONE">{{$t("util.done")}}</a-option>
      </a-select>
    </a-form-item>
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {apiWorkflow} from "../../../../common/request/request";

const props=defineProps<{
  issueTypeId:string
}>()
const form=reactive({
  status:ECommon_Model_Workflow_Node_Status.INPROGRESS,
  name:"",
  description:""
})
const eleForm=ref(null);
onDialogOk(dialogFuncGenerator({
  func:()=>{
    return apiWorkflow.addNode({
      issueTypeId:props.issueTypeId,
      x:0,
      y:0,
      ...form
    })
  },
  form:()=>{
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>