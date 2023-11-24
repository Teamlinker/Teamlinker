<template>
	<div style="width: 100%;height: 100%">
		<a-layout style="height: 100%" v-show="!windowItem.isPopup">
			<a-layout-content>
				<a-spin :loading="loading" style="height: 100%;width: 100%;">
					<a-row style="height: 100%;width: 100%;flex-direction: column" ref="contentEle" >
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
								{{screenShareInfo?.organizationUserId?organizationUserList.find(item=>item.organizationUserId===screenShareInfo.organizationUserId)?.name:speaker?.name}}
							</div>
							<template v-if="screenShareInfo">
								<audio autoplay :srcObject="screenShareInfo.audio" v-if="screenShareInfo.audio"></audio>
								<video autoplay :srcObject="screenShareInfo.video" style="width: 100%;height: 100%" v-if="screenShareInfo.video"></video>
							</template>
							<template v-else-if="speaker">
								<video autoplay :srcObject="speaker.videoStream" style="width: 100%;height: 100%" v-if="speaker.video"></video>
							</template>
						</a-row>
						<a-row style="flex: 0 0 40px;width: 100%;background-color: white">
							<MeetingOperation :current-meeting="currentMeeting" :me="me" :meeting-client="meetingClient"></MeetingOperation>
						</a-row>
					</a-row>
				</a-spin>
			</a-layout-content>
			<a-layout-sider :resize-directions="['left']" :width="250" id="meetingRight">
				<a-tabs size="mini" v-model:active-key="tabValue" style="height: 100%">
					<a-tab-pane :title="$t('util.participant')" key="participant">
						<MeetingParticipant :organization-user-list="organizationUserList" :me="me" :meeting-client="meetingClient"></MeetingParticipant>
					</a-tab-pane>
					<a-tab-pane key="chat">
						<template #title>
							<a-badge dot :count="unReadCount" :offset="[6,0]">
								{{$t("controller.app.meeting.meetingProfile.chat")}}
							</a-badge>
						</template>
						<MeetingChat :meeting-client="meetingClient" @new-message="onNewMessage" ref="meetingChat"></MeetingChat>
					</a-tab-pane>
				</a-tabs>
			</a-layout-sider>
		</a-layout>
		<div style="width: 100%;height: 100%;background-color: dimgray;" v-if="windowItem.isPopup">
			<template v-if="screenShareInfo">
				<video autoplay :srcObject="screenShareInfo.video" style="width: 100%;height: 100%" v-if="screenShareInfo.video"></video>
			</template>
			<template v-else-if="speaker">
				<video autoplay :srcObject="speaker.videoStream" style="width: 100%;height: 100%" v-if="speaker.video"></video>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {getCurrentInstance, markRaw, onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {MeetingClient} from "../../../common/component/meeting/client";
import {ECommon_Meeting_Room_Permission, ICommon_Model_Meeting_Room} from "../../../../../../common/model/meeting_room";
import {SessionStorage} from "../../../common/storage/session";
import {userTeamInfoPick} from "../../../common/component/userInfoPick";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {getCurrentNavigator, getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {Message} from "@arco-design/web-vue";
import {apiMeeting} from "../../../common/request/request";
import {OrganizationUserItem} from "./type";
import MeetingParticipant from "./meetingParticipant.vue";
import MeetingOperation from "./meetingOperation.vue";
import MeetingChat from "./meetingChat.vue";
import {Dialog} from "../../../common/component/dialog/dialog";
import MeetingPreview from "./meetingPreview.vue";
import {ECommon_Model_Organization_Member_Type} from "../../../../../../common/model/organization";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";
import {ETeamOS_Window_Status, getCurrentWindow} from "@/teamOS/window/window";
import {windowManager} from "@/teamOS/window/windowManager";

const props=defineProps<{
	meetingId:string,
	password?:string,
	inviteBusinessIds?:{
		id:string,
		type:ECommon_Model_Organization_Member_Type
	}[]
}>()
const contentEle=ref()
const loading=ref(true)
const unReadCount=ref(0)
const organizationUserList=ref<OrganizationUserItem[]>([])
const tabValue=ref("participant")
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
const {t}=useI18n()
const meetingChat=ref<InstanceType<typeof MeetingChat>>(null)
const socket=SocketIOClient.get(ECommon_Socket_Type.MEETING)
const navigator=getCurrentNavigator()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const currentMeeting=ref<DCSType<ICommon_Model_Meeting_Room>>()
const windowItem=getCurrentWindow()
const screenShareInfo=ref<{
	video:MediaStream,
	audio:MediaStream,
	organizationUserId:string
}>()
let meetingClient=new MeetingClient(socket.getSocket())
watch(()=>windowItem.status,()=>{
	if(windowItem.status===ETeamOS_Window_Status.MIN) {
		windowManager.popup(windowItem.id,"15%","20%")
	}
})
watch(tabValue,()=>{
	if(tabValue.value==="chat") {
		unReadCount.value=0
	}
})
meetingClient.onProducerStateChange=async (state, kind, businessId,type, stream, producerId) => {
  let objOrganizationUser=organizationUserList.value.find(value => value.organizationUserId===businessId)
  if(state=="new") {
		if(type==="camera" || type==="data") {
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
				objOrganizationUser=organizationUserList.value.at(-1);
			} else {
				if(kind=="video") {
					objOrganizationUser.videoStream=stream
					objOrganizationUser.video=true
				} else if(kind=="audio") {
					objOrganizationUser.audioStream=stream
					objOrganizationUser.audio=true
				}
			}
			if(!speaker.value) {
				speaker.value=objOrganizationUser
			}
		} else if(type==="screen") {
			if(!screenShareInfo.value) {
				screenShareInfo.value={
					organizationUserId:businessId,
					audio:kind==="audio"?stream:null,
					video:kind==="video"?stream:null,
				}
			} else {
				if(kind==="video") {
					screenShareInfo.value.video=stream
				} else if(kind==="audio") {
					screenShareInfo.value.audio=stream
				}
			}
		}
  } else if(state=="close") {
	  if(type==="camera" || type==="data") {
		  if(objOrganizationUser) {
			  let index=organizationUserList.value.findIndex(value => value.organizationUserId===businessId)
			  organizationUserList.value.splice(index,1)
			  if(objOrganizationUser===speaker.value) {
				  speaker.value=null
			  }
		  }
	  } else if(type==="screen") {
			screenShareInfo.value=null;
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
meetingClient.onKick=async () => {
	if(document.fullscreenElement) {
		await document.exitFullscreen()
	} else if(windowItem.isPopup) {
		windowManager.show(windowItem.id)
	}
	navigator.pop()
}
meetingClient.onJoinedRoom=async roomInfo => {
	getCurrentMeeting()
	meetingChat.value.getMessage()
	if(props.inviteBusinessIds) {
		socket.getSocket().emit("meeting_invite",props.inviteBusinessIds)
	}
}
meetingClient.onLeavedRoom=roomInfo => {

}
meetingClient.onSpeaker=async businessId => {
  let obj=organizationUserList.value.find(item=>item.organizationUserId===businessId)
	if(obj && obj.organizationUserId!==myOrganizationUserId) {
		speaker.value=obj
	}
}
meetingClient.onLocalProducerInit=async (stream) => {
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
  organizationUserList.value.unshift(me.value)
}
meetingClient.onLocalProducerStart=kind => {
  if(kind=="video" || kind=="audio") {
    handleState()
    loading.value=false
  }
}
const initMeeting=async ()=>{
	let password=props.password
	if(password==null) {
		password=await Dialog.input(root.value,appContext,t("placeholder.typeMeetingPassword"))
		if(!password) {
			Message.error(t("tip.joinMeetingFailed"))
			return
		}
	}
	let preview:any=await Dialog.open(root.value,appContext,t("controller.app.meeting.meetingProfile.meetingPreview"),markRaw(MeetingPreview))
	if(preview) {
		let ret=await meetingClient.join(props.meetingId,password,preview.enableVideo,preview.enableAudio,preview.cameraId,preview.audioId,preview.backgroundImageUri,preview.blur)
		if(!ret?.success) {
			Message.error(ret.msg)
			navigator.pop()
		}
	} else {
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

const onNewMessage=()=>{
	if(tabValue.value!=="chat") {
		unReadCount.value=1
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
:deep .arco-tabs-content {
	height: calc(100% - 36px);
}
:deep .arco-tabs-content-list {
	height: 100%;
}
:deep .arco-tabs-content-item-active {
	height: 100%;
}
:deep .arco-tabs-pane {
	height: 100%;
}
</style>