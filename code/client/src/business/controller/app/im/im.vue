<template>
  <a-layout style="height: 100%">
    <a-layout-sider :resize-directions="['right']">
      <div style="width: 100%;height: 100%;overflow-y: auto;padding: 5px;box-sizing: border-box">
        <a-select style="width: 100%" placeholder="type user or team" allow-search allow-clear @change="onChange" @search="onSearch">
          <a-optgroup label="Team" v-if="selectList && selectList.teams && selectList.teams.length>0">
            <a-option v-for="item in selectList.teams" :value="item.id">
              <a-row style="align-items: center">
                <a-avatar :image-url="item.photo" :size="24"></a-avatar>&nbsp;
                {{item.name}}
              </a-row>
            </a-option>
          </a-optgroup>
          <a-optgroup label="User" v-if="selectList && selectList.users && selectList.users.length>0">
            <a-option v-for="item in selectList.users" :value="item.id">
              <a-row style="align-items: center">
                <a-avatar :image-url="item.photo" :size="24"></a-avatar>&nbsp;
                {{item.name}}
              </a-row>
            </a-option>
          </a-optgroup>
        </a-select>
        <a-divider>Recent</a-divider>
        <RecentList ref="recentListRef" @select="onSelectChat" :init-data="id?{id,type:chatType}:undefined"></RecentList>
      </div>
    </a-layout-sider>
    <a-layout-content style="padding: 10px;">
      <Chat :data="messageList" :type="selectedChat.type" :info="selectedChat" @send="onSend" v-if="selectedChat" ref="chatRef" @update-more="onShowMore" @click-photo="onClickChatPhoto">
        <template #info v-if="selectedChat.type===ECommon_IM_Message_EntityType.TEAM">
          <a-collapse :default-active-key="['members']">
            <a-collapse-item header="Members" key="members">
              <a-space wrap>
                <UserAvatar v-for="item in teamMemberList" :organization-user-id="item.id" :name="item.name" :photo="item.photo"></UserAvatar>
              </a-space>
            </a-collapse-item>
          </a-collapse>
        </template>
      </Chat>
    </a-layout-content>
    <teleport to="body" v-if="chatPhotoProfileInfo">
      <UserShortView :organization-user-id="chatPhotoProfileInfo.id" :photo="chatPhotoProfileInfo.photo" style="position:absolute;z-index: 1000;box-shadow: rgba(169, 169, 169, 0.2) 0px 0px 2px 2px;border-radius: 5px;background-color: white" :style="{left:chatPhotoProfileInfo.x+'px',top:chatPhotoProfileInfo.y+'px'}" @mouseleave="chatPhotoProfileInfo=null" @click="chatPhotoProfileInfo=null"></UserShortView>
    </teleport>
  </a-layout>
</template>

<script setup lang="ts">
import RecentList, {RecentItem} from "./recentList.vue";
import {nextTick, onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {ICommon_Route_Res_Organization_FilterUserAndTeam} from "../../../../../../common/routes/response";
import {apiOrganization, apiTeam} from "../../../common/request/request";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {IClient_Chat_Message_Item} from "../../../common/component/chat/type";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {userTeamInfoPick} from "../../../common/component/userInfoPick";
import moment from "moment";
import {ECommon_IM_Message_ContentType} from "../../../../../../common/model/im_user_message";
import Chat from "../../../common/component/chat/chat.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SessionStorage} from "../../../common/storage/session";
import {Message} from "@arco-design/web-vue";
import UserAvatar from "../../../common/component/userAvatar.vue";
import UserShortView from "./userShortView.vue";

const props=defineProps<{
  id?:string,
  chatType?:ECommon_IM_Message_EntityType
}>()
const recentListRef=ref<InstanceType<typeof RecentList>>()
const selectList=ref<ICommon_Route_Res_Organization_FilterUserAndTeam>()
const messageList=ref<IClient_Chat_Message_Item[]>([])
const selectedChat=ref<RecentItem>()
const socket=SocketIOClient.get(ECommon_Socket_Type.IM)
const chatRef=ref<InstanceType<typeof Chat>>()
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
  content:string,
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
    if(item.type===ECommon_IM_Message_EntityType.USER) {
      let ret=await socket.getSocket().emitWithAck("im_user_message_list",item.id,20,0)
      messageList.value=ret.map(item=>{
        let obj=userTeamInfoPick.getInfos([{
          id:item.from_organization_user_id,
          type:ECommon_IM_Message_EntityType.USER
        }])
        return {
          id:item.from_organization_user_id,
          type:item.content_type,
          date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
          content:item.content || item.file_id,
          name:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].name:"unknown",
          photo:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].photo:""
        }
      })
    } else if(item.type===ECommon_IM_Message_EntityType.TEAM) {
      let ret=await socket.getSocket().emitWithAck("im_team_message_list",item.id,20,0)
      messageList.value=ret.map(item=>{
        let obj=userTeamInfoPick.getInfos([{
          id:item.from_organization_user_id,
          type:ECommon_IM_Message_EntityType.USER
        }])
        return {
          id:item.from_organization_user_id,
          type:item.content_type,
          date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
          content:item.content || item.file_id,
          name:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].name:"unknown",
          photo:obj[item.from_organization_user_id]?obj[item.from_organization_user_id].photo:""
        }
      })
      getTeamMemberList(item.id)
    }
	  item.count=0;
	  await socket.getSocket().emit("im_read_message",item.id)
    selectedChat.value=item
  } else if(!item) {
    selectedChat.value=null;
  }
}

const onSend=(content:string,contentType:ECommon_IM_Message_ContentType,chatType:ECommon_IM_Message_EntityType,toOrganizationUserId?:string,teamId?:string)=>{
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
    if(item.contentType===ECommon_IM_Message_ContentType.TEXT) {
      if(item.chatType===ECommon_IM_Message_EntityType.USER) {
        ret=await socket.getSocket().timeout(5000).emitWithAck("im_user_send_text_message",item.toOrganizationUserId,item.content)
      } else if(item.chatType===ECommon_IM_Message_EntityType.TEAM) {
        ret=await socket.getSocket().timeout(5000).emitWithAck("im_team_send_text_message",item.teamId,item.content)
      }
    } else if(item.contentType===ECommon_IM_Message_ContentType.IMAGE) {
      if(item.chatType===ECommon_IM_Message_EntityType.USER) {
        ret=await socket.getSocket().timeout(5000).emitWithAck("im_user_send_image_message",item.toOrganizationUserId,item.content)
      } else if(item.chatType===ECommon_IM_Message_EntityType.TEAM) {
        ret = await socket.getSocket().timeout(5000).emitWithAck("im_team_send_image_message", item.teamId, item.content)
      }
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
const onReceiveMessage=(chatType, fromOrganizationUserId, content, contentType,date, toOrganizationUserId, teamId) => {
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
      let item=recentListRef.value.addRecentItem(teamId,ECommon_IM_Message_EntityType.TEAM, false)
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
            id:item.from_organization_user_id,
            type:item.content_type,
            date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
            content:item.content || item.file_id,
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
            id:item.from_organization_user_id,
            type:item.content_type,
            date:moment(item.created_time).format("YYYY-MM-DD HH:mm:ss.SSS"),
            content:item.content || item.file_id,
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
onBeforeMount(()=>{
  eventBus.on(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE, onReceiveMessage)
  eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
  eventBus.on(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,openSpecificChat)
})
onBeforeUnmount(()=>{
  eventBus.off(EClient_EVENTBUS_TYPE.RECEIVE_IM_MESSAGE ,onReceiveMessage)
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
  eventBus.off(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,openSpecificChat)
})

</script>

<style scoped>

</style>