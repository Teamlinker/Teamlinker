<template>
	<div style="height: 100%">
		<a-split direction="vertical" style="height: 100%" :default-size="0.8">
			<template #first>
				<div style="height: 100%;overflow-y: auto;padding: 10px;box-sizing: border-box">
					<div v-for="(item,index) in messageList" :key="item.id" style="margin-bottom: 10px">
						<div style="height: 30px;display: flex">
							<div style="flex:0 0 30px;display: flex;justify-content: center;align-items: center">
								<div style="height: 24px;width:24px;border-radius: 100%;overflow: hidden;margin-right: 10px">
									<a-avatar :image-url="item.created_by.photo" :size="24" style="cursor: pointer">
										{{ calculateShortName(item.created_by.nickname) }}
									</a-avatar>
								</div>
							</div>
							<div style="flex: 1 1 auto;display: flex;align-items: center;">
								{{ item.id === myOrganizationUserId ? $t("util.me") : item.created_by.nickname }}&nbsp;
								<span style="color: gray;font-size: smaller">{{ moment(item.created_time).format("HH:mm") }}</span>&nbsp;
							</div>
						</div>
						<div style="display: flex">
							<div style="flex:0 0 30px;display: flex;justify-content: center;align-items: center">
							</div>
							<div style="flex: 1 1 auto;display: flex;align-items: center;">
								<div style="background-color: #efeeee;border-radius: 5px">
									<RichEditor :model-value="JSON.parse(item.content)" :readonly="true" @custom-anchor-click="onCustomAnchorClick"></RichEditor>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
			<template #second>
				<a-spin style="height: 100%;box-sizing: border-box;display: flex;" :loading="loading">
					<div style="height: 100%;flex: 0 0 calc(100% - 60px);overflow-y: auto" v-drop.file.shortcut.disk="onDrop">
						<RichEditor v-model="content" style="width: 100%;min-height: 50px" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" ref="objEditorUser" @meta-enter="onSend"></RichEditor>
					</div>
					<a-button type="primary" style="margin-top: 2px;height: auto;flex: 0 0 60px;border-radius: 5px"
					          tabindex="-1" @click="onSend">
						<template #icon>
							<icon-send style="color: white;font-size: x-large"></icon-send>
						</template>
					</a-button>
				</a-spin>
			</template>
		</a-split>
	</div>
</template>


<script setup lang="ts">
import {MeetingClient} from "../../../common/component/meeting/client";
import RichEditor from "../../../common/component/richEditor/richEditor.vue";
import {getCurrentInstance, onBeforeMount, ref} from "vue";
import {apiFile} from "../../../common/request/request";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config,
	ICommon_Model_Content
} from "../../../../../../common/model/content";
import {SessionStorage} from "../../../common/storage/session";
import {RichEditorEventHandle} from "../../../common/component/richEditorEventHandle";
import {DropParam, vDrop} from "../../../../teamOS/common/directive/drop";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {calculateShortName} from "../../../common/util/helper";
import moment from "moment";
import {getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {DCSType} from "../../../../../../common/types";

const emit=defineEmits<{
	newMessage:[]
}>()
const props=defineProps<{
	meetingClient:MeetingClient
}>()
const root =getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const socket=SocketIOClient.get(ECommon_Socket_Type.MEETING)
const loading = ref(false)
const content = ref<ICommon_Content_Line[]>([])
const messageList = ref<DCSType<ICommon_Model_Content>[]>([])
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const popMenuList=ref(RichEditorEventHandle.popMenuList)
const objEditorUser=ref<InstanceType<typeof RichEditor>>()

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

const onDrop=(data?:DropParam)=>{
	RichEditorEventHandle.onDrop(objEditorUser,data)
}

const onUploadFile=async (file, handleFunc) => {
	let res=await apiFile.upload({
		file:file
	})
	if(res?.code==0) {
		handleFunc(res.data.id,res.data.path)
	}
}

const onPopMenuClick=(type:ECommon_Content_Line_Config_Type,handleFunc:(item:ICommon_Content_Line_Config)=>void)=>{
	RichEditorEventHandle.onPopMenuClick(type,root,appContext,loading,handleFunc)
}

const onSend = () => {
	if(content.value.length>0) {
		props.meetingClient.sendMessage(JSON.stringify(content.value.map(item=>{
			return {
				arr:item.arr
			}
		})))
	}
	content.value = []
}

const getMessage=async ()=>{
	let ret=await socket.getSocket().emitWithAck("meeting_message_list",messageList.value.length==0?null:messageList.value[messageList.value.length-1].id)
	messageList.value=messageList.value.concat(ret)
	if(ret.length>0) {
		emit("newMessage")
	}
}

onBeforeMount(()=>{
	props.meetingClient.onMessageReceive= data => {
		getMessage()
	}
})
defineExpose({
	getMessage
})
</script>

<style scoped>

</style>