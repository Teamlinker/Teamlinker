<template>
  <template v-if="!isEdit">
    <template v-if="showValue">
      <UserAvatar :organization-user-id="showValue.id" :name="showValue.name" :photo="showValue.photo" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER"></UserAvatar>
      <ProjectReleasePreview v-else-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE" :key="showValue.id" :project-release-id="showValue.id" :name="showValue.name"></ProjectReleasePreview>
      <ProjectIssuePreview :name="key+'-'+showValue.uniqueId" :project-issue-id="showValue.id" v-else-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE"></ProjectIssuePreview>
	    <BoardSprintPreview :name="showValue.name" :board-sprint-id="showValue.id" v-else-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT"></BoardSprintPreview>
    </template>
    <span v-else style="line-height: 30px;width: 100%;color: grey">{{$t("util.none")}}</span>
  </template>
  <template v-else>
    <a-space size="mini">
      <a-select v-model="editValue" allow-search @search="onSearch" allow-clear>
        <a-option v-for="item1 in searchValueList" :label="item1.name" :value="item1.id" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER" :key="item1.id"></a-option>
        <a-option v-for="item1 in searchValueList" :label="item1.name" :value="item1.id" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE" :key="item1.id"></a-option>
        <a-option v-for="item1 in searchValueList" :value="item1.id" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE" :key="item1.id">
          {{projectKey+"-"+item1.uniqueId+" "+item1.name}}
        </a-option>
	      <a-option v-for="item1 in searchValueList" :value="item1.id" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT" :key="item1.id" :label="item1.name">
		      {{item1.boardName+" -> "+item1.name}}
	      </a-option>
        <template #label="{data}" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE">
          {{data?.label.split(" ")[0]}}
        </template>
      </a-select>
      <slot :value="editValue"></slot>
    </a-space>
  </template>
</template>

<script setup lang="ts">
import {apiBoard, apiIssue, apiOrganization, apiRelease, apiUser} from "../../request/request";
import {inject, ref, watchEffect} from "vue";
import UserAvatar from "../userAvatar.vue";
import {
	ECommon_Model_Workflow_Node_Field_Type_Label_Type
} from "../../../../../../common/model/workflow_node_field_type";
import {injectProjectInfo} from "../../util/symbol";
import ProjectIssuePreview from "../../../controller/app/project/issue/projectIssuePreview.vue";
import ProjectReleasePreview from "../../../controller/app/project/release/projectReleasePreview.vue";
import {SessionStorage} from "../../storage/session";
import BoardSprintPreview from "@/business/controller/app/project/board/boardSprintPreview.vue";

const props=defineProps<{
  value?:string[],
  isEdit:boolean,
  type:ECommon_Model_Workflow_Node_Field_Type_Label_Type
}>()
const showValue=ref<{
  photo?:string,
  name?:string,
  id:string,
  uniqueId?:string
}>();
const editValue=ref("");
const key=inject(injectProjectInfo).key
const projectId=inject(injectProjectInfo).id
const projectKey=inject(injectProjectInfo).key
const searchValueList=ref<{
  photo?:string,
  name?:string,
  id:string,
  uniqueId?:string,
	boardName?:string
}[]>([])
const request=async ()=>{
  if(props.value && props.value.length>0) {
    if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER) {
      let res=await apiUser.profile({
        organizationUserId:props.value[0]
      });
      if(res?.code==0) {
        showValue.value={
          photo:res.data.info.photo,
          name:res.data.organizationUser?.nickname,
          id:res.data.organizationUser?.id
        }
        editValue.value=""
      }
    } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE) {
      let res=await apiRelease.info({
        projectReleaseId:props.value[0]
      })
      if(res?.code==0) {
        showValue.value={
          id:res.data.id,
          name:res.data.name
        }
        editValue.value=""
      }
    } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE) {
      let res=await apiIssue.basicInfo({
        projectIssueId:props.value[0]
      })
      if(res?.code==0) {
        showValue.value={
          id:res.data.id,
          uniqueId:String(res.data.unique_id)
        }
        editValue.value=""
      }
    } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT) {
	    let res = await apiBoard.sprintInfo({
		    boardSprintId:props.value[0]
	    });
	    if(res?.code==0) {
		    showValue.value={
			    id:res.data.id,
			    name:res.data.name,
		    }
		    editValue.value=""
	    }
    }
  } else {
    showValue.value=null;
    editValue.value="";
  }
}
watchEffect(()=>{
  request()
})
const onSearch=async (keyword:string)=>{
  if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER) {
    let res=await apiOrganization.listUser({
      organizationId:SessionStorage.get("organizationId"),
      keyword:keyword,
      page:0,
      size:10
    });
    if(res?.code==0) {
      searchValueList.value=res.data.data.map(item=>{
        return {
          id:item.organizationUser?.id,
          name:item.organizationUser?.nickname,
          photo:item.user.photo
        }
      })
    }
  } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE) {
    let res=await apiRelease.list({
      projectId:projectId,
      size:10,
      page:0,
      name:keyword
    })
    if(res?.code==0) {
      searchValueList.value=res.data.data.map(item=>{
        return {
          id:item.id,
          name:item.name
        }
      })
    }
  } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE) {
    let res=await apiIssue.filter({
      projectId:projectId,
      page:0,
      size:10,
      name:keyword
    })
    if(res?.code==0) {
      searchValueList.value=res.data.data.map(item=>{
        return {
          id:item.id,
          uniqueId:String(item.unique_id),
          name:item.name
        }
      })
    }
  } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT) {
	  let res=await apiBoard.filterSprint({
		  projectId:projectId,
		  page:0,
		  size:10,
		  keyword:keyword
	  })
	  if(res?.code==0) {
		  searchValueList.value=res.data.data.map(item=>{
			  return {
				  id:item.id,
				  boardName:item.board.name,
				  name:item.name
			  }
		  })
	  }
  }
}
</script>

<style scoped>

</style>