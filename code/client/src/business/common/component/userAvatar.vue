<template>
  <a-popover position="left" :content-style="{backgroundColor:'rgb(249,249,249)',padding:'0px'}" :id="'popover'+organizationUserId" @popup-visible-change="onPopup" :trigger="trigger??'hover'">
    <a-space @mouseenter="showCloseable=true" @mouseleave="showCloseable=false" size="small" :style="{border:(closeable===true && showCloseable)?'1px lightgray solid':0}">
      <a-avatar :size="24" :image-url="photo">{{imgName}}</a-avatar>
      <template v-if="!onlyPhoto">
        <span>{{name}}</span>
        <a-button type="text" size="mini" v-if="closeable===true && showCloseable" @click="emit('close',organizationUserId)">
          <template #icon>
            <icon-delete style="color:red;"></icon-delete>
          </template>
        </a-button>
      </template>
    </a-space>
    <template #content>
      <a-list :bordered="false" :loading="loading" size="small">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a-space size="mini">
                {{name}}
                <span style="height: 12px;width: 12px;background-color: #03ad03;border-radius: 6px;" v-if="status===ECommon_User_Online_Status.ONLINE"></span>
                <icon-stop :stroke-width="5" style="color: darkred" v-else-if="status===ECommon_User_Online_Status.BUSY"></icon-stop>
                <icon-video-camera :stroke-width="5" style="color: red" v-else-if="status===ECommon_User_Online_Status.MEETING"></icon-video-camera>
                <span style="height: 12px;width: 12px;background-color: gray;border-radius: 6px" v-else-if="status===ECommon_User_Online_Status.OFFLINE"></span>
              </a-space>
            </template>
            <template #avatar>
              <a-avatar :image-url="photo" :size="64" :trigger-icon-style="{right:'-9px',bottom:'-9px',backgroundColor:'transparent'}">
                {{imgName}}
              </a-avatar>
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
            <template v-if="organizationUserId===myOrganizationUserId">
              <a-button type="outline" size="small" style="margin-left: 20px" @click="onProfile">{{$t("util.profile")}}</a-button>
            </template>
            <a-row v-else style="flex-direction: column">
              <a-button type="outline" size="mini" style="margin-left: 20px" @click="onProfile">{{$t("util.profile")}}</a-button>
              <a-button type="outline" size="mini" style="margin-left: 20px;margin-top: 10px" @click="onMessage">
                <template #icon>
                  <icon-message></icon-message>
                </template>
	              {{$t("util.message")}}
              </a-button>
            </a-row>
          </template>
        </a-list-item>
      </a-list>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
import {computed, onBeforeMount, ref, watch} from "vue";
import {ICommon_Model_Organization_User} from "../../../../../common/model/organization_user";
import {apiOrganization} from "../request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../event/event";
import {SessionStorage} from "../storage/session";
import {ECommon_IM_Message_EntityType} from "../../../../../common/model/im_unread_message";
import {DCSType, ECommon_User_Online_Status} from "../../../../../common/types";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";

const loading=ref(true)
const props=defineProps<{
  name?:string,
  photo?:string,
  organizationUserId:string,
  closeable?:boolean,
  onlyPhoto?:boolean,
	organizationId?:string,
  trigger?:'hover' | 'click' | 'focus' | 'contextMenu'
}>()
const emit=defineEmits<{
  (e:"close",organizationUserId:string):void
}>()
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const showCloseable=ref(false)
const root=ref(null);
const name=ref("")
const photo=ref("")
const {t}=useI18n()
const status=ref(ECommon_User_Online_Status.OFFLINE)
watch(()=>[props.name,props.photo],()=>{
	name.value=props.name
	photo.value=props.photo
},{
	immediate:true
})
const imgName=computed(()=>{
  if(name.value?.includes(" ")) {
    let arr=name.value.split(" ")
    return arr[0][0].toUpperCase()+arr[1][0].toUpperCase()
  } else {
    return name.value?name.value[0].toUpperCase():""
  }
})
const info=ref<DCSType<ICommon_Model_Organization_User>>(null)
const onProfile=()=>{
	if(info.value.organization_id!==SessionStorage.get("organizationId")) {
		Message.error(t("tip.switchToSpecificOrganization"))
		return
	}
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,props.organizationUserId);
  let ele=document.getElementById("popover"+props.organizationUserId)
  ele.parentElement.removeChild(ele);
}
const onPopup=async (visible:boolean)=>{
  if(!info.value && visible) {
    Promise.all([
      apiOrganization.user({
        organizationUserId:props.organizationUserId,
	      ...(props.organizationId && {
					organizationId:props.organizationId
	      })
      }).then(res => {
        if(res?.code==0) {
          info.value=res.data
        }
      }),
      apiOrganization.getUserStatus({
        organizationUserId:props.organizationUserId,
	      ...(props.organizationId && {
		      organizationId:props.organizationId
	      })
      }).then(res => {
        if(res?.code==0) {
          status.value=res.data.status
        }
      })
    ]).then(value => {
      loading.value=false
    })
  }
}
const onMessage=()=>{
	if(info.value.organization_id!==SessionStorage.get("organizationId")) {
		Message.error(t("tip.switchToSpecificOrganization"))
		return
	}
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,props.organizationUserId,ECommon_IM_Message_EntityType.USER)
}
onBeforeMount(async ()=>{
	if(props.organizationUserId && !props.name) {
		let res=await apiOrganization.user({
			organizationUserId:props.organizationUserId,
			...(props.organizationId && {
				organizationId:props.organizationId
			})
		})
		if(res?.code==0) {
			name.value=res.data.nickname
			photo.value=res.data.user.photo
		}
	}
})
</script>

<style scoped>

</style>