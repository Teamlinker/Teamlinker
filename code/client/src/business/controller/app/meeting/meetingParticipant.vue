<template>
	<a-list :bordered="false">
		<a-list-item v-for="item in organizationUserList">
			<a-list-item-meta>
				<template #title>
					{{item.name}}
				</template>
			</a-list-item-meta>
			<template #actions v-if="item.organizationUserId!==myOrganizationUserId">
				<a-button size="mini" type="text" :disabled="me.permission!==ECommon_Meeting_Room_Permission.PRESENTER" @click="onToggleAudio(item)">
					<template #icon>
						<sicon size="15" color="rgb(22, 93, 255)" name="Ant" type="audio" v-if="item.audio"></sicon>
						<sicon size="15" color="gray" name="Ant" type="audio static" v-else></sicon>
					</template>
				</a-button>
				<a-button size="mini" type="text" :disabled="me.permission!==ECommon_Meeting_Room_Permission.PRESENTER" @click="onToggleVideo(item)">
					<template #icon>
						<sicon size="15" color="rgb(22, 93, 255)" name="Ant" type="video" v-if="item.video"></sicon>
						<sicon size="15" color="gray" name="Ant" type="video-mute" v-else></sicon>
					</template>
				</a-button>
				<a-button size="mini" type="text" v-if="me.permission===ECommon_Meeting_Room_Permission.PRESENTER">
					<template #icon>
						<sicon size="15" color="red" name="Ant" type="delete user" @click="onKick(item)"></sicon>
					</template>
				</a-button>
				<a-button size="mini" type="text" v-if="me.permission===ECommon_Meeting_Room_Permission.PRESENTER" @click="onTogglePresenter(item)">
					<template #icon>
						<sicon size="15" color="rgb(22, 93, 255)" name="Ant" type="admin" v-if="item.permission===ECommon_Meeting_Room_Permission.PRESENTER" :title="$t('controller.app.meeting.meetingParticipant.presenter')"></sicon>
						<sicon size="15" color="gray" name="Ant" type="user" v-else></sicon>
					</template>
				</a-button>
			</template>
			<template #actions v-else>
				<a-button size="mini" type="text" :disabled="true">
					<template #icon>
						<sicon size="15" color="rgb(22, 93, 255)" name="Ant" type="admin" v-if="me.permission===ECommon_Meeting_Room_Permission.PRESENTER" :title="$t('controller.app.meeting.meetingParticipant.presenter')"></sicon>
						<sicon size="15" color="gray" name="Ant" type="user" v-else></sicon>
					</template>
				</a-button>
			</template>
		</a-list-item>
	</a-list>
</template>


<script setup lang="ts">
import {ECommon_Meeting_Room_Permission} from "../../../../../../common/model/meeting_room";
import {OrganizationUserItem} from "./type";
import {SessionStorage} from "../../../common/storage/session";
import {Dialog} from "../../../common/component/dialog/dialog";
import {getCurrentNavigator, getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {getCurrentInstance} from "vue";
import {MeetingClient} from "../../../common/component/meeting/client";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {useI18n} from "vue-i18n";

const props=defineProps<{
	organizationUserList:OrganizationUserItem[],
	me:OrganizationUserItem,
	meetingClient:MeetingClient
}>()
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const navigator=getCurrentNavigator()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const {t}=useI18n()
const socket=SocketIOClient.getSocket(ECommon_Socket_Type.MEETING).getSocket()
const onKick=async (item:OrganizationUserItem)=>{
	let ret=await Dialog.confirm(root.value,appContext,`${t("tip.kick")}${item.name}?`)
	if(ret) {
		props.meetingClient.kick(item.organizationUserId)
	}
}

const onTogglePresenter=async (item:OrganizationUserItem)=>{
	let promote=item.permission===ECommon_Meeting_Room_Permission.NORMAL;
	let ret=await Dialog.confirm(root.value,appContext,`${t("tip.doYouWant")}${promote?`${t("tip.promote")}${item.name}${t("tip.toPresenter")}`:`${t("tip.demote")}${item.name}${t("tip.toNormalMember")}`}?`)
	if(ret) {
		if(promote) {
			let ret=await socket.emitWithAck("meeting_change_presenter",item.organizationUserId,ECommon_Meeting_Room_Permission.PRESENTER)
		} else {
			let ret=await socket.emitWithAck("meeting_change_presenter",item.organizationUserId,ECommon_Meeting_Room_Permission.NORMAL)
		}
	}
}

const onToggleAudio=async(item:OrganizationUserItem)=>{
	if(item.audio) {
		props.meetingClient.mute("audio",item.organizationUserId)
	} else {
		props.meetingClient.unmute("audio",item.organizationUserId)
	}
}

const onToggleVideo=async(item:OrganizationUserItem)=>{
	if(item.video) {
		props.meetingClient.mute("video",item.organizationUserId)
	} else {
		props.meetingClient.unmute("video",item.organizationUserId)
	}
}

</script>

<style scoped>

</style>