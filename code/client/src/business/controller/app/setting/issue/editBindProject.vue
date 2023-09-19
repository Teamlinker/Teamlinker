<template>
  <a-form :model="form" ref="eleForm" style="width: 80%" auto-label-width>
    <a-form-item field="projectId" :label="$t('util.project')" required>
      <a-select @search="onSearch" v-model="form.projectId" allow-search @change="onChange">
        <a-option v-for="item in projectList" :value="item.id" :label="item.name"></a-option>
      </a-select>
    </a-form-item>
	  <a-form-item v-for="item in currentIssueTypeList" :key="item.id" :field="item.id" :label="item.name+' -> '" required>
		  <a-select v-model="form[item.id]">
			  <a-option v-for="item in newIssueTypeList" :key="item.id" :value="item.id" :label="item.name"></a-option>
		  </a-select>
	  </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {onBeforeMount, reactive, ref} from "vue";
import {apiIssueType, apiProject} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {ICommon_Model_Project} from "../../../../../../../common/model/project";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  issueTypeSolutionId:string
}>()
const eleForm=ref(null)
const form=reactive({
  projectId:""
})
const projectList=ref<DCSType<ICommon_Model_Project[]>>([])
const currentIssueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const newIssueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
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

const onChange=async ()=>{
	let res=await apiIssueType.solutionInfoByProjectId({
		projectId:form.projectId
	})
	if(res?.code==0) {
		let res1=await apiIssueType.list({
			issueTypeSolutionId:res.data.id
		});
		if(res1?.code==0) {
			currentIssueTypeList.value=res1.data
			currentIssueTypeList.value.forEach(item=>{
				form[item.id]=null
			})
		}
	}
}

const getNewIssueTypeList=async ()=>{
	let res=await apiIssueType.list({
		issueTypeSolutionId:props.issueTypeSolutionId
	})
	if(res?.code==0) {
		newIssueTypeList.value=res.data
	}
}

onBeforeMount(()=>{
	getNewIssueTypeList()
})

onDialogOk(dialogFuncGenerator({
  func:()=>{
    return apiIssueType.solutionBindProject({
	    projectId:form.projectId,
      relationship:Object.fromEntries(Object.entries(form).filter(value=>{
				if(value[0]!="projectId") {
					return true
				}
      })),
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