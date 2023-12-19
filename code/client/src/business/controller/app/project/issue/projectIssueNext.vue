<template>
  <div style="padding: 0 10px">
    <a-form layout="vertical" :model="form" ref="eleForm">
      <a-form-item v-for="value in valueList" :key="value.field.id" :label="value.field.name" :extra="value.field.description" :field="value.field.name" :required="!value.field.optional">
        <FieldInput :item="value" :project-id="projectId"></FieldInput>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">

import {reactive, ref, toRef} from "vue";
import {apiIssue} from "../../../../common/request/request";
import {
	ICommon_Route_Req_ProjectIssue_Field,
	ICommon_Route_Res_Workflow_Node_Field
} from "../../../../../../../common/routes/response";
import FieldInput from "../../../../common/component/field/fieldInput.vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  projectId:string,
  projectIssueId:string,
  workflowActionId:string,
  items:DCSType<ICommon_Route_Res_Workflow_Node_Field[]>
}>()
const eleForm=ref(null);
const valueList=ref<DCSType<(ICommon_Route_Res_Workflow_Node_Field & {
  fieldValue:ICommon_Route_Req_ProjectIssue_Field
})[]>>([])
const form=reactive({})
valueList.value=props.items.map(item=>{
  return {
    ...item,
    fieldValue:{
      fieldId:item.field.id,
      value:null
    }
  }
})
valueList.value.forEach(item=>{
  form[item.field.name]=toRef(item.fieldValue,"value")
})
onDialogOk(dialogFuncGenerator({
  func:async ()=>{
    let res=await apiIssue.confirmNextNode({
      projectIssueId:props.projectIssueId,
      workflowActionId:props.workflowActionId,
      values:valueList.value.map(item=>item.fieldValue)
    })
    return res;
  },
  form:()=>{
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>