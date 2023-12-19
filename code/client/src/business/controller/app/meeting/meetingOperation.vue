<template>
	<a-row style="width: 100%;height: 100%;display: flex;align-items: center;justify-content: space-between;padding:0 5px;box-sizing: border-box" ref="operationEle">
		<a-space>
			<a-button size="large" type="text" v-if="me" @click="onToggleAudio">
				<template #icon>
					<sicon size="20" color="" name="Ant" type="audio" v-if="me.audio"></sicon>
					<sicon size="20" color="gray" name="Ant" type="audio static" v-else></sicon>
				</template>
			</a-button>
			<a-button size="large" type="text" v-if="me" @click="onToggleVideo">
				<template #icon>
					<sicon size="20" color="" name="Ant" type="video" v-if="me.video"></sicon>
					<sicon size="20" color="gray" name="Ant" type="video-mute" v-else></sicon>
				</template>
			</a-button>
		</a-space>
		<a-space>
			<a-popover :popup-container="root">
				<a-button size="large" type="text">
					<template #icon>
						<sicon size="20" color="" name="Ant" type="add user"></sicon>
					</template>
				</a-button>
				<template #content>
					<a-descriptions :title="$t('controller.app.meeting.meetingOperation.meetingInfo')" :data="[
									{
										label:'Meeting Id',
										value:currentMeeting.id
									},
									{
										label:'Password',
										value:currentMeeting.password
									}
								]" v-if="currentMeeting"></a-descriptions>
					<a-divider :margin="10"></a-divider>
					<a-form :model="form" auto-label-width>
						<a-form-item field="memberIds" :label="$t('util.invite')" required>
							<a-select style="width: 100%" :placeholder="$t('placeholder.typeUserOrTeam')" multiple allow-search allow-clear v-model="form.memberIds" @search="onSearch" :popup-container="root">
								<a-optgroup :label="$t('util.team')" v-if="selectList && selectList.teams && selectList.teams.length>0">
									<a-option v-for="item in selectList.teams" :value="item.id">
										<a-row style="align-items: center">
											<a-avatar :image-url="item.photo" :size="24"></a-avatar>&nbsp;
											{{item.name}}
										</a-row>
									</a-option>
								</a-optgroup>
								<a-optgroup :label="$t('util.user')" v-if="selectList && selectList.users && selectList.users.length>0">
									<a-option v-for="item in selectList.users" :value="item.id">
										<a-row style="align-items: center">
											<a-avatar :image-url="item.photo" :size="24"></a-avatar>&nbsp;
											{{item.name}}
										</a-row>
									</a-option>
								</a-optgroup>
							</a-select>
						</a-form-item>
						<a-form-item>
							<a-button html-type="button" type="primary" @click="onInvite()">{{$t("util.invite")}}</a-button>
						</a-form-item>
					</a-form>
				</template>
			</a-popover>
			<a-button size="large" type="text" @click="onToggleScreen">
				<template #icon>
					<sicon size="20" color="" name="Ant" type="desktop" v-if="!isScreen"></sicon>
					<sicon size="20" color="red" name="Ant" type="desktop" v-else></sicon>
				</template>
			</a-button>
			<a-button type="text" @click="isFullScreen=!isFullScreen">
				<template #icon>
					<sicon size="20" color="" name="Ant" type="fullscreen" v-if="!isFullScreen"></sicon>
					<sicon size="20" color="" name="Ant" type="fullscreen-exit" v-else></sicon>
				</template>
			</a-button>
		</a-space>
		<a-space>
			<a-button size="mini" type="primary" @click="onLeave">
				{{$t("util.leave")}}
			</a-button>
			<a-button size="mini" type="primary" status="danger" v-if="me?.permission===ECommon_Meeting_Room_Permission.PRESENTER" @click="onEnd">
				{{$t("util.end")}}
			</a-button>
		</a-space>
	</a-row>
</template>


<script setup lang="ts">
import {ECommon_Meeting_Room_Permission, ICommon_Model_Meeting_Room} from "../../../../../../common/model/meeting_room";
import {OrganizationUserItem} from "./type";
import {apiOrganization} from "../../../common/request/request";
import {Dialog} from "../../../common/component/dialog/dialog";
import {Message} from "@arco-design/web-vue";
import {getCurrentNavigator, getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {MeetingClient} from "../../../common/component/meeting/client";
import {getCurrentInstance, onBeforeMount, onBeforeUnmount, reactive, ref, watch} from "vue";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {ICommon_Route_Res_Organization_FilterUserAndTeam} from "../../../../../../common/routes/response";
import {ECommon_Model_Organization_Member_Type} from "../../../../../../common/model/organization";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";
import {EClient_EVENTBUS_TYPE, eventBus} from "@/business/common/event/event";
import Sicon from "@/icon/sicon.vue";

const props=defineProps<{
	me:OrganizationUserItem,
	currentMeeting:DCSType<ICommon_Model_Meeting_Room>,
	meetingClient:MeetingClient
}>()
const form=reactive({
	memberIds:[]
})
const isFullScreen=ref(false)
const operationEle=ref()
const selectList=ref<ICommon_Route_Res_Organization_FilterUserAndTeam>()
const navigator=getCurrentNavigator()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const socket=SocketIOClient.getSocket(ECommon_Socket_Type.MEETING).getSocket()
let isScreen=ref(false)
const {t}=useI18n()
props.meetingClient.onScreenStopped=() => {
	isScreen.value=false
}

watch(isFullScreen,()=>{
	if(isFullScreen.value) {
		root.value.requestFullscreen()
	} else {
		document.exitFullscreen()
	}
})

const onToggleAudio=()=>{
	if(props.me.audio) {
		props.meetingClient.pause("audio")
		props.me.audio=false
	} else {
		props.meetingClient.resume("audio")
		props.me.audio=true
	}
}

const onToggleVideo=()=>{
	if(props.me.video) {
		props.meetingClient.pause("video")
		props.me.video=false
	} else {
		props.meetingClient.resume("video")
		props.me.video=true
	}
}

const onLeave=async ()=>{
	let ret=await Dialog.confirm(document.fullscreenElement?operationEle.value.$el.parentElement:root.value,appContext,t("tip.leaveMeeting"))
	if(ret) {
		await props.meetingClient.leave()
		if(isFullScreen.value) {
			await document.exitFullscreen()
		}
		navigator.pop()
	}
}

const onEnd=async ()=>{
	let ret=await Dialog.confirm(document.fullscreenElement?operationEle.value.$el.parentElement:root.value,appContext,t("tip.endMeeting"))
	if(ret) {
		let res=await props.meetingClient.end()
		if(res) {
			if(isFullScreen.value) {
				await document.exitFullscreen()
			}
			navigator.pop()
		} else {
			Message.error(t("tip.operationFailed"))
		}
	}
}

const onSearch=async (keyword:string)=>{
	if(!keyword) {
		return
	}
	let ret=await apiOrganization.filterAvailableUserAndTeam({
		keyword:keyword,
		exceptMe:1
	})
	if(ret?.code==0) {
		selectList.value=ret.data
	}
}

const onInvite=async (inviteBusinessIds?:{
	id:string,
	type:ECommon_Model_Organization_Member_Type
}[])=>{
	if(inviteBusinessIds?.length>0) {
		socket.emit("meeting_invite",inviteBusinessIds)
	} else if(form.memberIds.length>0) {
		socket.emit("meeting_invite",form.memberIds.map(item=>{
			return {
				id:item,
				type:selectList.value.users.map(item=>item.id).includes(item)?ECommon_Model_Organization_Member_Type.USER:ECommon_Model_Organization_Member_Type.TEAM
			}
		}))
		form.memberIds=[]
	}
}

const onToggleScreen=async ()=>{
	if(!isScreen.value) {
		let ret=await props.meetingClient.startShare()
		if(ret===false) {
			Message.error(t("tip.cannotShare"))
		} else if(ret===true) {
			isScreen.value=true
		}
	} else {
		props.meetingClient.stopShare()
		isScreen.value=false
	}
}

onBeforeMount(()=>{
	eventBus.on(EClient_EVENTBUS_TYPE.MEETING_INVITE,onInvite)
})

onBeforeUnmount(()=>{
	eventBus.off(EClient_EVENTBUS_TYPE.MEETING_INVITE,onInvite)
})

</script>

<style scoped>

</style>