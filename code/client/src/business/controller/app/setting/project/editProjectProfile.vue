<template>
  <a-form ref="eleForm" :model="form" auto-label-width>
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item field="keyword" :label="$t('util.keyword')" required>
      <a-input v-model="form.keyword" v-if="type=='add'"></a-input>
      <template v-else>{{form.keyword}}</template>
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
	  <a-form-item field="issueTypeSolutionId" :label="$t('util.issueSolution')" required v-if="type==='add'" :extra="$t('help.issueSolutionProjectCreate')">
		  <a-select v-model="form.issueTypeSolutionId" allow-search>
			  <a-option v-for="item in issueSolutionList" :label="item.name" :value="item.id"></a-option>
		  </a-select>
	  </a-form-item>
    <a-form-item :label="$t('util.logo')">
      <Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="type=='edit'?item.photo:''" @upload="onUpload"></Upload>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {ICommon_Model_Project} from "../../../../../../../common/model/project";
import Upload from "../../../../common/component/upload.vue";
import {getCurrentInstance, onBeforeMount, reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {apiIssueType, apiProject} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {ICommon_Model_Issue_Type_Solution} from "../../../../../../../common/model/issue_type_solution";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  type:"edit"|"add",
  item?:DCSType<ICommon_Model_Project>
}>()
const form=reactive({
  name:props.type=="edit"?props.item.name:"",
  keyword:props.type=="edit"?props.item.keyword:"",
  description:props.type=="edit"?props.item.description:"",
	...(props.type==="add" && {
		issueTypeSolutionId:""
	})
})
const {t}=useI18n()
const issueSolutionList=ref<DCSType<ICommon_Model_Issue_Type_Solution>[]>([])
const uploadUriId=ref("")
const onUpload=(id:string)=> {
  uploadUriId.value=id
}
const eleForm=ref(null);
const appContext=getCurrentInstance().appContext;

const getIssueSolutionList=async ()=>{
	let res=await apiIssueType.solutionList();
	if(res?.code==0) {
		issueSolutionList.value=res.data
	}
}

onBeforeMount(()=>{
	if(props.type==="add") {
		getIssueSolutionList()
	}
})

onDialogOk(async ()=>{
  let isError=await eleForm.value.validate()
  if(isError) {
    return false;
  }
  let res=await (props.type=="edit"?apiProject.edit({
    projectId:props.item.id,
    ...form,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  }):apiProject.create({
    ...form,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    }),
  }))
  if(res?.code==0){
    Message.success(t("tip.operationSuccess"));
    return true;
  } else {
    Message.error(res.msg);
    return false
  }
})
</script>

<style scoped>

</style>