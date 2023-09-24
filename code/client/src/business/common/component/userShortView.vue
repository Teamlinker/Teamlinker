<template>
    <a-list :loading="loading" :bordered="false" size="small">
        <a-list-item v-if="info">
            <a-list-item-meta>
                <template #title>
                    <a-space>
                        {{info.nickname}}
                        <span style="height: 12px;width: 12px;background-color: #03ad03;border-radius: 6px;vertical-align: middle" v-if="status===ECommon_User_Online_Status.ONLINE"></span>
                        <icon-stop :stroke-width="5" style="color: darkred" v-else-if="status===ECommon_User_Online_Status.BUSY"></icon-stop>
                        <icon-video-camera :stroke-width="5" style="color: red" v-else-if="status===ECommon_User_Online_Status.MEETING"></icon-video-camera>
                        <span style="height: 12px;width: 12px;background-color: gray;border-radius: 6px;vertical-align: middle" v-else-if="status===ECommon_User_Online_Status.OFFLINE"></span>
                    </a-space>
                </template>
                <template #avatar>
                    <a-avatar :image-url="info.user.photo" :size="64">{{calculateShortName(info.nickname)}}</a-avatar>
                </template>
                <template #description>
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
                    <a-button type="outline" size="small" style="margin-left: 20px" @mousedown="onProfile">{{$t("util.profile")}}</a-button>
                </template>
                <a-row v-else style="flex-direction: column">
                    <a-button type="outline" size="mini" style="margin-left: 20px" @mousedown="onProfile">{{$t("util.profile")}}</a-button>
                    <a-button type="outline" size="mini" style="margin-left: 20px;margin-top: 10px" @mousedown="onMessage">
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

<script setup lang="ts">
import {calculateShortName} from "../util/helper";
import {ref, watch} from "vue";
import {apiOrganization} from "../request/request";
import {SessionStorage} from "../storage/session";
import {EClient_EVENTBUS_TYPE, eventBus} from "../event/event";
import {ECommon_IM_Message_EntityType} from "../../../../../common/model/im_unread_message";
import {DCSType, ECommon_User_Online_Status} from "../../../../../common/types";
import {ICommon_Route_Res_Organization_User} from "../../../../../common/routes/response";

const props=defineProps<{
    organizationUserId:string
}>()
const loading=ref(false)
const info=ref<DCSType<ICommon_Route_Res_Organization_User>>()
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const status=ref(ECommon_User_Online_Status.OFFLINE)
watch(()=>props.organizationUserId,async ()=>{
    loading.value=true
    Promise.all([
        apiOrganization.user({
            organizationUserId:props.organizationUserId
        }).then(res=>{
            info.value=res.data
        }),
        apiOrganization.getUserStatus({
            organizationUserId:props.organizationUserId
        }).then(res=>{
            status.value=res.data.status
        })
    ]).then(res=>{
        loading.value=false
    })

},{
    immediate:true
})
const onProfile=()=>{
    eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,props.organizationUserId);
}

const onMessage=()=>{
    eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,props.organizationUserId,ECommon_IM_Message_EntityType.USER)
}
</script>

<style scoped>

</style>