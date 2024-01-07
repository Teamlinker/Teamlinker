<template>
  <a-form :model="form" ref="eleForm">
    <a-form-item :label="$t('util.issue')" field="issueId" required>
      <a-select allow-clear allow-search @search="onSearch" v-model="form.issueId">
        <a-option v-for="item in issueList" :value="item.id">
	        <a-space>
		        {{projectKey+"-"+item.unique_id}}
		        {{item.name}}
	        </a-space>
        </a-option>
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {reactive, ref} from "vue";
import {apiIssue} from "../../../../common/request/request";
import {ICommon_Route_Res_Project_Issue_filter_Item} from "../../../../../../../common/routes/response";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  projectId:string,
  projectKey:string
}>()
const eleForm=ref(null)
const form=reactive({
  issueId:""
})
const issueList=ref<DCSType<ICommon_Route_Res_Project_Issue_filter_Item>[]>([])
const onSearch=async (keyword:string)=>{
  let res=await apiIssue.filter({
    name:keyword,
    page:0,
    size:10,
    projectId:props.projectId
  })
  if(res?.code==0) {
    issueList.value=res.data.data
  }
}
onDialogOk(dialogFuncGenerator({
  func:()=>{
    return form.issueId
  },
  form:()=>{
    return eleForm.value
  }
}));
</script>

<style scoped>

</style>