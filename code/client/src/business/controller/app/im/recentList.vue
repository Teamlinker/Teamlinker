<template>
  <a-menu v-model:selected-keys="selectedKeys">
    <a-menu-item v-for="item in recentList" :key="item.id">
      <template #icon>
        <a-avatar :image-url="item.photo" :size="24"></a-avatar>
      </template>
      {{item.name}}
    </a-menu-item>
  </a-menu>
</template>

<script setup lang="ts">
import {onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SocketIOClient} from "../../../common/socket/socket";
import {ECommon_Socket_Type} from "../../../../../../common/socket/types";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {userTeamInfoPick} from "../../../common/component/userInfoPick";
import {SessionStorage} from "../../../common/storage/session";

const emit=defineEmits<{
  (e:"select",item:RecentItem):void
}>()
export type RecentItem = {
  id: string,
  name: string,
  photo: string,
  count?:number,
  type:ECommon_IM_Message_EntityType
}
const selectedKeys=ref<string[]>([])
const recentList = ref<RecentItem[]>([])
watch(recentList,()=>{
  SessionStorage.set("imRecentList",recentList.value.slice(0,20).map(item=>{
    return {
      id:item.id,
      type:item.type
    }
  }))
},{
  deep:true
})
watch(selectedKeys,()=>{
  let item:RecentItem
  for(let obj of recentList.value) {
    if(obj.id===selectedKeys.value[0]) {
      item=obj
      break
    }
  }
  emit("select",item)
},{
  deep:true
})
const socket=SocketIOClient.get(ECommon_Socket_Type.IM)
const getRecentList = async () => {
  let localList = SessionStorage.get("imRecentList")??[];
  let unReadList=await socket.getSocket().emitWithAck("im_unread_messages")
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
      count:item.count
    }
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
      count:item.count
    }
  })
}
const handleUserInfo = (id: string, info: {
    id: string,
    name: string,
    photo: string
}) => {
  for(let obj of recentList.value) {
    if(obj.id==id) {
      obj.name=info.name;
      obj.photo=info.photo
      break
    }
  }
}
const addRecentItem=(id:string,type:ECommon_IM_Message_EntityType)=>{
  let index=-1
  for(let i=0;i<recentList.value.length;i++) {
    if(recentList.value[i].id===id) {
      index=i;
      break
    }
  }
  if(index>-1) {
    let obj=recentList.value[index]
    recentList.value.splice(index,1)
    recentList.value.unshift(obj)
  } else {
    let obj=userTeamInfoPick.getInfos([
      {
        id,
        type
      }
    ])
    recentList.value.unshift({
      id:id,
      type:type,
      name:obj[id]?obj[id].name:"unknown",
      photo:obj[id]?obj[id].photo:"",
      count:0
    })
  }
  selectedKeys.value=[id]
}
const updateRecentItem=(id:string) =>{
  let item:RecentItem,index
  for(let i=0;i<recentList.value.length;i++) {
    let obj=recentList.value[i]
    if(obj.id==id) {
      item=obj;
      index=i
      break
    }
  }
  if(item) {
    recentList.value.splice(index,1)
    recentList.value.unshift(item)
  }
}
onBeforeMount(() => {
  eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
  getRecentList()

})
onBeforeUnmount(() => {
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_USER_INFO, handleUserInfo)
})
defineExpose({
  addRecentItem,
  updateRecentItem
})
</script>

<style scoped>

</style>