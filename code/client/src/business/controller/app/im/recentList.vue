<template>
  <a-menu v-model:selected-keys="selectedKeys">
    <a-menu-item v-for="(item,index) in recentList" :key="item.id">
      <template #icon>
        <a-avatar :image-url="item.photo" :size="24" :trigger-icon-style="{height:'10px',width:'10px',lineHeight:'10px',right:'-2px',bottom:'-2px',...(item.status===ECommon_User_Online_Status.MEETING && {backgroundColor:'transparent'})}">
          {{calculateShortName(item.name)}}
          <template #trigger-icon v-if="item.type===ECommon_IM_Message_EntityType.USER">
            <div style="height: 100%;width: 100%;background-color: #03ad03;border-radius: 6px" v-if="item.status===ECommon_User_Online_Status.ONLINE"></div>
            <icon-stop :stroke-width="5" style="color: darkred" v-else-if="item.status===ECommon_User_Online_Status.BUSY"></icon-stop>
            <icon-video-camera :stroke-width="5" style="color: red" v-else-if="item.status===ECommon_User_Online_Status.MEETING"></icon-video-camera>
            <div style="height: 100%;width: 100%;background-color: gray;border-radius: 6px" v-else-if="item.status===ECommon_User_Online_Status.OFFLINE"></div>
          </template>
        </a-avatar>
      </template>
      <a-dropdown trigger="contextMenu" alignPoint >
        <div>
          <a-badge :count="item.count!==undefined?item.count:0" dot :offset="[6,-2]">
	          <template v-if="item.atYou">
		          {{item.name}}
		          <span style="color: red;font-size: small">
			          (@You)
		          </span>
	          </template>
	          <template v-else-if="item.atAll">
		          {{item.name}}
		          <span style="color: red;font-size: small">
			          (@All)
		          </span>
	          </template>
	          <template v-else>
		          {{item.name}}
	          </template>
          </a-badge>
        </div>
        <template #content>
          <a-doption @click="onProfile(item)">{{$t("util.profile")}}</a-doption>
          <a-doption @click="onClose(item,index)">{{$t("util.close")}}</a-doption>
        </template>
      </a-dropdown>
    </a-menu-item>
  </a-menu>
</template>

<script setup lang="ts">
import {onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {ECommon_IM_Message_At, ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {userTeamInfoPick} from "../../../common/component/userInfoPick";
import {SessionStorage} from "../../../common/storage/session";
import {calculateShortName} from "../../../common/util/helper";
import {ECommon_User_Online_Status} from "../../../../../../common/types";

const emit=defineEmits<{
  (e:"select",item:RecentItem):void
}>()
const props=defineProps<{
  initData?:{
    id:string,
    type:ECommon_IM_Message_EntityType
  }
}>()
export type RecentItem = {
  id: string,
  name: string,
  photo: string,
  count?:number,
  type:ECommon_IM_Message_EntityType,
  status?:ECommon_User_Online_Status,
	atYou?:boolean,
	atAll?:boolean
}
const selectedKeys=ref<string[]>([])
const recentList = ref<RecentItem[]>([])
const myOrganizationId=SessionStorage.get("organizationId")
const myOrganizationUserId=SessionStorage.get("organizationUserId")
watch(recentList,()=>{
	let obj=SessionStorage.get("imRecentList")
	if(!obj) {
		obj={}
	}
	let list=recentList.value.slice(0,20).map(item=>{
		return {
			id:item.id,
			type:item.type
		}
	})
	if(list.length>0) {
		obj[myOrganizationId]=list
	} else {
		delete obj[myOrganizationId]
	}
  SessionStorage.set("imRecentList",obj)
},{
  deep:true
})
watch(selectedKeys,()=>{
  let item:RecentItem
  for(let obj of recentList.value) {
    if(obj.id===selectedKeys.value[0]) {
      item=obj
	    item.atAll=false
	    item.atYou=false
      break
    }
  }
  emit("select",item)
},{
  deep:true
})
const socket=SocketIOClient.get(ECommon_Socket_Type.IM)
const getRecentList = async () => {
  let localList = SessionStorage.get("imRecentList")?.[myOrganizationId]?? [];
  let unReadList=await socket.getSocket().emitWithAck("im_unread_message_list")
  let obj = userTeamInfoPick.getInfos([...localList,...unReadList.map(item=>{
    return {
      id:item.entity_id,
      type:item.entity_type
    }
  })]);
  recentList.value=[...unReadList.map(item=>{
    return {
      id:item.entity_id,
      type:item.entity_type,
      count:item.count,
	    atAll:!!(item.at & ECommon_IM_Message_At.ALL),
	    atYou:!!(item.at & ECommon_IM_Message_At.SPECIFIC)
    } as RecentItem
  }),...localList.filter(item=>{
    return !unReadList.map(item=>item.entity_id).includes(item.id)
  }).map(item=>{
    return {
      ...item,
      count:0
    }
  })].map(item=>{
    return {
      id:item.id,
      name:obj[item.id]?obj[item.id].name:"unknown",
      photo:obj[item.id]?obj[item.id].photo:"",
      type:item.type,
      count:item.count,
      status:obj[item.id]!==undefined?obj[item.id].status:ECommon_User_Online_Status.OFFLINE,
	    atYou:(item as RecentItem).atYou,
	    atAll:(item as RecentItem).atAll
    }
  })
  if(props.initData) {
    addRecentItem(props.initData.id,props.initData.type,true)
  }
}
const handleUserInfo = (id: string, info: {
    id: string,
    name: string,
    photo: string,
    status?:ECommon_User_Online_Status
}) => {
  for(let obj of recentList.value) {
    if(obj.id==id) {
      obj.name=info.name;
      obj.photo=info.photo
      if(info.status!==undefined) {
        obj.status=info.status
      }
      break
    }
  }
}

const cancelSelectedItem=()=>{
	selectedKeys.value=[]
}

const addRecentItem=(id:string,type:ECommon_IM_Message_EntityType,selected:boolean,objAt:{
	all:boolean,
	[param:string]:boolean
}={
	all:false
}):RecentItem=>{
  let index=-1,item:RecentItem
  for(let i=0;i<recentList.value.length;i++) {
    if(recentList.value[i].id===id) {
      index=i;
      break
    }
  }
  if(index>-1) {
    item=recentList.value[index]
    recentList.value.splice(index,1)
    recentList.value.unshift(item)
  } else {
    let obj=userTeamInfoPick.getInfos([
      {
        id,
        type
      }
    ])
    item={
      id:id,
      type:type,
      name:obj[id]?obj[id].name:"unknown",
      photo:obj[id]?obj[id].photo:"",
      count:0,
      status:obj[id]!==undefined?obj[id].status:ECommon_User_Online_Status.OFFLINE
    }
    recentList.value.unshift(item)
	  item=recentList.value[0]
  }
  if(selected && !selectedKeys.value.includes(id)) {
    selectedKeys.value=[id]
  }
	if(type===ECommon_IM_Message_EntityType.TEAM) {
		if(objAt[myOrganizationUserId]) {
			item.atYou=true
		} else if(objAt.all) {
			item.atAll=true
		}
	}
  return item
}

const checkRecentItem=(id:string)=> {
  let item:RecentItem
  for(let i=0;i<recentList.value.length;i++) {
    let obj=recentList.value[i]
    if(obj.id==id) {
      item=obj;
      break
    }
  }
  return item
}

const onProfile=(item:RecentItem)=>{
  if(item.type===ECommon_IM_Message_EntityType.USER) {
    eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,item.id);
  } else if(item.type===ECommon_IM_Message_EntityType.TEAM) {
    eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_TEAM_PROFILE,item.id);
  }
}

const onClose=(item:RecentItem,index:number)=>{
  recentList.value.splice(index,1)
  if(selectedKeys.value.includes(item.id)) {
    selectedKeys.value=[]
  }
}

const handleStatus=(organizationUserId:string,status:ECommon_User_Online_Status)=>{
  for(let obj of recentList.value) {
    if(obj.id===organizationUserId) {
      obj.status=status
      break
    }
  }
}

onBeforeMount(() => {
  eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
  eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS, handleStatus)
  getRecentList()
})
onBeforeUnmount(() => {
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS, handleStatus)
})
defineExpose({
  addRecentItem,
  checkRecentItem,
	cancelSelectedItem
})
</script>

<style scoped>

</style>