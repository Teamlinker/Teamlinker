<template>
  <div style="padding: 0 10px">
    <a-form layout="vertical" :model="form" ref="eleForm">
      <a-form-item label="Issue Type" field="issueTypeId" required>
        <a-select v-model="form.issueTypeId" @change="onIssueTypeChange">
          <a-option v-for="item in issueTypeList" :label="item.name" :value="item.id"></a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="name" field="name" required>
        <a-input v-model="form.name"></a-input>
      </a-form-item>
      <a-form-item label="description" field="description">
        <a-textarea v-model="form.description"></a-textarea>
      </a-form-item>
      <a-form-item label="priority" field="priority" required>
        <a-select v-model="form.priority">
          <a-option label="low" :value="ECommon_Model_Project_Issue_Priority.LOW"></a-option>
          <a-option label="medium" :value="ECommon_Model_Project_Issue_Priority.MEDIUM"></a-option>
          <a-option label="high" :value="ECommon_Model_Project_Issue_Priority.HIGH"></a-option>
          <a-option label="urgent" :value="ECommon_Model_Project_Issue_Priority.URGENT"></a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="assigner">
        <a-select allow-search @search="onSearchAssigner" v-model="form.assigner">
          <a-option v-for="item in assignerList" :label="item.organizationUser.nickname" :value="item.organizationUser.id">
            <a-avatar :size="24" :image-url="item.user.photo"></a-avatar>&nbsp;&nbsp;
            {{item.organizationUser.nickname}}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="reporter">
        <a-select allow-search @search="onSearchReporter" v-model="form.reporter">
          <a-option v-for="item in reporterList" :label="item.organizationUser.nickname" :value="item.organizationUser.id">
            <a-avatar :size="24" :image-url="item.user.photo"></a-avatar>&nbsp;&nbsp;
            {{item.organizationUser.nickname}}
          </a-option>
        </a-select>
      </a-form-item>
      <a-divider orientation="left" v-if="valueList.length>0">Custom Fields</a-divider>
      <a-form-item v-for="value in valueList" :key="value.field.id" :label="value.field.name" :extra="value.field.description" :field="value.field.name" :required="!value.field.optional">
        <FieldInput :item="value" :project-id="projectId"></FieldInput>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">

import {ECommon_Model_Project_Issue_Priority} from "../../../../../../../common/model/project_issue";
import {onBeforeMount, reactive, ref, toRef} from "vue";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {apiIssue, apiOrganization, apiProject, DCSType} from "../../../../common/request/request";
import {
  ICommon_Route_Req_ProjectIssue_Field,
  ICommon_Route_Res_Organization_User_Item,
  ICommon_Route_Res_Workflow_Node_Field
} from "../../../../../../../common/routes/response";
import FieldInput from "../../../../common/component/field/fieldInput.vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {SessionStorage} from "../../../../common/storage/session";

const props=defineProps<{
  projectId:string
}>()
const eleForm=ref(null);
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type[]>>([])
const assignerList=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const reporterList=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const valueList=ref<DCSType<(ICommon_Route_Res_Workflow_Node_Field & {
  fieldValue:ICommon_Route_Req_ProjectIssue_Field
})[]>>([])
const form=reactive({
  issueTypeId:"",
  name:"",
  description:"",
  priority:ECommon_Model_Project_Issue_Priority.MEDIUM,
  assigner:"",
  reporter:""
})
const getIssueTypeList=async ()=>{
  let res=await apiProject.issueTypeList({
    projectId:props.projectId
  })
  if(res?.code==0) {
    issueTypeList.value=res.data
  }
}
const onSearchAssigner=async (keyword:string)=>{
  let res=await apiOrganization.listUser({
    organizationId:SessionStorage.get("organizationId"),
    size:10,
    page:0,
    keyword
  })
  if(res?.code==0) {
    assignerList.value=res.data.data
  }
}
const onSearchReporter=async (keyword:string)=>{
  let res=await apiOrganization.listUser({
    organizationId:SessionStorage.get("organizationId"),
    size:10,
    page:0,
    keyword
  })
  if(res?.code==0) {
    reporterList.value=res.data.data
  }
}
onBeforeMount(async ()=>{
  getIssueTypeList()
})
const onIssueTypeChange=async ()=>{
  let res=await apiIssue.getFirstNodeFields({
    projectId:props.projectId,
    issueTypeId:form.issueTypeId
  })
  if(res?.code==0) {
    valueList.value=res.data.map(item=>{
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
  }
}
onDialogOk(dialogFuncGenerator({
  func:async ()=>{
    let res=await apiIssue.create({
      projectId :props.projectId ,
      issueTypeId :form.issueTypeId ,
      name :form.name,
      priority :form.priority,
      assignerId:form.assigner ,
      reporterId:form.reporter ,
      values:valueList.value.map(item=>item.fieldValue)
    })
    if(res?.code==0) {
      if(form.description) {
        apiIssue.editDescription({
          projectIssueId:res.data.id,
          description:form.description
        })
      }
    }
    return res;
  },
  form:()=>{
    return eleForm.value
  }
}))
</script>

<style scoped>

</style>