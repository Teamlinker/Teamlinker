<template>
  <a-form :model="form" ref="eleForm" style="width: 80%">
    <a-form-item field="projectId" label="project" required>
      <a-select @search="onSearch" v-model="form.projectId" allow-search>
        <a-option v-for="item in projectList" :value="item.id" :label="item.name"></a-option>
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {apiIssueType, apiProject, DCSType} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {ICommon_Model_Project} from "../../../../../../../common/model/project";
import {dialogFuncGenerator} from "../../../../common/util/helper";

const props=defineProps<{
  issueTypeSolutionId:string
}>()
const eleForm=ref(null)
const form=reactive({
  projectId:""
})
const projectList=ref<DCSType<ICommon_Model_Project[]>>([])
const onSearch=async (value:string)=>{
  let res=await apiProject.list({
    page:0,
    size:20,
    keyword:value
  })
  if(res?.code==0) {
    projectList.value=res.data.data
  }
}
onDialogOk(dialogFuncGenerator({
  func:()=>{
    return apiIssueType.solutionBindProject({
      ...form,
      issueTypeSolutionId:props.issueTypeSolutionId
    })
  },
  form:()=>{
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>