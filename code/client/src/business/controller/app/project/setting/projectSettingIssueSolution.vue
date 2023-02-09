<template>
  <a-form layout="inline" :model="form" @submitSuccess="onSubmit">
    <a-form-item label="issue type solution" field="issueTypeSolutionId" required>
      <a-select v-model="form.issueTypeSolutionId" allow-search>
        <a-option v-for="item in issueSolutionList" :label="item.name" :value="item.id"></a-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-button html-type="submit" type="primary">Save</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {getCurrentInstance, onBeforeMount, reactive, ref} from "vue";
import {apiIssueType, DCSType} from "../../../../common/request/request";
import {ICommon_Model_Issue_Type_Solution} from "../../../../../../../common/model/issue_type_solution";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import {Message} from "@arco-design/web-vue";

const props=defineProps<{
  projectId:string
}>()
const form=reactive({
  issueTypeSolutionId:""
})
const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const issueSolutionList=ref<DCSType<ICommon_Model_Issue_Type_Solution>[]>([])
const onSubmit=async ()=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to switch to this issue type solution?")
  if(ret) {
    let res=await apiIssueType.solutionBindProject({
      projectId:props.projectId,
      issueTypeSolutionId:form.issueTypeSolutionId
    })
    if(res?.code==0) {
      Message.success("bind success")
    } else {
      Message.error(res.msg)
    }
  }
}
const getIssueSolutionList=async ()=>{
  let res=await apiIssueType.solutionList();
  if(res?.code==0) {
    issueSolutionList.value=res.data
  }
}
const getCurrentSolution=async ()=>{
  let res=await apiIssueType.solutionInfoByProjectId({
    projectId:props.projectId
  })
  if(res?.code==0) {
    form.issueTypeSolutionId=res.data.id
  }
}
onBeforeMount(()=>{
  getIssueSolutionList()
  getCurrentSolution()
})
</script>

<style scoped>

</style>