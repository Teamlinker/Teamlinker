<template>
	<div style="height: 100%;overflow-y: auto;padding: 10px;box-sizing: border-box" @wheel="onWheel"
	     ref="contentRef">
		<div v-for="(item,index) in messageList" :key="item.date" style="margin-bottom: 20px" @mouseenter="$event.currentTarget.querySelector('[name=star]').style.display='block'" @mouseleave="$event.currentTarget.querySelector('[name=star]').style.display='none'">
			<div v-if="index===0" style="height: 20px;text-align: center;color: gray">
				{{ moment(item.date).format("MM-DD") }}
			</div>
			<div v-else-if="moment(item.date).date()!=moment(messageList[index-1].date).date()"
			     style="height: 20px;text-align: center;color: gray">
				{{ moment(item.date).format("MM-DD") }}
			</div>
			<div style="height: 30px;">
				<div style="flex: 1 1 auto;display: flex;align-items: center;height: 100%">
					{{item.name}}&nbsp;
					<span style="color: gray;font-size: smaller">{{ moment(item.date).format("HH:mm") }}</span>&nbsp;
					<a-button size="mini" type="text" style="display: none"  name="star" @click="onFavoriteDelete(item)">
						<template #icon>
							<icon-delete></icon-delete>
						</template>
					</a-button>
				</div>
			</div>
			<div style="display: flex">
				<div style="flex: 1 1 auto;display: flex;align-items: center;">
					<div style="background-color: #efeeee;border-radius: 5px">
						<RichEditor v-model="item.content" :readonly="true" @custom-anchor-click="onCustomAnchorClick"></RichEditor>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import moment from "moment/moment";
import RichEditor from "../../../common/component/richEditor/richEditor.vue";
import {getCurrentInstance, nextTick, onBeforeMount, ref} from "vue";
import {IClient_Chat_Message_Item} from "./type";
import {ECommon_Content_Line_Config_Type} from "../../../../../../common/model/content";
import {RichEditorEventHandle} from "../../../common/component/richEditorEventHandle";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {SessionStorage} from "../../../common/storage/session";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../common/component/dialog/dialog";
import {useI18n} from "vue-i18n";

const appContext=getCurrentInstance().appContext
const contentRef = ref<HTMLDivElement>()
const messageList = ref<IClient_Chat_Message_Item[]>([])
const socket=SocketIOClient.get(ECommon_Socket_Type.IM)
const {t}=useI18n()
let myOrganizationUserId=SessionStorage.get("organizationUserId")
const onWheel = (event: WheelEvent) => {
	let ele = event.currentTarget as HTMLDivElement
	if (event.deltaY < 0 && ele.scrollTop <= 0) {
		let topElement=contentRef.value.children[0] as HTMLElement
		getMessageList(messageList.value[0].date).then(()=>{
			nextTick(()=>{
				topElement?.scrollIntoView()
			})
		})
	}
}

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

const getMessageList=async (date?:string)=>{
	let ret=await socket.getSocket().emitWithAck("im_favorite_message_list",myOrganizationUserId,20,date?moment(date).toDate().getTime():0)
	messageList.value.push(...ret.map(item=>{
		return {
			messageId:item.id,
			id:item.id,
			type:item.content_type,
			date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
			content:JSON.parse(item.content),
			name:item.from_name,
			photo:null
		}
	}))
	messageList.value.sort((a, b) => {
		if (a.date > b.date) {
			return 1
		} else {
			return -1
		}
	})
}

const onFavoriteDelete=async (item:IClient_Chat_Message_Item)=>{
	let ret=await Dialog.confirm(document.getElementById("imWindow"),appContext,t("tip.deleteFavorite"))
	if(ret) {
		socket.getSocket().emit("im_favorite_message_delete",item.messageId)
		Message.info(t("tip.deleteSuccess"))
		messageList.value.splice(messageList.value.findIndex(obj=>{
			if(obj.messageId===item.messageId) {
				return true
			}
		}),1)
	}
}

onBeforeMount(()=>{
	getMessageList().then(()=>{
		nextTick(()=>{
			contentRef.value.scrollTop = contentRef.value.scrollHeight
		})
	})
})
</script>

<style scoped>

</style>