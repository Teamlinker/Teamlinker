<template>
  <a-popover position="left" :content-style="{backgroundColor:'rgb(249,249,249)',padding:'0px'}" :id="'popover'+organizationUserId">
    <a-space>
      <a-avatar :size="24" :image-url="photo">{{imgName}}</a-avatar>
      <span>{{name}}</span>
    </a-space>
    <template #content>
      <a-list :bordered="false" :loading="loading" size="small">
        <a-list-item>
          <a-list-item-meta :title="name">
            <template #avatar>
              <a-avatar :image-url="photo" :size="64">{{imgName}}</a-avatar>
            </template>
            <template #description v-if="info">
              <a-space v-if="info.job">
                <sicon size="" color="" name="Ant" type="user"></sicon>
                <span>{{info.job}}</span>
              </a-space>
              <br>
              <a-space v-if="info.department">
                <sicon size="" color="" name="Ant" type="apartment"></sicon>
                <span>{{info.department}}</span>
              </a-space>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-button type="outline" size="small" style="margin-left: 20px" @click="onProfile">Profile</a-button>
          </template>
        </a-list-item>
      </a-list>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import {computed, onBeforeMount, ref} from "vue";
import {ICommon_Model_Organization_User} from "../../../../../common/model/organization_user";
import {apiOrganization, DCSType} from "../request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../event/event";

const loading=ref(true)
const props=defineProps<{
  name:string,
  photo?:string,
  organizationUserId:string
}>()
const root=ref(null);
const imgName=computed(()=>{
  if(props.name.includes(" ")) {
    let arr=props.name.split(" ")
    return arr[0][0].toUpperCase()+arr[1][0].toUpperCase()
  } else {
    return props.name[0].toUpperCase()
  }
})
const info=ref<DCSType<ICommon_Model_Organization_User>>(null)
onBeforeMount(async ()=>{
  let res=await apiOrganization.user({
    organizationUserId:props.organizationUserId
  })
  if(res?.code==0) {
    info.value=res.data
    loading.value=false
  }
})
const onProfile=()=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,props.organizationUserId);
  let ele=document.getElementById("popover"+props.organizationUserId)
  ele.parentElement.removeChild(ele);
}
</script>

<style scoped>

</style>