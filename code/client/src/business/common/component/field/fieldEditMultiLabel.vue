<template>
  <template v-if="!isEdit">
    <a-space wrap v-if="showValue && showValue.length>0">
      <UserAvatar v-for="value in showValue" :organization-user-id="value.id" :name="value.name" :photo="value.photo" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER" :key="value.id"></UserAvatar>
      <ProjectReleasePreview v-else-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE" v-for="value in showValue" :key="value.id" :project-release-id="value.id" :name="value.name"></ProjectReleasePreview>
      <ProjectIssuePreview v-for="value in showValue" :key="value.id" :name="key+'-'+value.uniqueId" :project-issue-id="value.id" v-else-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE"></ProjectIssuePreview>
	    <BoardSprintPreview v-for="value in showValue" :name="value.name" :board-sprint-id="value.id" v-else-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT"></BoardSprintPreview>
    </a-space>
    <span v-else style="line-height: 30px;width: 100%;color: grey">{{$t("util.none")}}</span>
  </template>
  <template v-else>
    <a-space size="mini" wrap>
      <a-tag v-for="(value,index) in editValue" :closable="true" @close="onClose(index)" :key="value.id">
        <template v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER || type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE || type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT">
          {{value.name}}
        </template>
        <template v-else-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE">
          {{key+"-"+value.uniqueId}}
        </template>
      </a-tag>
      <a-select v-model="addValue" allow-search @search="onSearch" v-if="showInput" @change="onChange">
        <a-option v-for="item1 in searchValueList" :label="item1.name" :value="item1.id" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER"></a-option>
        <a-option v-for="item1 in searchValueList" :label="item1.name" :value="item1.id" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE"></a-option>
        <a-option v-for="item1 in searchValueList" :value="item1.id" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE">
          {{projectKey+"-"+item1.uniqueId+" "+item1.name}}
        </a-option>
	      <a-option v-for="item1 in searchValueList" :label="item1.name" :value="item1.id" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT">
		      {{item1.boardName+" -> "+item1.name}}
	      </a-option>
        <template #label="{data}" v-if="type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE">
          {{data?.label.split(" ")[0]}}
        </template>
      </a-select>
      <a-tag v-else :style="{backgroundColor: 'var(--color-fill-2)',border: '1px dashed var(--color-fill-3)',cursor: 'pointer',}" @click="showInput=true">
        <template #icon>
          <icon-plus />
        </template>
	      {{$t("util.add")}}
      </a-tag>
      <slot :value="commitValue"></slot>
    </a-space>
  </template>
</template>

<script setup lang="ts">
import {apiBoard, apiIssue, apiOrganization, apiRelease, apiUser} from "../../request/request";
import {computed, inject, ref, watchEffect} from "vue";
import {
	ECommon_Model_Workflow_Node_Field_Type_Label_Type
} from "../../../../../../common/model/workflow_node_field_type";
import {injectProjectInfo} from "../../util/symbol";
import UserAvatar from "../userAvatar.vue";
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
}[]>([]);
const editValue=ref<{
  photo?:string,
  name?:string,
  id:string,
  uniqueId?:string
}[]>([]);
const commitValue=computed(()=>{
  return editValue.value.map(item=>item.id)
})
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
const addValue=ref("")
const showInput = ref(false);
const request=async ()=>{
  if(props.value && props.value.length>0) {
    if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER) {
      let arr=[]
      for(let obj of props.value) {
        arr.push(apiUser.profile({
          organizationUserId:obj
        }))
      }
      let resArr=await Promise.all(arr);
      for(let i=0;i<resArr.length;i++) {
        let res=resArr[i]
        if(res?.code==0) {
          showValue.value[i]={
            photo:res.data.info.photo,
            name:res.data.organizationUser?.nickname,
            id:res.data.organizationUser?.id
          }
          editValue.value[i]={...showValue.value[i]}
        }
      }
    } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE) {
      let arr=[]
      for(let obj of props.value) {
        arr.push(apiRelease.info({
          projectReleaseId:obj
        }))
      }
      let resArr=await Promise.all(arr);
      for(let i=0;i<resArr.length;i++) {
        let res=resArr[i]
        if(res?.code==0) {
          showValue.value[i]={
            id:res.data.id,
            name:res.data.name
          }
          editValue.value[i]={...showValue.value[i]}
        }
      }
    } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE) {
      let arr=[]
      for(let obj of props.value) {
        arr.push(apiIssue.basicInfo({
          projectIssueId:obj
        }))
      }
      let resArr=await Promise.all(arr);
      for(let i=0;i<resArr.length;i++) {
        let res=resArr[i]
        if(res?.code==0) {
          showValue.value[i]={
            id:res.data.id,
            uniqueId:String(res.data.unique_id)
          }
          editValue.value[i]={...showValue.value[i]}
        }
      }
    } else if(props.type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT) {
	    let arr=[]
	    for(let obj of props.value) {
		    arr.push(apiBoard.sprintInfo({
			    boardSprintId:obj
		    }))
	    }
	    let resArr=await Promise.all(arr);
	    for(let i=0;i<resArr.length;i++) {
		    let res=resArr[i]
		    if(res?.code==0) {
			    showValue.value[i]={
				    id:res.data.id,
				    name:res.data.name
			    }
			    editValue.value[i]={...showValue.value[i]}
		    }
	    }
    }
  } else {
    showValue.value=[]
    editValue.value=[]
  }
}
watchEffect(()=>{
  request()
})
const onChange=()=>{
  showInput.value=false
  editValue.value=[...editValue.value,searchValueList.value.find(item=>{
    if(item.id==addValue.value) {
      return true
    }
  })]
  addValue.value=""
}
const onClose=(index:number)=>{
  editValue.value.splice(index,1)
}
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
          id:item.organizationUser.id,
          name:item.organizationUser.nickname,
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
          uniqueId:String(item.unique_id)
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
				  name:item.name,
				  boardName:item.board.name
			  }
		  })
	  }
  }
}
</script>

<style scoped>

</style>