<template>
  <a-layout style="height: 100%">
    <a-layout-content>
      <a-spin :loading="loading" style="height: 100%;width: 100%;">
        <a-row style="height: 100%;width: 100%;flex-direction: column">
          <a-row style="flex: 0 0 130px;width: 100%;display: flex;align-items: center;overflow-x: auto;overflow-y:hidden;background-color: dimgray" id="meetingPresent">
            <div v-for="item in organizationUserList" :key="item.organizationUserId" style="flex: 0 0 250px;height: 100%;overflow: hidden;border: 1px solid black;background-color: black;position: relative">
              <div style="position:absolute;bottom: 0;left: 0;color: white ">
                {{item.name}}
              </div>
              <template v-if="item.organizationUserId===myOrganizationUserId">
                <video autoplay muted :srcObject="item.videoStream" style="width: 100%;height: 100%" v-if="item.video"></video>
              </template>
              <template v-else>
                <audio autoplay :srcObject="item.audioStream" v-if="item.audio"></audio>
                <video autoplay :srcObject="item.videoStream" style="width: 100%;height: 100%" v-if="item.video"></video>
              </template>
            </div>
          </a-row>
          <a-row style="flex:1 1 calc(100% - 170px);width: 100%;overflow: hidden;display: flex;justify-content: center;background-color: dimgray;position: relative">
            <div style="position:absolute;bottom: 0;left: 0;color: white;font-size: 20px">
              {{speaker?.name}}
            </div>
            <template v-if="speaker?.organizationUserId===myOrganizationUserId">
              <video autoplay muted :srcObject="speaker.videoStream" style="width: 100%;height: 100%" v-if="speaker.video"></video>
            </template>
            <template v-else-if="speaker">
              <audio autoplay :srcObject="speaker.audioStream" v-if="speaker.audio"></audio>
              <video autoplay :srcObject="speaker.videoStream" style="width: 100%;height: 100%" v-if="speaker.video"></video>
            </template>
          </a-row>
          <a-row style="flex: 0 0 40px;width: 100%">
            <MeetingOperation :current-meeting="currentMeeting" :me="me" :meeting-client="meetingClient"></MeetingOperation>
          </a-row>
        </a-row>
      </a-spin>
    </a-layout-content>
    <a-layout-sider :resize-directions="['left']" :width="250" id="meetingRight">
	    <a-tabs size="mini">
		    <a-tab-pane title="participant">
			    <MeetingParticipant :organization-user-list="organizationUserList" :me="me" :meeting-client="meetingClient"></MeetingParticipant>
		    </a-tab-pane>
	    </a-tabs>
    </a-layout-sider>
  </a-layout>
</template>

<script setup lang="ts">
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {getCurrentInstance, onBeforeMount, onBeforeUnmount, ref} from "vue";
import {MeetingClient} from "../../../common/component/meeting/client";
import {ECommon_Meeting_Room_Permission, ICommon_Model_Meeting_Room} from "../../../../../../common/model/meeting_room";
import {SessionStorage} from "../../../common/storage/session";
import {userTeamInfoPick} from "../../../common/component/userInfoPick";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {getCurrentNavigator, getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {Message} from "@arco-design/web-vue";
import {apiMeeting, DCSType} from "../../../common/request/request";
import {OrganizationUserItem} from "./type";
import MeetingParticipant from "./meetingParticipant.vue";
import MeetingOperation from "./meetingOperation.vue";

const props=defineProps<{
    meetingId:string,
    password:string
}>()
const loading=ref(true)

const organizationUserList=ref<OrganizationUserItem[]>([])

const speaker=ref<OrganizationUserItem>()
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const me=ref<OrganizationUserItem>({
	organizationUserId:myOrganizationUserId,
	name:"",
	permission:ECommon_Meeting_Room_Permission.NORMAL,
	audioStream:null,
	videoStream:null,
	video:true,
	audio:true
})
const socket=SocketIOClient.get(ECommon_Socket_Type.MEETING)
const navigator=getCurrentNavigator()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const currentMeeting=ref<DCSType<ICommon_Model_Meeting_Room>>()
let meetingClient=new MeetingClient(socket.getSocket())
meetingClient.onProducerStateChange=async (state, kind, businessId, stream, producerId) => {
  let objOrganizationUser=organizationUserList.value.find(value => value.organizationUserId===businessId)
  if(state=="new") {
    if(!objOrganizationUser) {
      let obj=userTeamInfoPick.getInfos([{
        id:businessId,
        type:ECommon_IM_Message_EntityType.USER
      }])
      organizationUserList.value.push({
        organizationUserId:businessId,
        name:obj[businessId]?obj[businessId].name:"",
        permission:ECommon_Meeting_Room_Permission.NORMAL,
        audioStream:kind==="audio"?stream:null,
        videoStream:kind==="video"?stream:null,
        audio:kind==="audio"?true:false,
        video:kind==="video"?true:false,
      })
    } else {
      if(kind=="video") {
        objOrganizationUser.videoStream=stream
        objOrganizationUser.video=true
      } else if(kind=="audio") {
        objOrganizationUser.audioStream=stream
        objOrganizationUser.audio=true
      }
    }
  } else if(state=="close") {
    if(objOrganizationUser) {
      let index=organizationUserList.value.findIndex(value => value.organizationUserId===businessId)
      organizationUserList.value.splice(index,1)
	    if(objOrganizationUser===speaker.value) {
				speaker.value=null
	    }
    }
  } else if(state=="pause") {
    if(objOrganizationUser) {
      if(kind=="video") {
        objOrganizationUser.video=false
      } else if(kind=="audio") {
        objOrganizationUser.audio=false
      }
    }
  } else if(state=="resume") {
    if(objOrganizationUser) {
      if(kind=="video") {
        objOrganizationUser.video=true
      } else if(kind=="audio") {
        objOrganizationUser.audio=true
      }
    }
  }
  handleState()
}
meetingClient.onKick=() => {
	navigator.pop()
}
meetingClient.onJoinedRoom=async roomInfo => {
	getCurrentMeeting()
}
meetingClient.onLeavedRoom=roomInfo => {

}
meetingClient.onSpeaker=async businessId => {
  speaker.value=organizationUserList.value.find(item=>item.organizationUserId===businessId)
}
meetingClient.onLocalProducerInit=async stream => {
  let obj=userTeamInfoPick.getInfos([{
    id:myOrganizationUserId,
    type:ECommon_IM_Message_EntityType.USER
  }])
  me.value={
    organizationUserId:myOrganizationUserId,
    name:obj[myOrganizationUserId]?obj[myOrganizationUserId].name:"",
    permission:ECommon_Meeting_Room_Permission.NORMAL,
    audioStream:stream,
    videoStream:stream,
    video:true,
    audio:true
  }
  organizationUserList.value.push(me.value)
}
meetingClient.onLocalProducerStart=kind => {
  if(kind=="video") {
    handleState()
    loading.value=false
  }
}
const initMeeting=async ()=>{
	let ret=await meetingClient.join(props.meetingId,props.password)
	if(!ret?.success) {
		Message.error(ret.msg)
		navigator.pop()
	}
}

const handleState=async ()=>{
  let [retState,retPermission]=await Promise.all([
    meetingClient.states(),
    socket.getSocket().emitWithAck("meeting_get_presenters")
  ])
  for(let obj of organizationUserList.value) {
    if(retPermission[obj.organizationUserId]) {
      obj.permission=retPermission[obj.organizationUserId]
    }
  }
  for(let objState of retState) {
    for(let objOrganizationUser of organizationUserList.value) {
      if (objState.businessId===objOrganizationUser.organizationUserId) {
        objOrganizationUser.video=objState.kinds["video"]
        objOrganizationUser.audio=objState.kinds["audio"]
      }
    }
  }
}

const handleUserInfo = (id: string, info: {
  id: string,
  name: string,
  photo: string
}) => {
  for(let obj of organizationUserList.value) {
    if(obj.organizationUserId==id) {
      obj.name=info.name;
    }
  }
}

const onPresenterChange=async (organizationUserId, permission) => {
  let obj=organizationUserList.value.find(item=>item.organizationUserId===organizationUserId)
  if(obj) {
    obj.permission=permission
  }
}


const getCurrentMeeting=async ()=>{
	let res=await apiMeeting.getCurrentRoom()
	if(res?.code==0) {
		currentMeeting.value=res.data
	}
}

const handleLeaveMeeting=async ()=>{
	await meetingClient.leave()
	navigator.pop()
}

onBeforeMount(()=>{
  eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
	eventBus.on(EClient_EVENTBUS_TYPE.LEAVE_MEETING,  handleLeaveMeeting)
  socket.getSocket().on("meeting_presenter_change", onPresenterChange)
  initMeeting()
})

onBeforeUnmount(()=>{
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
	eventBus.off(EClient_EVENTBUS_TYPE.LEAVE_MEETING,  handleLeaveMeeting)
	socket.getSocket().off("meeting_presenter_change", onPresenterChange)
  if(meetingClient.getRoomInfo()) {
    meetingClient.leave()
  }
})
</script>


<style scoped>
#meetingPresent :first-child {
  margin-left: auto;
}
#meetingPresent :last-child {
  margin-right: auto;
}
#meetingRight :deep .arco-tabs-content {
	padding-top: 0px;
}
#meetingRight :deep .arco-list-item {
	padding: 5px 10px!important;
}
#meetingRight :deep .arco-list-item .arco-list-item-action > li:not(:last-child) {
	margin-right: 5px;
}
</style>