<template>
  <a-form layout="inline" :model="form" @submitSuccess="onSubmit">
    <a-form-item :label="$t('util.issueSolution')" field="issueTypeSolutionId" required>
      <a-select v-model="form.issueTypeSolutionId" allow-search>
        <a-option v-for="item in issueSolutionList" :label="item.name" :value="item.id"></a-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-button html-type="submit" type="primary">{{$t("util.save")}}</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiBoard, apiIssue, apiIssueType} from "../../../../common/request/request";
import {ICommon_Model_Issue_Type_Solution} from "../../../../../../../common/model/issue_type_solution";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import {Message} from "@arco-design/web-vue";
import ProjectSettingIssueSolutionConvert
	from "@/business/controller/app/project/setting/projectSettingIssueSolutionConvert.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  projectId:string
}>()
const form=reactive({
  issueTypeSolutionId:""
})
const currentIssueTypeSolutionId=ref("")
const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const {t}=useI18n()
const issueSolutionList=ref<DCSType<ICommon_Model_Issue_Type_Solution>[]>([])
const onSubmit=async ()=>{
	if(currentIssueTypeSolutionId.value===form.issueTypeSolutionId) {
		return
	}
  let ret=await Dialog.confirm(root.value,appContext,t("tip.switchIssueSolution"))
  if(ret) {
		let [resIssueCount,resBoardCount]=await Promise.all([
			apiIssue.count({
				projectId:props.projectId
			}),
			apiBoard.count({
				projectId:props.projectId
			})
		])
	  if(resIssueCount.data.count==0 && resBoardCount.data.count==0) {
		  let res=await apiIssueType.solutionBindProject({
			  projectId:props.projectId,
			  issueTypeSolutionId:form.issueTypeSolutionId
		  })
		  if(res?.code==0) {
			  Message.success(t("tip.bindSuccess"))
			  currentIssueTypeSolutionId.value=form.issueTypeSolutionId
		  } else {
			  Message.error(res.msg)
		  }
	  } else {
		  let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingIssueSolution.issueTypeConvert"),markRaw(ProjectSettingIssueSolutionConvert),{
			  originalIssueTypeSolutionId:currentIssueTypeSolutionId.value,
			  newIssueTypeSolutionId:form.issueTypeSolutionId,
			  projectId:props.projectId
		  })
		  if(ret) {
			  currentIssueTypeSolutionId.value=form.issueTypeSolutionId
		  }
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
	  currentIssueTypeSolutionId.value=form.issueTypeSolutionId
  }
}
onBeforeMount(async ()=>{
	await getCurrentSolution()
  await getIssueSolutionList()
})
</script>

<style scoped>

</style>