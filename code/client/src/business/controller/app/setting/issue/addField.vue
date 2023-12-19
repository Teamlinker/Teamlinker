<template>
  <a-form :model="form" style="width: 80%" ref="eleForm">
    <a-form-item filed="fieldTypeId" :label="$t('util.fieldType')" required>
      <a-select v-model="form.fieldTypeId">
        <a-option label="Switch" :value="ECommon_Field_Type.SWITCH"></a-option>
        <a-option label="Multi Select" :value="ECommon_Field_Type.MULTISELECT"></a-option>
        <a-option label="Select" :value="ECommon_Field_Type.SELECT"></a-option>
        <a-option label="Text" :value="ECommon_Field_Type.TEXT"></a-option>
        <a-option label="Text Area" :value="ECommon_Field_Type.MULTITEXT"></a-option>
        <a-option label="Label" :value="ECommon_Field_Type.LABEL"></a-option>
        <a-option label="Multi Label" :value="ECommon_Field_Type.MULTILABEL"></a-option>
        <a-option label="Time" :value="ECommon_Field_Type.TIME"></a-option>
        <a-option label="Date" :value="ECommon_Field_Type.DATE"></a-option>
      </a-select>
    </a-form-item>
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="form.description"></a-textarea>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {ECommon_Field_Type} from "../../../../../../../common/field/type";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {apiField} from "../../../../common/request/request";

const props=defineProps<{
  workflowNodeId:string
}>()
const eleForm=ref(null)
const form=reactive({
  fieldTypeId:0,
  name:"",
  description:""
})
onDialogOk(dialogFuncGenerator({
  func:()=>{
    return apiField.addWorkflowNodeField({
      workflowNodeId:props.workflowNodeId,
      ...form,
      optional:1
    })
  },
  form:()=>{
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>