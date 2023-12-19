<template>
  <a-layout style="height: 100%" id="imWindow">
    <a-layout-sider :resize-directions="['right']">
      <div style="width: 100%;height: 100%;overflow-y: auto;padding: 5px;box-sizing: border-box">
        <a-select style="width: 100%" :placeholder="$t('placeholder.typeUserOrTeam')" allow-search allow-clear @change="onChange" @search="onSearch">
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
	      <a-menu style="width: 100%;padding: 0px;margin-top: 5px" v-model:selected-keys="selectedMenuKeys" @menu-item-click="onClickFavorite" id="imMenu">
		      <a-menu-item key="favorites">
			      <template #icon>
				      <icon-star></icon-star>
			      </template>
			      {{$t("controller.app.im.im.favorites")}}
		      </a-menu-item>
		      <a-menu-item key="messages">
			      <template #icon>
				      <icon-search></icon-search>
			      </template>
			      {{$t("controller.app.im.im.messages")}}
		      </a-menu-item>
	      </a-menu>
        <a-divider>{{$t("controller.app.im.im.recent")}}</a-divider>
        <RecentList ref="recentListRef" @select="onSelectChat" :init-data="id?{id,type:chatType}:undefined"></RecentList>
      </div>
    </a-layout-sider>
    <a-layout-content style="padding: 10px;">
      <Chat :data="messageList" :type="selectedChat.type" :info="selectedChat" @send="onSend" v-if="selectedChat && selectedMenuKeys.length==0" ref="chatRef" @update-more="onShowMore" @click-photo="onClickChatPhoto" @favorite="onFavorite" :is-search="!!locateInfo" :teamMemberList="teamMemberList">
        <template #info v-if="selectedChat.type===ECommon_IM_Message_EntityType.TEAM">
          <a-collapse :default-active-key="['members']">
            <a-collapse-item :header="$t('util.members')" key="members">
              <a-space wrap>
                <UserAvatar v-for="item in teamMemberList" :organization-user-id="item.id" :name="item.name" :photo="item.photo"></UserAvatar>
              </a-space>
            </a-collapse-item>
          </a-collapse>
        </template>
      </Chat>
	    <Favorite v-else-if="selectedMenuKeys.includes('favorites')"></Favorite>
	    <ImMessageSearch v-show="selectedMenuKeys.includes('messages')"></ImMessageSearch>
    </a-layout-content>
    <teleport to="body" v-if="chatPhotoProfileInfo">
      <UserShortView :organization-user-id="chatPhotoProfileInfo.id" style="position:absolute;z-index: 1000;box-shadow: rgba(169, 169, 169, 0.2) 0px 0px 2px 2px;border-radius: 5px;background-color: white" :style="{left:chatPhotoProfileInfo.x+'px',top:chatPhotoProfileInfo.y+'px'}" @mouseleave="chatPhotoProfileInfo=null" @click="chatPhotoProfileInfo=null"></UserShortView>
    </teleport>
  </a-layout>
</template>

<script setup lang="ts">
import RecentList, {RecentItem} from "./recentList.vue";
import {nextTick, onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {ICommon_Route_Res_Organization_FilterUserAndTeam} from "../../../../../../common/routes/response";
import {apiOrganization, apiTeam} from "../../../common/request/request";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {IClient_Chat_Message_Item} from "./type";
import {SocketIOClient} from "../../../common/socket/socket";
import {
	ECommon_Socket_Type,
	ICommon_Socket_IM_Search_Message_Team,
	ICommon_Socket_IM_Search_Message_User
} from "../../../../../../common/socket/types";
import {userTeamInfoPick} from "../../../common/component/userInfoPick";
import moment from "moment";
import {
	ECommon_IM_Message_ContentType,
	ICommon_Model_IM_User_Message
} from "../../../../../../common/model/im_user_message";
import Chat from "./chat.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SessionStorage} from "../../../common/storage/session";
import {Message} from "@arco-design/web-vue";
import UserAvatar from "../../../common/component/userAvatar.vue";
import UserShortView from "../../../common/component/userShortView.vue";
import {ECommon_Content_Line_Config_Type, ICommon_Content_Line} from "../../../../../../common/model/content";
import Favorite from "./favorite.vue";
import ImMessageSearch from "./imMessageSearch.vue";
import {ICommon_Model_IM_Team_Message} from "../../../../../../common/model/im_team_message";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  id?:string,
  chatType?:ECommon_IM_Message_EntityType
}>()
const {t}=useI18n()
const recentListRef=ref<InstanceType<typeof RecentList>>()
const selectList=ref<ICommon_Route_Res_Organization_FilterUserAndTeam>()
const messageList=ref<IClient_Chat_Message_Item[]>([])
const selectedChat=ref<RecentItem>()
const socket=SocketIOClient.get(ECommon_Socket_Type.IM)
const chatRef=ref<InstanceType<typeof Chat>>()
const selectedMenuKeys=ref([])
let myOrganizationUserId=SessionStorage.get("organizationUserId")
let locateInfo:{
	id:string,
	messageId:string
}
const chatPhotoProfileInfo=ref<{
  id:string,
  photo:string,
  x:number,
  y:number
}>()
let isShowMorePending=false
const teamMemberList=ref<{
  id:string,
  photo:string,
  name:string
}[]>([])
const onSearch=async (key:string)=>{
  if(!key) {
    return
  }
  let ret=await apiOrganization.filterAvailableUserAndTeam({
    keyword:key,
    exceptMe:1
  })
  if(ret?.code==0) {
    selectList.value=ret.data
  }
}
type SendItem={
  content:ICommon_Content_Line[],
  contentType:ECommon_IM_Message_ContentType,
  toOrganizationUserId?:string,
  teamId:string,
  chatType:ECommon_IM_Message_EntityType
}
const sendBufferList=ref<SendItem[]>([])
watch(sendBufferList,(value, oldValue, onCleanup)=>{
  if(sendBufferList.value.length>0) {
    sendMessage(sendBufferList.value[sendBufferList.value.length-1])
  }
},{
  deep:true
})
const onChange=(id:string)=>{
  if(id) {
    let type:ECommon_IM_Message_EntityType
    selectList.value.users.forEach(item=>{
      if(item.id==id) {
        type=ECommon_IM_Message_EntityType.USER
      }
    })
    selectList.value.teams.forEach(item=>{
      if(item.id==id) {
        type=ECommon_IM_Message_EntityType.TEAM
      }
    })
    recentListRef.value.addRecentItem(id,type,true)
  }
}
const onSelectChat=async (item:RecentItem)=>{
  if(item && item !==selectedChat.value) {
	  selectedMenuKeys.value=[]
    if(item.type===ECommon_IM_Message_EntityType.USER) {
      let ret:ICommon_Model_IM_User_Message[]
	    if(locateInfo) {
				ret=await socket.getSocket().emitWithAck("im_user_message_locate",locateInfo.id,locateInfo.messageId)
	    } else {
		    ret=await socket.getSocket().emitWithAck("im_user_message_list",item.id,20,0)
	    }
      messageList.value=ret.map(item=>{
        let obj=userTeamInfoPick.getInfos([{
          id:item.from_organization_user_id,
          type:ECommon_IM_Message_EntityType.USER
        }])
        return {
					messageId:item.id,
          id:item.from_organization_user_id,
          type:item.content_type,
          date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
          content:JSON.parse(item.content),
          name:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].name:"unknown",
          photo:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].photo:""
        }
      })
    } else if(item.type===ECommon_IM_Message_EntityType.TEAM) {
      let ret:ICommon_Model_IM_Team_Message[]
	    if(locateInfo) {
				ret=await socket.getSocket().emitWithAck("im_team_message_locate",locateInfo.id,locateInfo.messageId)
	    } else {
				ret=await socket.getSocket().emitWithAck("im_team_message_list",item.id,20,0)
	    }
      messageList.value=ret.map(item=>{
        let obj=userTeamInfoPick.getInfos([{
          id:item.from_organization_user_id,
          type:ECommon_IM_Message_EntityType.USER
        }])
        return {
	        messageId:item.id,
          id:item.from_organization_user_id,
          type:item.content_type,
          date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
          content:JSON.parse(item.content),
          name:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].name:"unknown",
          photo:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].photo:""
        }
      })
      getTeamMemberList(item.id)
    }
	  item.count=0;
	  selectedChat.value=item
	  await socket.getSocket().emit("im_read_message",item.id)
	  if(locateInfo) {
		  locateInfo=null;
	  }
  } else if(!item) {
    selectedChat.value=null;
  }
}

const onSend=(content:ICommon_Content_Line[],contentType:ECommon_IM_Message_ContentType,chatType:ECommon_IM_Message_EntityType,toOrganizationUserId?:string,teamId?:string)=>{
  sendBufferList.value.unshift({
    teamId,
    toOrganizationUserId,
    chatType,
    content,
    contentType
  })
  if(chatType===ECommon_IM_Message_EntityType.TEAM) {
    recentListRef.value.addRecentItem(teamId,chatType,true)
  } else if(chatType===ECommon_IM_Message_EntityType.USER) {
    recentListRef.value.addRecentItem(toOrganizationUserId,chatType,true)
  }
}

const sendMessage=async (item:SendItem)=>{
  async function _send(item:SendItem) {
    let ret:{
      code?:number,
      msg?:string,
      success:boolean
    }
	  if(item.chatType===ECommon_IM_Message_EntityType.USER) {
		  ret=await socket.getSocket().timeout(5000).emitWithAck("im_user_send_message",item.toOrganizationUserId,item.content,item.contentType)
	  } else if(item.chatType===ECommon_IM_Message_EntityType.TEAM) {
		  ret=await socket.getSocket().timeout(5000).emitWithAck("im_team_send_message",item.teamId,item.content,item.contentType)
	  }
    sendBufferList.value.pop()
    if(!ret.success) {
      Message.error(ret.msg)
    }
  }
  try {
    _send(item)
  } catch (err) {
    _send(item)
  }

}
const onReceiveMessage=(messageId,chatType, fromOrganizationUserId, content, contentType,date, toOrganizationUserId, teamId) => {
  if(chatType===ECommon_IM_Message_EntityType.USER) {
    let obj=userTeamInfoPick.getInfos([{
      id:fromOrganizationUserId,
      type:ECommon_IM_Message_EntityType.USER
    },{
      id:toOrganizationUserId,
      type:ECommon_IM_Message_EntityType.USER
    }])
    if([toOrganizationUserId,fromOrganizationUserId].includes(selectedChat.value?.id)) {
      messageList.value.push({
	      messageId:messageId,
        id:fromOrganizationUserId,
        content:content,
        type:contentType,
        date,
        photo:obj[fromOrganizationUserId]?obj[fromOrganizationUserId].photo:"",
        name:obj[fromOrganizationUserId]?obj[fromOrganizationUserId].name:"unknown"
      })
      if(fromOrganizationUserId===SessionStorage.get("organizationUserId")) {
        nextTick(()=>{
          chatRef.value.scrollToBottom()
        })
      }
    } else {
      let item=recentListRef.value.addRecentItem(fromOrganizationUserId,ECommon_IM_Message_EntityType.USER, false)
      if(!item.count) {
        item.count=1;
        socket.getSocket().emit("im_unread_message",fromOrganizationUserId,ECommon_IM_Message_EntityType.USER)
      }
    }
  } else if(chatType===ECommon_IM_Message_EntityType.TEAM) {
    let obj=userTeamInfoPick.getInfos([{
      id:fromOrganizationUserId,
      type:ECommon_IM_Message_EntityType.USER
    },{
      id:teamId,
      type:ECommon_IM_Message_EntityType.TEAM
    }])
    if(selectedChat.value?.id===teamId) {
      messageList.value.push({
	      messageId:messageId,
        id:fromOrganizationUserId,
        content:content,
        type:contentType,
        date,
        photo:obj[fromOrganizationUserId]?obj[fromOrganizationUserId].photo:"",
        name:obj[fromOrganizationUserId]?obj[fromOrganizationUserId].name:"unknown"
      })
      if(fromOrganizationUserId===SessionStorage.get("organizationUserId")) {
        nextTick(()=>{
          chatRef.value.scrollToBottom()
        })
      }
    } else {
	    let objAt:{
		    all:boolean,
		    [param:string]:boolean
	    }={
		    all:false
	    }
	    if(contentType===ECommon_IM_Message_ContentType.RICH_TEXT) {
		    for(let objLine of content as ICommon_Content_Line[]) {
			    for(let objConfig of objLine.arr) {
				    if(objConfig.type===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
					    if(objConfig.value==="0") {
						    objAt.all=true
					    } else {
						    objAt[objConfig.value]=true
					    }
				    }
			    }
		    }
	    }
      let item=recentListRef.value.addRecentItem(teamId,ECommon_IM_Message_EntityType.TEAM, false,objAt)
      if(!item.count) {
        item.count=1;
        socket.getSocket().emit("im_unread_message",teamId,ECommon_IM_Message_EntityType.TEAM)
      }
    }
  }
}

const onShowMore=async (lastItem:IClient_Chat_Message_Item, type: ECommon_IM_Message_EntityType, info: {
  name: string,
  photo: string,
  id: string
})=>{
  if(!isShowMorePending) {
    isShowMorePending=true
    try {
      if(type===ECommon_IM_Message_EntityType.USER) {
        let ret=await socket.getSocket().emitWithAck("im_user_message_list",info.id,20,lastItem?moment(lastItem.date).toDate().getTime():0)
        messageList.value.push(...ret.map(item=>{
          let obj=userTeamInfoPick.getInfos([{
            id:item.from_organization_user_id,
            type:ECommon_IM_Message_EntityType.USER
          }])
          return {
	          messageId:item.id,
            id:item.from_organization_user_id,
            type:item.content_type,
            date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
            content:JSON.parse(item.content),
            name:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].name:"unknown",
            photo:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].photo:""
          }
        }))
      } else if(type===ECommon_IM_Message_EntityType.TEAM) {
        let ret=await socket.getSocket().emitWithAck("im_team_message_list",info.id,20,lastItem?moment(lastItem.date).toDate().getTime():0)
        messageList.value.push(...ret.map(item=>{
          let obj=userTeamInfoPick.getInfos([{
            id:item.from_organization_user_id,
            type:ECommon_IM_Message_EntityType.USER
          }])
          return {
	          messageId:item.id,
            id:item.from_organization_user_id,
            type:item.content_type,
            date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
            content:JSON.parse(item.content),
            name:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].name:"unknown",
            photo:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].photo:""
          }
        }))
      }
      isShowMorePending=false
    } catch {
      isShowMorePending=false
    }
  }
}

const onClickChatPhoto=(item:IClient_Chat_Message_Item, x:number, y:number)=>{
  chatPhotoProfileInfo.value={
    id:item.id,
    photo:item.photo,
    x,
    y
  }
}

const onClickFavorite=(key:string)=>{
	recentListRef.value.cancelSelectedItem()
}

const onFavorite=async (item:IClient_Chat_Message_Item,type: ECommon_IM_Message_EntityType)=>{
	let myOrganizationUserId=SessionStorage.get("organizationUserId")
	socket.getSocket().emit("im_favorite_message_add",myOrganizationUserId,type,item.messageId)
	Message.info(t("tip.favoriteSuccess"))
}

const handleUserInfo = (id: string, info: {
  id: string,
  name: string,
  photo: string
}) => {
  for(let obj of messageList.value) {
    if(obj.id==id) {
      obj.name=info.name;
      obj.photo=info.photo
    }
  }
  if(selectedChat.value?.id===id) {
    selectedChat.value.name=info.name
    selectedChat.value.photo=info.photo
  }
}

const getTeamMemberList=async (teamId:string)=>{
  teamMemberList.value=[]
  let ret=await apiTeam.members({
    teamId,
    page:0,
    size:Number.MAX_SAFE_INTEGER
  })
  if(ret?.code==0) {
    teamMemberList.value=ret.data.data.map(item=>{
      return {
        id:item.organizationUser.id,
        name:item.organizationUser.nickname,
        photo:item.user.photo
      }
    })
  }
}

const openSpecificChat=(id:string, chatType:ECommon_IM_Message_EntityType)=>{
  recentListRef.value.addRecentItem(id,chatType,true)
}

const locateMessage=async (item:ICommon_Socket_IM_Search_Message_User|ICommon_Socket_IM_Search_Message_Team)=>{
	let isTeam=false
	if((item as ICommon_Socket_IM_Search_Message_Team).teamId) {
		isTeam=true
	}
	if(!isTeam) {
		let itemUser=item as ICommon_Socket_IM_Search_Message_User
		let organizationUserId=itemUser.fromOrganizationUserId===myOrganizationUserId?itemUser.toOrganizationUserId:item.fromOrganizationUserId
		locateInfo={
			messageId:item.messageId,
			id:organizationUserId
		}
		recentListRef.value.addRecentItem(organizationUserId,ECommon_IM_Message_EntityType.USER, true)
	} else {
		let itemTeam=item as ICommon_Socket_IM_Search_Message_Team
		locateInfo={
			messageId:item.messageId,
			id:itemTeam.teamId
		}
		recentListRef.value.addRecentItem(itemTeam.teamId,ECommon_IM_Message_EntityType.TEAM, true)
	}
}

onBeforeMount(()=>{
  eventBus.on(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE, onReceiveMessage)
  eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
  eventBus.on(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,openSpecificChat)
	eventBus.on(EClient_EVENTBUS_TYPE.LOCATE_IM_MESSAGE,locateMessage)
})
onBeforeUnmount(()=>{
  eventBus.off(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE ,onReceiveMessage)
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
  eventBus.off(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,openSpecificChat)
	eventBus.off(EClient_EVENTBUS_TYPE.LOCATE_IM_MESSAGE,locateMessage)
})

</script>

<style scoped>
#imMenu :deep .arco-menu-inner {
	padding: 0px;
}

</style>