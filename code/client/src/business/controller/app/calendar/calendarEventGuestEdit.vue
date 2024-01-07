<template>
  <a-space wrap>
    <UserAvatar v-for="value in showValue" v-if="showValue && showValue.length>0" :organization-user-id="value.organizationUserId" :name="value.nickname" :photo="value.photo" :key="value.userId" @close="onClose" :closeable="true"></UserAvatar>
    <span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("util.none")}}</span>
    <a-select v-model="addValue" allow-search @search="onSearch" v-if="showInput" @change="onChange">
      <a-option v-for="item1 in searchValueList" :label="item1.nickname" :value="item1.userId"></a-option>
    </a-select>
    <a-button v-else type="text" @click="showInput=true">
      <template #icon>
        <icon-plus style="color: dodgerblue" />
      </template>
    </a-button>
  </a-space>
</template>

<script setup lang="ts">
import {ref, watchEffect} from "vue";
import {apiOrganization} from "../../../common/request/request";
import UserAvatar from "../../../common/component/userAvatar.vue";
import {SessionStorage} from "../../../common/storage/session";

const props=defineProps<{
  value:{
    userId:string,
    organizationUserId:string,
    nickname:string,
    photo?:string
  }[],
}>()
const showValue=ref<{
  userId:string,
  organizationUserId:string,
  nickname:string,
  photo?:string
}[]>([]);
const searchValueList=ref<{
  userId:string,
  organizationUserId:string,
  nickname:string,
  photo?:string
}[]>([])
const addValue=ref("")
const showInput = ref(false);
const init=async ()=>{
  if(props.value && props.value.length>0) {
    for(let i=0;i<props.value.length;i++) {
      let val=props.value[i]
      showValue.value[i]={
        photo:val.photo,
        nickname:val.nickname,
        userId:val.userId,
        organizationUserId:val.organizationUserId
      }
    }
  } else {
    showValue.value=[]
  }
}
watchEffect(()=>{
  init()
})
const onChange=()=>{
  showInput.value=false
  showValue.value=[...showValue.value,searchValueList.value.find(item=>{
    if(item.userId==addValue.value) {
      return true
    }
  })]
  addValue.value=""
  props.value.splice(0,props.value.length,...showValue.value)
}
const onClose=(organizationUserId:string)=>{
  for(let i=0;i<showValue.value.length;i++) {
    let obj=showValue.value[i]
    if(obj.organizationUserId==organizationUserId) {
      showValue.value.splice(i,1)
      i--;
    }
  }
  props.value.splice(0,props.value.length,...showValue.value)
}
const onSearch=async (keyword:string)=>{
  let res=await apiOrganization.listUser({
    organizationId:SessionStorage.get("organizationId"),
    keyword:keyword,
    page:0,
    size:10
  });
  if(res?.code==0) {
    searchValueList.value=res.data.data.map(item=>{
      return {
        organizationUserId:item.organizationUser.id,
        nickname:item.organizationUser.nickname,
        photo:item.user.photo,
        userId:item.user.id
      }
    }).filter(item=>{
      return item.userId!=SessionStorage.get("userId")
    })
  }
}
</script>

<style scoped>

</style>