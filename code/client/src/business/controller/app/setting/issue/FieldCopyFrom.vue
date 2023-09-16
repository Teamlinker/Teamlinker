<template>
  <a-form :model="form" auto-label-width ref="eleForm">
    <a-form-item field="workflowNodeId" :label="$t('util.issueType')" required>
      <a-cascader :options="data" v-model="form.workflowNodeId" :field-names="fields" :placeholder="$t('placeholder.pleaseSelect')" allow-search></a-cascader>
    </a-form-item>
	  <a-form-item field="overwrite" :label="$t('controller.app.setting.issue.fieldCopyFrom.overwrite')" required>
		  <a-switch v-model="form.overwrite" :unchecked-value="0" :checked-value="1"></a-switch>
	  </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue"
import {ICommon_Route_Res_Workflow_Node_List_Item} from "../../../../../../../common/routes/response";
import {apiField, apiWorkflow} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";

const props=defineProps<{
  workflowNodeId:string
}>()
const form=reactive({
  workflowNodeId:"",
	overwrite:0
})
const eleForm=ref(null)
const fields={
  value:"id",
  label:"name",
  children:"data"
}
const data=ref<ICommon_Route_Res_Workflow_Node_List_Item[]>([])
onBeforeMount(async ()=>{
  let res=await apiWorkflow.listAllNode()
  if(res?.code==0) {
    data.value=res.data
  }
})
onDialogOk(dialogFuncGenerator({
  func:()=>{
    return apiField.workflowFieldsCopy({
      workflowNodeId:form.workflowNodeId,
      newWorkflowNodeId:props.workflowNodeId,
	    overwrite:form.overwrite
    })
  },
  form:()=>{
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>