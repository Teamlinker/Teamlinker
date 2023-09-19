<template>
	<div style="height: 100%">
		<a-row style="width: 100%">
			<a-input-search :placeholder="$t('placeholder.imMessageSearch')" v-model="keyword" @search="onSearch" search-button></a-input-search>
		</a-row>
		<a-divider></a-divider>
		<a-row style="width: 100%;">
			<a-spin :loading="loading" style="width: 100%;">
				<a-collapse style="width: 100%" v-model:active-key="activeKeys">
					<a-collapse-item :header="$t('util.user')" key="user">
						<a-collapse style="width: 100%" v-if="userInfoList.length>0" :bordered="false">
							<a-collapse-item v-for="(value,key) in messageList.users" :key="key">
								<template #header>
									<div style="height: 30px;display: flex">
										<div style="flex:0 0 30px;display: flex;justify-content: center;align-items: center">
											<div style="height: 24px;width:24px;border-radius: 100%;overflow: hidden;margin-right: 10px">
												<a-avatar :image-url="userInfoList.find(item=>item.id===key)?.photo" :size="24" style="cursor: pointer">
													{{ calculateShortName(userInfoList.find(item=>item.id===key)?.name) }}
												</a-avatar>
											</div>
										</div>
										<div style="flex: 1 1 auto;display: flex;align-items: center;">
											{{ key === myOrganizationUserId ? $t("util.me") : userInfoList.find(item=>item.id===key)?.name }}&nbsp;
											+{{value.length}}
										</div>
									</div>
								</template>
								<a-list>
									<a-list-item v-for="item in value" :key="item.messageId">
										<div style="color: gray;font-size: smaller;display: flex;align-items: center">
											{{ moment(item.date).format("YYYY-MM-DD HH:mm:ss") }}&nbsp;
											<a-button size="mini" type="text" @click="onLocate(item)">
												<template #icon>
													<icon-arrow-right></icon-arrow-right>
												</template>
											</a-button>
										</div>
										<RichEditor :model-value="JSON.parse(item.content)" :readonly="true" @custom-anchor-click="onCustomAnchorClick"></RichEditor>
									</a-list-item>
								</a-list>
							</a-collapse-item>
						</a-collapse>
						<a-empty v-else></a-empty>
					</a-collapse-item>
					<a-collapse-item :header="$t('util.team')" key="team">
						<a-collapse style="width: 100%" v-if="teamInfoList.length>0" :bordered="false">
							<a-collapse-item v-for="(value,key) in messageList.teams" :key="key">
								<template #header>
									<div style="height: 30px;display: flex">
										<div style="flex:0 0 30px;display: flex;justify-content: center;align-items: center">
											<div style="height: 24px;width:24px;border-radius: 100%;overflow: hidden;margin-right: 10px">
												<a-avatar :image-url="teamInfoList.find(item=>item.id===key)?.photo" :size="24" style="cursor: pointer">
													{{ calculateShortName(teamInfoList.find(item=>item.id===key)?.name) }}
												</a-avatar>
											</div>
										</div>
										<div style="flex: 1 1 auto;display: flex;align-items: center;">
											{{ teamInfoList.find(item=>item.id===key)?.name }}&nbsp;
											+{{value.length}}
										</div>
									</div>
								</template>
								<a-list>
									<a-list-item v-for="item in value" :key="item.messageId">
										<div style="color: gray;font-size: smaller;display: flex;align-items: center">
											{{ moment(item.date).format("YYYY-MM-DD HH:mm:ss") }}
											<a-button size="mini" type="text" @click="onLocate(item)">
												<template #icon>
													<icon-arrow-right></icon-arrow-right>
												</template>
											</a-button>
										</div>
										<RichEditor :model-value="JSON.parse(item.content)" :readonly="true" @custom-anchor-click="onCustomAnchorClick"></RichEditor>
									</a-list-item>
								</a-list>
							</a-collapse-item>
						</a-collapse>
						<a-empty v-else></a-empty>
					</a-collapse-item>
				</a-collapse>
			</a-spin>
		</a-row>
	</div>
</template>

<script setup lang="ts">

import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import {
	ECommon_Socket_Type,
	ICommon_Socket_IM_Search_Message,
	ICommon_Socket_IM_Search_Message_Team,
	ICommon_Socket_IM_Search_Message_User
} from "../../../../../../common/socket/types";
import {SocketIOClient} from "../../../common/socket/socket";
import {SessionStorage} from "../../../common/storage/session";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {userTeamInfoPick} from "../../../common/component/userInfoPick";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {calculateShortName} from "../../../common/util/helper";
import moment from "moment/moment";
import RichEditor from "../../../common/component/richEditor/richEditor.vue";
import {ECommon_Content_Line_Config_Type} from "../../../../../../common/model/content";
import {RichEditorEventHandle} from "../../../common/component/richEditorEventHandle";

const keyword=ref("")
const activeKeys=ref<string[]>(["user","team"])
const socket=SocketIOClient.get(ECommon_Socket_Type.IM)
const loading=ref(false)
const userInfoList=ref<{
	id:string,
	name:string,
	photo:string
}[]>([])
const teamInfoList=ref<{
	id:string,
	name:string,
	photo:string
}[]>([])
let myOrganizationUserId=SessionStorage.get("organizationUserId")
const messageList=ref<ICommon_Socket_IM_Search_Message>({
	teams:{},
	users:{}
})
const search=async ()=>{
	loading.value=true
	userInfoList.value=[]
	teamInfoList.value=[]
	let ret=await socket.getSocket().emitWithAck("im_search_message",keyword.value)
	loading.value=false
	activeKeys.value=["user","team"]
	messageList.value=ret;
	Object.keys(ret.users).map(organizationUserId=>{
		let obj=userTeamInfoPick.getInfos([{
			id:organizationUserId,
			type:ECommon_IM_Message_EntityType.USER
		}])
		userInfoList.value.push({
			id:organizationUserId,
			photo:obj[organizationUserId]?obj[organizationUserId].photo:"",
			name:obj[organizationUserId]?obj[organizationUserId].name:"unknown"
		})
	})
	Object.keys(ret.teams).map(teamId=>{
		let obj=userTeamInfoPick.getInfos([{
			id:teamId,
			type:ECommon_IM_Message_EntityType.TEAM
		}])
		teamInfoList.value.push({
			id:teamId,
			photo:obj[teamId]?obj[teamId].photo:"",
			name:obj[teamId]?obj[teamId].name:"unknown"
		})
	})
}

const onSearch=()=>{
	if(keyword.value.length>1) {
		search()
	} else {
		userInfoList.value=[]
		teamInfoList.value=[]
		messageList.value={
			teams:{},
			users:{}
		}
	}
}

const handleUserInfo = (id: string, info: {
	id: string,
	name: string,
	photo: string
}) => {
	for(let obj of userInfoList.value) {
		if(obj.id==id) {
			obj.name=info.name;
			obj.photo=info.photo
		}
	}
	for(let obj of teamInfoList.value) {
		if(obj.id==id) {
			obj.name=info.name;
			obj.photo=info.photo
		}
	}
}

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

const onLocate=(item:ICommon_Socket_IM_Search_Message_User|ICommon_Socket_IM_Search_Message_Team)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.LOCATE_IM_MESSAGE,item)
}

onBeforeMount(()=>{
	eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
})
onBeforeUnmount(()=>{
	eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
})
</script>


<style scoped>
:deep .arco-collapse-item-content {
	padding: 0 0 0 5px;
}
:deep .arco-collapse-item-content .arco-list-item {
	padding: 5px!important;
	border: 0;
}
</style>