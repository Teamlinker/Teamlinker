<template>
	<a-layout style="height: 100%">
		<a-layout-content>
			<a-row style="height: 100%;display: flex;flex-direction: column;justify-content: center;align-items: center">
				<a-dropdown class="startMeeting" trigger="hover" position="top">
					<a-button size="large" type="primary" style="width: 300px" status="success" @click="onStartMeeting">
						Start Meeting
					</a-button>
					<template #content>
						<a-doption @click="onPersonalMeetingSetting">Person Meeting Setting</a-doption>
					</template>
				</a-dropdown>
				<a-button size="large" type="primary" style="margin-top: 30px;width: 300px" status="warning" @click="onJoinMeeting">Join Meeting</a-button>
				<a-button size="large" type="primary" style="margin-top: 30px;width: 300px" @click="onScheduleMeeting">Schedule Meeting</a-button>
			</a-row>
		</a-layout-content>
		<a-layout-sider :resize-directions="['left']" :width="300">
			<a-row style="height: 100%;width: 100%;padding: 5px;box-sizing: border-box">
				<a-row style="height: 30px;width: 100%;">
					<a-space>
						Meeting List:
						<a-input-search search-button placeholder="type meeting name" size="mini" @search="onSearch" v-model="keyword"></a-input-search>
					</a-space>
				</a-row>
				<a-row style="height: calc(100% - 30px);width: 100%;border-top: 1px solid lightgray;overflow-y: auto;flex-direction: column">
					<template v-if="roomList.length>0">
						<a-list :bordered="false" style="width: 100%;margin-top: 10px" :pagination-props="pagination" @pageChange="onChangePage">
							<a-list-item v-for="item in roomList" :key="item.id" style="border-bottom: 1px solid var(--color-fill-3)">
								<a-list-item-meta>
									<template #title>
										{{item.name}}&nbsp;
										<span style="font-size: smaller">{{moment(item.start_time).format('MM-DD HH:mm')}}</span>
									</template>
									<template #description>
										{{item.description}}
									</template>
								</a-list-item-meta>
								<template #actions>
									<icon-video-camera style="color: red" @click="onStartScheduleMeeting(item)"></icon-video-camera>
									<icon-edit @click="onEditMeeting(item)"></icon-edit>
									<icon-delete @click="onDeleteMeeting(item)"></icon-delete>
								</template>
							</a-list-item>
						</a-list>
					</template>
					<a-empty v-else style="margin-top: auto;margin-bottom: auto"></a-empty>
				</a-row>
			</a-row>
		</a-layout-sider>
	</a-layout>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {apiMeeting, DCSType} from "../../../common/request/request";
import {ECommon_Model_Meeting_Room_Type, ICommon_Model_Meeting_Room} from "../../../../../../common/model/meeting_room";
import {Dialog} from "../../../common/component/dialog/dialog";
import {
	ETeamOS_Navigator_Action,
	getCurrentNavigator,
	getRootNavigatorRef,
	onNavigatorShow
} from "../../../../teamOS/common/component/navigator/navigator";
import PersonalMeetingSetting from "./personalMeetingSetting.vue";
import EditScheduleMeeting from "./editScheduleMeeting.vue";
import moment from "moment";
import {Message} from "@arco-design/web-vue";
import MeetingJoinInput from "./meetingJoinInput.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {useDesktopStore} from "../../desktop/store/desktop";
import {ECommon_User_Online_Status} from "../../../../../../common/types";

const props=defineProps<{
	meetingInitInfo?:{
		id:string,
		password:string
	}
}>()
const store=useDesktopStore()
const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const roomList=ref<DCSType<ICommon_Model_Meeting_Room>[]>([])
const pagination=reactive({
	total:0,
	current:1,
	pageSize:10
})
let meetingWillJoinInfo:{
	id:string,
	password:string
}=null
const keyword=ref("");
const navigator=getCurrentNavigator()
const onStartMeeting=async ()=>{
    let res=await apiMeeting.getPersonalRoom()
    if(res?.code==0) {
        navigator.push("meetingProfile",{
            meetingId:res.data.id,
		        password:res.data.password
        })
    }
}

const onPersonalMeetingSetting=async()=>{
	Dialog.open(root.value,appContext,"edit setting",markRaw(PersonalMeetingSetting))
}

const onChangePage=(page:number)=>{
	getMeetingList(page)
}

const onScheduleMeeting=async ()=>{
    let ret=await Dialog.open(root.value,appContext,"shcedule meeting",markRaw(EditScheduleMeeting),{
			type:"add"
    })
		if(ret) {
			getMeetingList(pagination.current)
		}
}

const onEditMeeting=async (item:DCSType<ICommon_Model_Meeting_Room>)=>{
	let ret=await Dialog.open(root.value,appContext,"Edit Meeting",markRaw(EditScheduleMeeting),{
		type:"edit",
		data:item
	})
	if(ret) {
		getMeetingList(pagination.current)
	}
}

const onDeleteMeeting=async (item:DCSType<ICommon_Model_Meeting_Room>)=>{
	let ret=await Dialog.confirm(root.value,appContext,"Do you want to delete this meeting?")
	if(ret) {
		let res=await apiMeeting.deleteRoom({
			meetingRoomId:item.id
		})
		if(res?.code==0) {
			Message.success("delete success")
			getMeetingList(pagination.current)
		}
	}
}

const onSearch=async ()=>{
	getMeetingList(1)
}

const onJoinMeeting=async ()=>{
	let ret:any=await Dialog.open(root.value,appContext,"Join Meeting",markRaw(MeetingJoinInput))
	if(ret) {
		navigator.push("meetingProfile",{
			meetingId:ret.data.meetingRoomId,
			password:ret.data.password
		})
	}
}

const onStartScheduleMeeting=async (item:DCSType<ICommon_Model_Meeting_Room>)=>{
	navigator.push("meetingProfile",{
		meetingId:item.id,
		password:item.password
	})
}

const getMeetingList=async (page:number)=>{
	let res=await apiMeeting.listRoom({
		keyword:keyword.value,
		size:10,
		page:page-1,
		type:ECommon_Model_Meeting_Room_Type.SCHEDULE
	})
	if(res?.code==0) {
		roomList.value=res.data.data
		pagination.total=res.data.count;
		pagination.current=page
	}
}

const handleInvite=async (roomId, password) =>{
	if(store.status===ECommon_User_Online_Status.MEETING) {
		meetingWillJoinInfo={
			id:roomId,
			password
		}
		eventBus.emit(EClient_EVENTBUS_TYPE.LEAVE_MEETING)
	} else {
		navigator.push("meetingProfile",{
			meetingId:roomId,
			password:password
		})
	}
}

onBeforeMount(()=>{
	getMeetingList(1)
	eventBus.on(EClient_EVENTBUS_TYPE.OPEN_MEETING,  handleInvite)
})

onBeforeUnmount(()=>{
	eventBus.off(EClient_EVENTBUS_TYPE.OPEN_MEETING,  handleInvite)
})
onMounted(()=>{
	if(props.meetingInitInfo) {
		navigator.push("meetingProfile",{
			meetingId:props.meetingInitInfo.id,
			password:props.meetingInitInfo.password
		})
	}
})

onNavigatorShow(action => {
	if(action===ETeamOS_Navigator_Action.POP) {
		if(meetingWillJoinInfo) {
			navigator.push("meetingProfile",{
				meetingId:meetingWillJoinInfo.id,
				password:meetingWillJoinInfo.password
			})
			meetingWillJoinInfo=null;
		}
	}
})
</script>


<style scoped>

</style>