<template>
  <a-form ref="eleForm" :model="form" style="width: 80%">
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {apiIssueType} from "../../../../common/request/request";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";

const props=defineProps<{
  type:"edit"|"add",
  item?:ICommon_Model_Issue_Type,
  issueTypeSolutionId?:string
}>()
const form=reactive({
  name:props.type=="edit"?props.item.name:"",
  description:props.type=="edit"?props.item.description:""
})
const eleForm=ref(null)
onDialogOk(dialogFuncGenerator({
  func: () => {
    return props.type == "edit" ? apiIssueType.update({
      ...form,
      issueTypeId: props.item.id
    }) : apiIssueType.create({
      ...form,
      issueTypeSolutionId:props.issueTypeSolutionId
    })
  },
  form: () => {
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>