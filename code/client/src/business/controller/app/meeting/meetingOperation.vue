<template>
	<a-row style="width: 100%;height: 100%;display: flex;align-items: center;justify-content: space-between;padding:0 5px;box-sizing: border-box">
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
		<a-popover>
			<a-button size="large" type="text">
				<template #icon>
					<sicon size="20" color="" name="Ant" type="add user"></sicon>
				</template>
			</a-button>
			<template #content>
				<a-descriptions title="Meeting Info" :data="[
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
					<a-form-item field="userIds" label="Users" required>
						<a-select multiple allow-clear allow-search v-model="form.userIds" @search="onSearch">
							<a-option v-for="item in organizationUserList" :key="item.organizationUserId" :label="item.name" :value="item.organizationUserId"></a-option>
						</a-select>
					</a-form-item>
					<a-form-item>
						<a-button html-type="button" type="primary" @click="onInvite">Invite</a-button>
					</a-form-item>
				</a-form>
			</template>
		</a-popover>
		<a-space>
			<a-button size="mini" type="primary" @click="onLeave">
				Leave
			</a-button>
			<a-button size="mini" type="primary" status="danger" v-if="me?.permission===ECommon_Meeting_Room_Permission.PRESENTER" @click="onEnd">
				End
			</a-button>
		</a-space>
	</a-row>
</template>


<script setup lang="ts">
import {ECommon_Meeting_Room_Permission, ICommon_Model_Meeting_Room} from "../../../../../../common/model/meeting_room";
import {OrganizationUserItem} from "./type";
import {apiOrganization, DCSType} from "../../../common/request/request";
import {Dialog} from "../../../common/component/dialog/dialog";
import {Message} from "@arco-design/web-vue";
import {getCurrentNavigator, getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {MeetingClient} from "../../../common/component/meeting/client";
import {getCurrentInstance, reactive, ref} from "vue";
import {SessionStorage} from "../../../common/storage/session";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";

const props=defineProps<{
	me:OrganizationUserItem,
	currentMeeting:DCSType<ICommon_Model_Meeting_Room>,
	meetingClient:MeetingClient
}>()
const form=reactive({
	userIds:[]
})
const organizationUserList=ref<{
	organizationUserId:string,
	name:string
}[]>([])
const navigator=getCurrentNavigator()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const socket=SocketIOClient.getSocket(ECommon_Socket_Type.MEETING).getSocket()
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
	let ret=await Dialog.confirm(root.value,appContext,"Do you leave this meeting?")
	if(ret) {
		await props.meetingClient.leave()
		navigator.pop()
	}
}

const onEnd=async ()=>{
	let ret=await Dialog.confirm(root.value,appContext,"Do you end this meeting?")
	if(ret) {
		let res=await props.meetingClient.end()
		if(res) {
			navigator.pop()
		} else {
			Message.error("operation failed")
		}
	}
}

const onSearch=async (keyword:string)=>{
	let res=await apiOrganization.listUser({
		keyword,
		page:0,
		size:10,
		organizationId:SessionStorage.get("organizationId")
	})
	if(res?.code==0) {
		organizationUserList.value=res.data.data.map(item=>{
			return {
				name:item.organizationUser.nickname,
				organizationUserId:item.organizationUser.id
			}
		})
	}
}

const onInvite=async()=>{
	if(form.userIds.length>0) {
		socket.emit("meeting_invite",form.userIds)
		form.userIds=[]
	}
}
</script>

<style scoped>

</style>