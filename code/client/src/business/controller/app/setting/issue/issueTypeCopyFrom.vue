<template>
  <a-form ref="eleForm" :model="form" style="width: 80%">
    <a-form-item field="issueTypeId" :label="$t('util.issueType')" required>
      <a-cascader v-model="form.issueTypeId" :field-names="fields" :options="data" :placeholder="$t('placeholder.pleaseSelect')"></a-cascader>
    </a-form-item>
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {apiIssueType} from "../../../../common/request/request";
import {ICommon_Route_Res_IssueTypeSolution_List_Item} from "../../../../../../../common/routes/response";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {DCSType} from "../../../../../../../common/types";

const fields={
  label:"name",
  value:"id",
  children:"issueTypeList"
}
const props=defineProps<{
  issueTypeSolutionId:string
}>()
const form=reactive({
  issueTypeId:"",
  name:""
})
const eleForm=ref(null);
const data=ref<DCSType<ICommon_Route_Res_IssueTypeSolution_List_Item[]>>([])
onBeforeMount(async ()=>{
  let res=await apiIssueType.solutionList();
  if(res?.code==0) {
    data.value=res.data
  }
})
onDialogOk(dialogFuncGenerator({
  func:()=>{
    return apiIssueType.copy({
      issueTypeId:form.issueTypeId,
      newIssueTypeSolutionId:props.issueTypeSolutionId,
      name:form.name
    })
  },
  form:()=>{
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>