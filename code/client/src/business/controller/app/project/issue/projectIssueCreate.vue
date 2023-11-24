<template>
  <div style="padding: 0 10px" ref="root">
    <a-form layout="vertical" :model="form" ref="eleForm">
      <a-form-item :label="$t('util.issueType')" field="issueTypeId" required>
        <a-select v-model="form.issueTypeId" @change="onIssueTypeChange">
          <a-option v-for="item in issueTypeList" :label="item.name" :value="item.id"></a-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('util.name')" field="name" required>
        <a-input v-model="form.name"></a-input>
      </a-form-item>
      <a-form-item :label="$t('util.description')" field="description">
	      <a-spin :loading="loading" v-drop.file.shortcut.disk="onDrop" style="width: 100%;background-color: rgb(242, 243, 245)">
		      <RichEditor style="color: black" v-model="form.description" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" @quote-list="onQuoteList" ref="objEditor"></RichEditor>
	      </a-spin>
      </a-form-item>
      <a-form-item :label="$t('util.priority')" field="priority" required>
        <a-select v-model="form.priority">
          <a-option :value="ECommon_Model_Project_Issue_Priority.LOW">{{$t('util.low')}}</a-option>
          <a-option :value="ECommon_Model_Project_Issue_Priority.MEDIUM">{{$t('util.medium')}}</a-option>
          <a-option :value="ECommon_Model_Project_Issue_Priority.HIGH">{{$t('util.high')}}</a-option>
          <a-option :value="ECommon_Model_Project_Issue_Priority.URGENT">{{$t('util.urgent')}}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('util.assigner')">
        <a-select allow-search @search="onSearchAssigner" v-model="form.assigner">
          <a-option v-for="item in assignerList" :label="item.organizationUser.nickname" :value="item.organizationUser.id">
            <a-avatar :size="24" :image-url="item.user.photo"></a-avatar>&nbsp;&nbsp;
            {{item.organizationUser.nickname}}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('util.reporter')">
        <a-select allow-search @search="onSearchReporter" v-model="form.reporter">
          <a-option v-for="item in reporterList" :label="item.organizationUser.nickname" :value="item.organizationUser.id">
            <a-avatar :size="24" :image-url="item.user.photo"></a-avatar>&nbsp;&nbsp;
            {{item.organizationUser.nickname}}
          </a-option>
        </a-select>
      </a-form-item>
	    <a-form-item :label="$t('util.manDay')" :extra="$t('help.manDay')">
		    <a-input-number v-model="form.manDay" :min="1" :max="100" :precision="0"></a-input-number>
	    </a-form-item>
    </a-form>
	  <a-divider orientation="left" v-if="valueList.length>0">{{$t("controller.app.project.issue.projectIssueCreate.customFields")}}</a-divider>
	  <a-form v-if="valueList.length>0" :model="formCustom" ref="eleFormCustom" layout="vertical">
		  <a-form-item v-for="value in valueList" :key="value.field.id" :label="value.field.name" :extra="value.field.description" :field="value.field.name" :required="!value.field.optional">
			  <FieldInput :item="value" :project-id="projectId"></FieldInput>
		  </a-form-item>
	  </a-form>
  </div>
</template>

<script setup lang="ts">

import {ECommon_Model_Project_Issue_Priority} from "../../../../../../../common/model/project_issue";
import {getCurrentInstance, onBeforeMount, reactive, ref, toRef} from "vue";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {apiFile, apiIssue, apiOrganization, apiProject} from "../../../../common/request/request";
import {
	ICommon_Route_Req_ProjectIssue_Field,
	ICommon_Route_Res_Organization_User_Item,
	ICommon_Route_Res_Workflow_Node_Field
} from "../../../../../../../common/routes/response";
import FieldInput from "../../../../common/component/field/fieldInput.vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../../../common/util/helper";
import {SessionStorage} from "../../../../common/storage/session";
import {DCSType} from "../../../../../../../common/types";
import RichEditor from "@/business/common/component/richEditor/richEditor.vue";
import {RichEditorEventHandle} from "@/business/common/component/richEditorEventHandle";
import {ECommon_Content_Line_Config_Type, ICommon_Content_Line_Config} from "../../../../../../../common/model/content";
import {DropParam, vDrop} from "@/teamOS/common/directive/drop";

const props=defineProps<{
  projectId:string
}>()
const eleForm=ref(null);
const eleFormCustom=ref(null)
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const assignerList=ref<DCSType<ICommon_Route_Res_Organization_User_Item>[]>([])
const reporterList=ref<DCSType<ICommon_Route_Res_Organization_User_Item>[]>([])
const valueList=ref<DCSType<(ICommon_Route_Res_Workflow_Node_Field & {
  fieldValue:ICommon_Route_Req_ProjectIssue_Field
})>[]>([])
const root=ref<HTMLElement>()
const appContext=getCurrentInstance().appContext
const form=reactive({
  issueTypeId:"",
  name:"",
  description:[],
  priority:ECommon_Model_Project_Issue_Priority.MEDIUM,
  assigner:"",
  reporter:"",
	manDay:1
})
const loading=ref(false)
const objEditor=ref<InstanceType<typeof RichEditor>>()
const popMenuList=ref(RichEditorEventHandle.popMenuList)
const formCustom=reactive({})
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
	    formCustom[item.field.name]=toRef(item.fieldValue,"value")
    })
  }
}

const onUploadFile=async (file, handleFunc) => {
	let res=await apiFile.upload({
		file:file
	})
	if(res?.code==0) {
		handleFunc(res.data.id,res.data.path)
	}
}

const onPopMenuClick=(type:ECommon_Content_Line_Config_Type,handleFunc:(item:ICommon_Content_Line_Config)=>void)=>{
	RichEditorEventHandle.onPopMenuClick(type,root,appContext,loading,handleFunc)
}

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

const onQuoteList=(keyword:string,handleFunc:(list:{
	value:string,
	label:string,
	photo:string
}[])=>void)=>{
	RichEditorEventHandle.onQuoteList(keyword,handleFunc)
}

const onDrop=(data?:DropParam)=>{
	RichEditorEventHandle.onDrop(objEditor,data,loading)
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
      values:valueList.value.map(item=>item.fieldValue),
	    manDay:form.manDay
    })
    if(res?.code==0) {
      if(form.description.length>0) {
        apiIssue.editDescription({
          projectIssueId:res.data.id,
          description:JSON.stringify(form.description.map(item=>{
	          return {
		          arr:item.arr
	          }
          }))
        })
      }
    }
    return res;
  },
  form:()=>{
    return [eleForm.value,eleFormCustom.value]
  }
}))
</script>

<style scoped>

</style>