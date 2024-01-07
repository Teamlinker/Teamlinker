<template>
  <a-popover position="left" :content-style="{backgroundColor:'rgb(249,249,249)',padding:'0px'}" :id="'popover'+projectIssueId" @popup-visible-change="onPopup">
    <a-link href="javascript:void(0)">{{name}}</a-link>
    <template #content>
      <a-row style="width: 300px;padding: 10px">
        <a-row style="color: gray;width: 100%">
          {{info?.project.keyword+"-"+info?.unique_id}}&nbsp;
          <a-tag color="gray" v-if="info?.workflowNode.status===ECommon_Model_Workflow_Node_Status.NOTSTART">{{$t("util.notStart")}}</a-tag>
          <a-tag color="blue" v-else-if="info?.workflowNode.status===ECommon_Model_Workflow_Node_Status.INPROGRESS">{{$t("util.inProgress")}}</a-tag>
          <a-tag color="green" v-else-if="info?.workflowNode.status===ECommon_Model_Workflow_Node_Status.DONE">{{$t("util.done")}}</a-tag>
        </a-row>
        <a-row style="font-weight: bold;width: 100%;margin-top: 10px">
          {{info?.name}}
        </a-row>
        <a-row style="width: 100%;margin-top: 15px">
          <a-col :span="12">
            <template v-if="info?.assigner_id">
	            {{$t("util.assigner")}}&nbsp;&nbsp;
              <a-avatar :image-url="info?.assigner_id.photo" :size="20"></a-avatar>&nbsp;
              {{info?.assigner_id.nickname}}
            </template>
          </a-col>
          <a-col :span="12">
            <template v-if="info?.reporter_id">
	            {{$t("util.reporter")}}&nbsp;&nbsp;
              <a-avatar :image-url="info?.reporter_id.photo" :size="20"></a-avatar>&nbsp;
              {{info?.reporter_id.nickname}}
            </template>
          </a-col>
        </a-row>
        <a-row style="width: 100%;margin-top: 15px">
          <a-col :span="8">
            {{info?.issueType.name}}
          </a-col>
          <a-col :span="8">
            <FieldPriority :priority="info?.priority" v-if="info"></FieldPriority>
          </a-col>
          <a-col :span="8">
            <a-button type="outline" size="mini" style="margin-left: 20px" @click="onProfile">{{$t("util.profile")}}</a-button>
          </a-col>
        </a-row>
      </a-row>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {apiIssue} from "../../../../common/request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {ICommon_Route_Res_ProjectIssue_BasicInfo} from "../../../../../../../common/routes/response";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import FieldPriority from "../../../../common/component/field/fieldPriority.vue";
import {DCSType} from "../../../../../../../common/types";


const loading=ref(true)
const props=defineProps<{
  projectIssueId:string
  name:string
}>()
const root=ref(null);
const info=ref<DCSType<ICommon_Route_Res_ProjectIssue_BasicInfo>>(null)
const onProfile=()=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,info.value.project.id,props.projectIssueId);
  let ele=document.getElementById("popover"+props.projectIssueId)
  ele.parentElement.removeChild(ele);
}
const onPopup=async (visible:boolean)=>{
  if(!info.value && visible) {
    let res=await apiIssue.basicInfo({
      projectIssueId:props.projectIssueId
    })
    if(res?.code==0) {
      info.value=res.data
      loading.value=false
    }
  }
}
</script>

<style scoped>

</style>