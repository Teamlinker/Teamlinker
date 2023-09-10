<template>
  <a-layout style="height: 100%">
    <a-layout-sider :resize-directions="['right']">
      <a-row style="flex-direction: column;align-items: center">
        <a-avatar :size="72" :image-url="info.user?.photo">{{imgName}}</a-avatar>
        <a-space>
          <h3>{{info.organizationUser?.nickname}}</h3>
          <span style="height: 12px;width: 12px;background-color: #03ad03;border-radius: 6px;vertical-align: middle" v-if="status===ECommon_User_Online_Status.ONLINE"></span>
          <icon-stop :stroke-width="5" style="color: darkred" v-else-if="status===ECommon_User_Online_Status.BUSY"></icon-stop>
          <icon-video-camera :stroke-width="5" style="color: red" v-else-if="status===ECommon_User_Online_Status.MEETING"></icon-video-camera>
          <span style="height: 12px;width: 12px;background-color: gray;border-radius: 6px;vertical-align: middle" v-else-if="status===ECommon_User_Online_Status.OFFLINE"></span>
        </a-space>
        <div style="font-size: 13px;color: #6b778c;">{{info.user?.sign}}</div>
        <a-list style="margin-top: 30px;width: 80%" v-if="info.organizationUser?.job || info.organizationUser?.department || info.organizationUser?.phone || info.organizationUser?.email || info.organizationUser?.location">
          <a-list-item v-if="info.organizationUser?.job">
            <a-list-item-meta>
              <template #avatar>
                <sicon size="" color="" name="Ant" type="user"></sicon>
              </template>
              <template #title>
                {{info.organizationUser?.job}}
              </template>
            </a-list-item-meta>
          </a-list-item>
          <a-list-item v-if="info.organizationUser?.department">
            <a-list-item-meta>
              <template #avatar>
                <sicon size="" color="" name="Ant" type="apartment"></sicon>
              </template>
              <template #title>
                {{info.organizationUser?.department}}
              </template>
            </a-list-item-meta>
          </a-list-item>
          <a-list-item v-if="info.organizationUser?.phone">
            <a-list-item-meta>
              <template #avatar>
                <sicon size="" color="" name="Ant" type="phone"></sicon>
              </template>
              <template #title>
                {{info.organizationUser?.phone}}
              </template>
            </a-list-item-meta>
          </a-list-item>
          <a-list-item v-if="info.organizationUser?.email">
            <a-list-item-meta>
              <template #avatar>
                <sicon size="" color="" name="Ant" type="mail"></sicon>
              </template>
              <template #title>
                {{info.organizationUser?.email}}
              </template>
            </a-list-item-meta>
          </a-list-item>
          <a-list-item v-if="info.organizationUser?.location">
            <a-list-item-meta>
              <template #avatar>
                <sicon size="" color="" name="Ant" type="location"></sicon>
              </template>
              <template #title>
                {{info.organizationUser?.location}}
              </template>
            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </a-row>
    </a-layout-sider>
    <a-layout-content style="padding: 0px 10px">
      <h3>
        {{$t("controller.app.people.peopleProfile.recentTeams")}}
      </h3>
      <a-list>
        <a-list-item v-for="item in info.teamList" :key="item.id">
          <a-list-item-meta :title="item.name" :description="item.description">
            <template #avatar>
              <a-avatar :image-url="item.photo"></a-avatar>
            </template>
          </a-list-item-meta>
          <template #actions>
            <template v-if="organizationUserId===myOrganizationUserId">
              <a-button type="outline" size="small" @click="onTeamProfile(item.id)">{{$t("util.profile")}}</a-button>
            </template>
            <template v-else>
              <a-button type="outline" size="small" style="margin-left: 20px" @click="onTeamProfile(item.id)">{{$t("util.profile")}}</a-button>
              <a-button type="outline" size="small" style="margin-left: 20px;margin-top: 10px" @click="onMessage">
                <template #icon>
                  <icon-message></icon-message>
                </template>
	              {{$t("util.message")}}
              </a-button>
            </template>
          </template>
        </a-list-item>
      </a-list>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import {computed, onBeforeMount, ref} from "vue";
import {apiOrganization, DCSType} from "../../../common/request/request";
import {ICommon_Route_Res_Organization_User_Profile} from "../../../../../../common/routes/response";
import {getCurrentNavigator} from "../../../../teamOS/common/component/navigator/navigator";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {SessionStorage} from "../../../common/storage/session";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {ECommon_User_Online_Status} from "../../../../../../common/types";

const props=defineProps<{
  organizationUserId:string
}>()
const info=ref<DCSType<ICommon_Route_Res_Organization_User_Profile>>({
  teamList:[],
  user:null,
  organizationUser:null
});
const navigator=getCurrentNavigator()
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const status=ref(ECommon_User_Online_Status.OFFLINE)
onBeforeMount(async ()=>{
  apiOrganization.userProfile({
    organizationUserId:props.organizationUserId
  }).then(res=>{
    info.value=res.data
    let title=navigator.getPath()[navigator.getIndex().value]
    if(title=="profile") {
      navigator.getPath()[navigator.getIndex().value]=res.data.organizationUser.nickname
    }
  })
  apiOrganization.getUserStatus({
    organizationUserId:props.organizationUserId
  }).then(res=>{
    status.value=res.data.status
  })
})
const imgName=computed(()=>{
  if(info.value.organizationUser?.nickname.includes(" ")) {
    let arr=info.value.organizationUser.nickname.split(" ")
    return arr[0][0].toUpperCase()+arr[1][0].toUpperCase()
  } else {
    return info.value.organizationUser?.nickname[0].toUpperCase()
  }
})
const onTeamProfile=(teamId:string)=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_TEAM_PROFILE,teamId)
}
const onMessage=()=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,props.organizationUserId,ECommon_IM_Message_EntityType.USER)
}
</script>

<style scoped>

</style>