<template>
	<a-popover position="br" trigger="click" @popup-visible-change="onRead">
		<a-badge dot :count="unreadCount" style="cursor: pointer">
			<sicon size="18" color="rgb(241,241,241)" name="Ant" type="video"></sicon>
		</a-badge>
		<template #content>
			<a-list :loading="loading" :max-height="240">
				<a-list-item v-for="item in list" :key="item.id">
					<div style="color: gray;font-size: small;">{{moment(item.created_time).format("MM-DD HH:mm")}}</div>
					<div style="display: flex;align-items: center">{{item.organizationUser.nickname}} {{$t("controller.desktop.missCallShow.invitedYou")}}
					<a-button type="text" size="small" @click="onMeeting(item)">
						<template #icon>
							<icon-video-camera style="color: red"></icon-video-camera>
						</template>
					</a-button>
					</div>
				</a-list-item>
			</a-list>
		</template>
	</a-popover>
</template>

<script setup lang="ts">
import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import {apiMeeting} from "../../common/request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../common/event/event";
import {ICommon_Route_Res_Meeting_Miss_Call} from "../../../../../common/routes/response";
import {ECommon_Model_Organization_Member_Type} from "../../../../../common/model/organization";
import {SessionStorage} from "../../common/storage/session";
import {DCSType, ECommon_User_Online_Status} from "../../../../../common/types";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";
import moment from "moment";

const loading=ref(false)
const list=ref<DCSType<ICommon_Route_Res_Meeting_Miss_Call>[]>([])
const unreadCount=ref(0)
const store=useDesktopStore()
const getList=async ()=>{
	let res=await apiMeeting.listMissCall()
	if(res?.code==0) {
		list.value=res.data
	}
}

const onMeeting=async (item:DCSType<ICommon_Route_Res_Meeting_Miss_Call>)=>{
	let res=await apiMeeting.getPersonalRoom()
	if(res?.code==0) {
		if(store.status===ECommon_User_Online_Status.MEETING) {
			eventBus.emit(EClient_EVENTBUS_TYPE.MEETING_INVITE,[
				{
					id:item.from_organization_user_id,
					type:ECommon_Model_Organization_Member_Type.USER
				}
			])
		} else {
			eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,res.data.id,res.data.password,[
				{
					id:item.from_organization_user_id,
					type:ECommon_Model_Organization_Member_Type.USER
				}
			])
		}

	}
}

const onRead=async ()=>{
	loading.value=true
	await Promise.all([
		getList(),
		apiMeeting.missCallRead()
	])
	loading.value=false
	unreadCount.value=0
}

const getUnReadCount=async ()=>{
	if(SessionStorage.get("organizationUserId")) {
		let res=await apiMeeting.missCallCount()
		unreadCount.value=res.data.count
	}
}

onBeforeMount(()=>{
	eventBus.on(EClient_EVENTBUS_TYPE.REFRESH_MISS_CALL_UNREAD,getUnReadCount)
})

onBeforeUnmount(()=>{
	eventBus.off(EClient_EVENTBUS_TYPE.REFRESH_MISS_CALL_UNREAD,getUnReadCount)
})
</script>

<style scoped>

</style>