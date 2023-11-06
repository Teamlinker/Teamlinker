<template>
  <a-popover position="left" :content-style="{backgroundColor:'rgb(249,249,249)',padding:'0px'}" :id="'popover'+projectReleaseId" @popup-visible-change="onPopup">
    <a-link href="javascript:void(0)">{{name}}</a-link>
    <template #content>
      <a-row style="width: 250px;padding: 10px">
        <a-row style="color: gray;width: 100%">
          <a-space size="large">
            <span style="font-weight: bold">
              {{info?.name}}
            </span>
            <a-tag color="gray" v-if="info?.status===ECommon_Model_Project_Release_Status.ARCHIVED">{{$t("util.archived")}}</a-tag>
            <a-tag color="blue" v-else-if="info?.status===ECommon_Model_Project_Release_Status.UNRELEASE">{{$t("util.unReleased")}}</a-tag>
            <a-tag color="green" v-else-if="info?.status===ECommon_Model_Project_Release_Status.RELEASE">{{$t("util.released")}}</a-tag>
          </a-space>
        </a-row>
        <a-row style="width: 100%;margin-top: 10px">
          <a-space>
            <icon-calendar></icon-calendar>
            {{info?.start_time}}
            &nbsp;-&nbsp;
            <icon-calendar></icon-calendar>
            {{info?.release_time}}
          </a-space>
        </a-row>
        <a-row style="width: 100%;margin-top: 10px">
          <a-col :span="16">
            <span v-if="info?.notstart+info?.inprogress+info?.done==0">
              {{$t("controller.app.project.release.projectReleaseList.noIssues")}}
            </span>
            <a-progress v-else :percent="Number((info?.done/(info?.notstart+info?.inprogress+info?.done)).toFixed(2))" style="width: 100%" color="green"></a-progress>
          </a-col>
          <a-col :span="8" style="text-align: center">
            <a-button type="outline" size="mini" @click="onProfile">{{$t("util.profile")}}</a-button>
          </a-col>
        </a-row>
      </a-row>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {apiRelease} from "../../../../common/request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {ICommon_Route_Res_Release_Info} from "../../../../../../../common/routes/response";
import {ECommon_Model_Project_Release_Status} from "../../../../../../../common/model/project_release";
import {DCSType} from "../../../../../../../common/types";


const loading=ref(true)
const props=defineProps<{
  projectReleaseId:string
  name:string
}>()
const root=ref(null);
const info=ref<DCSType<ICommon_Route_Res_Release_Info>>(null)
const onProfile=()=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,info.value.project_id,props.projectReleaseId);
  let ele=document.getElementById("popover"+props.projectReleaseId)
  ele.parentElement.removeChild(ele);
}
const onPopup=async (visible:boolean)=>{
  if(!info.value && visible) {
    let res=await apiRelease.info({
      projectReleaseId:props.projectReleaseId
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