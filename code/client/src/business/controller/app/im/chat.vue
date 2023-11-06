<template>
	<div style="width: 100%;height: 100%;display: flex;flex-direction: column" ref="root">
		<div
			style="flex: 0 0 36px;display: flex;align-items: center;justify-content: space-between;padding:0 10px;border-bottom: 1px solid lightgray">
			<div style="height: 24px;display: flex;align-items: center">
				<a-avatar :size="24" :image-url="info.photo">
					{{ calculateShortName(info.name) }}
				</a-avatar>&nbsp;
				{{ info.name }}
			</div>
			<a-space>
				<a-button type="text" @click="onMeeting" v-if="type===ECommon_IM_Message_EntityType.USER">
					<template #icon>
						<icon-video-camera style="font-size: large;color: red"></icon-video-camera>
					</template>
				</a-button>
				<a-popover v-else-if="type===ECommon_IM_Message_EntityType.TEAM" trigger="click" position="br">
					<a-button type="text">
						<template #icon>
							<icon-video-camera style="font-size: large;color: red"></icon-video-camera>
						</template>
					</a-button>
					<template #content>
						<a-row style="flex-direction: column;align-items: center">
							<a-input size="small" :placeholder="$t('placeholder.typeUserName')" v-model="searchUserKey"></a-input>
							<a-table style="width: 100%;margin-top: 10px" row-key="id" :columns="columns" :data="teamMemberList.filter(item=>(item.id!==organizationUserId && item.name.includes(searchUserKey)))" :row-selection="rowSelection" v-model:selected-keys="selectKeys" :pagination="false">
								<template #name="{record}">
									<UserAvatar :organization-user-id="record.id" :name="record.name" :photo="record.photo"></UserAvatar>
								</template>
							</a-table>
							<a-button type="primary" style="margin-top: 10px" size="small" @click="onMeeting">{{$t("util.invite")}}</a-button>
						</a-row>
					</template>
				</a-popover>
				<div v-if="type===ECommon_IM_Message_EntityType.TEAM">
					<a-button type="text" size="large" @click="isInfoVisible=!isInfoVisible">
						<template #icon>
							<icon-info-circle style="font-size: large"></icon-info-circle>
						</template>
					</a-button>
				</div>
			</a-space>
		</div>
		<div style="flex: 1 1 auto;height: calc(100% - 37px)">
			<a-split direction="vertical" style="height: 100%" :default-size="0.8">
				<template #first>
					<div style="height: 100%;overflow-y: auto;padding: 10px;box-sizing: border-box" @wheel="onWheel"
					     ref="contentRef">
						<div v-for="(item,index) in messageList" :key="item.date" style="margin-bottom: 10px" @mouseenter="$event.currentTarget.querySelector('[name=star]').style.display='block'" @mouseleave="$event.currentTarget.querySelector('[name=star]').style.display='none'">
							<div v-if="index===0" style="height: 20px;text-align: center;color: gray">
								{{ moment(item.date).format("MM-DD") }}
							</div>
							<div v-else-if="moment(item.date).date()!=moment(messageList[index-1].date).date()"
							     style="height: 20px;text-align: center;color: gray">
								{{ moment(item.date).format("MM-DD") }}
							</div>
							<div style="height: 30px;display: flex">
								<div style="flex:0 0 30px;display: flex;justify-content: center;align-items: center">
									<div style="height: 24px;width:24px;border-radius: 100%;overflow: hidden;margin-right: 10px">
										<a-avatar :image-url="item.photo" :size="24" style="cursor: pointer"
										          @click="onClickPhoto($event,item)">
											{{ calculateShortName(item.name) }}
										</a-avatar>
									</div>
								</div>
								<div style="flex: 1 1 auto;display: flex;align-items: center;">
									{{ item.id === organizationUserId ? $t("util.me") : item.name }}&nbsp;
									<span style="color: gray;font-size: smaller">{{ moment(item.date).format("HH:mm") }}</span>&nbsp;
									<a-button size="mini" type="text" style="display: none"  name="star" @click="onFavorite(item)">
										<template #icon>
											<icon-star></icon-star>
										</template>
									</a-button>
								</div>
							</div>
							<div style="display: flex">
								<div style="flex:0 0 30px;display: flex;justify-content: center;align-items: center">
								</div>
								<div style="flex: 1 1 auto;display: flex;align-items: center;">
									<div style="background-color: #efeeee;border-radius: 5px">
										<RichEditor v-model="item.content" :readonly="true" @custom-anchor-click="onCustomAnchorClick"></RichEditor>
									</div>
								</div>
							</div>
						</div>
					</div>
				</template>
				<template #second>
					<div style="height: 100%;box-sizing: border-box;display: flex;">
						<div style="height: 100%;flex: 0 0 calc(100% - 60px);overflow-y: auto" v-drop.file.shortcut.disk="onDrop">
							<RichEditor v-model="content" v-if="type===ECommon_IM_Message_EntityType.USER" key="user" style="width: 100%;min-height: 50px" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" ref="objEditorUser" @meta-enter="onSend"></RichEditor>
							<RichEditor v-model="content" v-else key="team" style="width: 100%" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" @quote-list="onQuoteList" ref="objEditorTeam" @meta-enter="onSend"></RichEditor>
						</div>
						<a-button type="primary" style="margin-top: 2px;height: 60px;flex: 0 0 60px;border-radius: 5px;align-self: end"
						          tabindex="-1" @click="onSend">
							<template #icon>
								<icon-send style="color: white;font-size: x-large"></icon-send>
							</template>
						</a-button>
					</div>
				</template>
			</a-split>
		</div>
		<a-drawer v-model:visible="isInfoVisible" :popup-container="root" unmountOnClose :header="false" :footer="false">
			<slot name="info" :info="info" v-if="isInfoVisible">

			</slot>
		</a-drawer>
	</div>
</template>

<script setup lang="ts">
import {IClient_Chat_Message_Item} from "./type";
import {getCurrentInstance, nextTick, ref, watch} from "vue";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {ECommon_IM_Message_ContentType} from "../../../../../../common/model/im_user_message";
import {SessionStorage} from "../../../common/storage/session";
import moment from "moment";
import {calculateShortName} from "../../../common/util/helper";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config
} from "../../../../../../common/model/content";
import RichEditor from "../../../common/component/richEditor/richEditor.vue";
import {RichEditorEventHandle} from "../../../common/component/richEditorEventHandle";
import {apiFile, apiMeeting, apiTeam} from "../../../common/request/request";
import {DropParam, vDrop} from "../../../../teamOS/common/directive/drop";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {ECommon_Model_Organization_Member_Type} from "../../../../../../common/model/organization";
import {TableRowSelection} from "@arco-design/web-vue/es/table/interface";
import UserAvatar from "../../../common/component/userAvatar.vue";
import {useI18n} from "vue-i18n";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";
import {ECommon_User_Online_Status} from "../../../../../../common/types";

const root = ref()
const appContext=getCurrentInstance().appContext
const emit = defineEmits<{
	(e: "updateMore", lastItem: IClient_Chat_Message_Item, type: ECommon_IM_Message_EntityType, info: {
		name: string,
		photo: string,
		id: string
	})
	(e: "clickPhoto", item: IClient_Chat_Message_Item, x: number, y: number)
	(e: "send", content: ICommon_Content_Line[], contentType: ECommon_IM_Message_ContentType, chatType: ECommon_IM_Message_EntityType, toOrganizationUserId?: string, teamId?: string),
	(e:"favorite",item: IClient_Chat_Message_Item,type: ECommon_IM_Message_EntityType)
}>()
const props = defineProps<{
	data: IClient_Chat_Message_Item[],
	type: ECommon_IM_Message_EntityType,
	info: {
		name: string,
		photo: string,
		id: string,
	},
	isSearch?:boolean,
	teamMemberList?:{
		id:string,
		photo:string,
		name:string
	}[]
}>()
const loading = ref(false)
const contentRef = ref<HTMLDivElement>()
const content = ref<ICommon_Content_Line[]>([])
const isInfoVisible = ref(false)
const messageList = ref<IClient_Chat_Message_Item[]>([])
const organizationUserId = SessionStorage.get("organizationUserId")
const popMenuList=ref(RichEditorEventHandle.popMenuList)
const objEditorUser=ref<InstanceType<typeof RichEditor>>()
const objEditorTeam=ref<InstanceType<typeof RichEditor>>()
const searchUserKey=ref("")
const store=useDesktopStore()
let topElement:HTMLElement
let isWheel = false
let isManualSend=false
const selectKeys=ref([])
const rowSelection=ref<TableRowSelection>({
	type:"checkbox",
	showCheckedAll:true,
	onlyCurrent:false
})
const {t}=useI18n()
const columns = [
	{
		title: t("util.name"),
		slotName: 'name',
	}
]
watch(() => props.data, () => {
	messageList.value = JSON.parse(JSON.stringify(props.data))
	messageList.value.sort((a, b) => {
		if (a.date > b.date) {
			return 1
		} else {
			return -1
		}
	})
	if(isWheel) {
		nextTick(()=>{
			topElement?.scrollIntoView()
		})
		isWheel=false
	} else if(isManualSend) {
		isManualSend=false
		nextTick(()=>{
			contentRef.value.scrollTop = contentRef.value.scrollHeight
		})
	} else if(contentRef.value && Math.abs(contentRef.value.offsetHeight + contentRef.value.scrollTop - contentRef.value.scrollHeight)<20) {
		nextTick(()=>{
			contentRef.value.scrollTop = contentRef.value.scrollHeight
		})
	}
}, {
	deep: true,
	immediate: true
})
watch(() => props.info, () => {
	isWheel = false
	isInfoVisible.value = false
	content.value=[]
	nextTick(() => {
		if(props.isSearch) {
			contentRef.value.scrollTop=0
		} else {
			contentRef.value.scrollTop = contentRef.value.scrollHeight
		}
	})
},{
	immediate:true
})
const onWheel = (event: WheelEvent) => {
	let ele = event.currentTarget as HTMLDivElement
	if (event.deltaY < 0 && ele.scrollTop <= 0) {
		isWheel = true;
		topElement=contentRef.value.children[0] as HTMLElement
		emit("updateMore", messageList.value[0], props.type, props.info)
	}
}

const onClickPhoto = (event: MouseEvent, item: IClient_Chat_Message_Item) => {
	emit("clickPhoto", item, event.x, event.y)
}
const onSend = () => {
	if (content.value.length > 0) {
		emit("send", content.value.map(item=>{
			return {
				arr:item.arr
			}
		}), ECommon_IM_Message_ContentType.RICH_TEXT, props.type, props.type === ECommon_IM_Message_EntityType.USER ? props.info.id : null, props.type === ECommon_IM_Message_EntityType.TEAM ? props.info.id : null)
	}
	content.value = []
	isManualSend=true
}
const scrollToBottom = () => {
	contentRef.value.scrollTop = contentRef.value.scrollHeight
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

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

const onQuoteList=async (keyword:string,handleFunc:(list:{
	value:string,
	label:string,
	photo:string
}[])=>void)=>{
	let res=await apiTeam.listUser({
		page:0,
		size:20,
		keyword:keyword,
		teamId:props.info.id
	})
	if(res?.code==0) {
		handleFunc([{
			value:"0",
			label:"All",
			photo:null
		},...res.data.data.map(item=>{
			return {
				value:item.organizationUser.id,
				label:item.organizationUser.nickname,
				photo:item.user.photo
			}
		})])
	}
}

const onDrop=(data?:DropParam)=>{
	RichEditorEventHandle.onDrop(props.type===ECommon_IM_Message_EntityType.USER?objEditorUser:objEditorTeam,data,loading)
}

const onFavorite=(item:IClient_Chat_Message_Item)=>{
	emit("favorite",item,props.type)
}

const onMeeting=async ()=>{
	let res=await apiMeeting.getPersonalRoom()
	if(res?.code===0) {
		if(store.status===ECommon_User_Online_Status.MEETING) {
			eventBus.emit(EClient_EVENTBUS_TYPE.MEETING_INVITE,props.type===ECommon_IM_Message_EntityType.USER?[{
				id:props.info.id,
				type:ECommon_Model_Organization_Member_Type.USER
			}]:selectKeys.value.map(item=>({
				id:item,
				type:ECommon_Model_Organization_Member_Type.USER
			})))
		} else {
			eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,res.data.id,res.data.password,props.type===ECommon_IM_Message_EntityType.USER?[{
				id:props.info.id,
				type:ECommon_Model_Organization_Member_Type.USER
			}]:selectKeys.value.map(item=>({
				id:item,
				type:ECommon_Model_Organization_Member_Type.USER
			})))
		}
	}
}

defineExpose({
	scrollToBottom
})
</script>

<style scoped>
:deep .arco-split-pane-second {
	overflow: hidden;
}

:deep .arco-split-pane-second textarea {
	resize: none;
}

:deep .arco-table-td-content {
	display: flex;
	align-items: center;
}
</style>