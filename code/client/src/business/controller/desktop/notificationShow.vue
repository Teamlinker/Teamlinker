<template>
	<a-popover position="br" trigger="click" @popup-visible-change="onVisibleChange">
		<a-badge dot :count="unreadCount" style="cursor: pointer">
			<sicon size="18" color="rgb(241,241,241)" name="Ant" type="bell-fill"></sicon>
		</a-badge>
		<template #content>
			<a-space style="margin-bottom: 10px">
				{{$t("util.type")}}:
				<a-select style="width: 200px" size="small" v-model="type" @change="onChange">
					<a-option value="all">{{$t("util.all")}}</a-option>
					<a-option value="organization">{{$t("util.organization")}}</a-option>
					<a-option value="team">{{$t("util.team")}}</a-option>
					<a-option value="issue">{{$t("util.projectIssue")}}</a-option>
					<a-option value="wiki">{{$t("util.wiki")}}</a-option>
					<a-option value="calendar">{{$t("util.calendar")}}</a-option>
				</a-select>
			</a-space>
			<a-list @reach-bottom="onReachBottom" :max-height="240" :key="type">
				<a-list-item v-for="item in list" :key="item.id" @mouseenter="onRead(item)" :style="{backgroundColor:item.is_read?'white':'lightgray'}">
					<div style="color: grey;font-size: small;display: flex;justify-content: space-between"><span style="color: black">{{item.organization.name}}:</span>{{moment(item.created_time).format("YYYY-MM-DD HH:mm:ss")}}</div>
					<NotificationItem :obj="item"></NotificationItem>
				</a-list-item>
				<template #scroll-loading v-if="!bottom">
					<a-spin />
				</template>
			</a-list>
		</template>
	</a-popover>
</template>

<script setup lang="ts">
import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import {apiNotification} from "../../common/request/request";
import {ICommon_Route_Res_Notification_Item} from "../../../../../common/routes/response";
import NotificationItem from "../../common/component/notificationItem.vue";
import {ECommon_Model_Notification_Type} from "../../../../../common/model/notification";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../common/event/event";
import {type} from "os";
import moment from "moment";
import {DCSType} from "../../../../../common/types";

let page=0
const bottom=ref(false)
const types=ref<ECommon_Model_Notification_Type[]>([])
const type=ref("all")
const list=ref<DCSType<ICommon_Route_Res_Notification_Item>[]>([])
const unreadCount=ref(0)
const getList=async ()=>{
	let res=await apiNotification.list({
		page,
		size:10,
		types:types.value
	})
	if(res?.code==0) {
		for(let i=0;i<res.data.length;i++) {
      let obj=res.data[i]
			if(!obj.data) {
        res.data.splice(i,1)
        i--
				apiNotification.remove({
					notificationId:obj.id
				})
			}
		}
		list.value.push(...res.data)
		if(res.data.length==0) {
			bottom.value=true
		}
	}
}

const onVisibleChange=(visible:boolean)=>{
	if(visible) {
		type.value="all"
		list.value=[]
		page=0
		bottom.value=false
		types.value=[]
		getList()
	}
}

const onReachBottom=()=>{
	if(bottom.value) {
		return
	}
	page++
	getList()
}

const onRead=async (item:DCSType<ICommon_Route_Res_Notification_Item>)=>{
	if(!item.is_read) {
		let res=await apiNotification.read({
			notificationId:item.id
		})
		if(res?.code==0) {
			item.is_read=1
			unreadCount.value--
			if(unreadCount.value<0) {
				unreadCount.value=0;
			}
		}
	}
}

const onChange=(value:string)=>{
	list.value=[]
	page=0
	bottom.value=false
	if(value==="all") {
		types.value=[]
	} else if(value==="organization") {
		types.value=[ECommon_Model_Notification_Type.ORGANIZATION_USER_QUIT,ECommon_Model_Notification_Type.ORGANIZATION_INVITATION,ECommon_Model_Notification_Type.ORGANIZATION_USER_REMOVE,ECommon_Model_Notification_Type.ORGANIZATION_USER_ROLE_CHANGE]
	} else if(value==="issue") {
		types.value=[ECommon_Model_Notification_Type.ISSUE_FIELD_CHANGE,ECommon_Model_Notification_Type.ISSUE_REMOVE,ECommon_Model_Notification_Type.ISSUE_ASSIGNER_ASSIGN,ECommon_Model_Notification_Type.ISSUE_WORKFLOW_CHANGE,ECommon_Model_Notification_Type.ISSUE_REPORTER_ASSIGN,ECommon_Model_Notification_Type.ISSUE_COMMENT_ADD,ECommon_Model_Notification_Type.ISSUE_COMMENT_AT,ECommon_Model_Notification_Type.ISSUE_APPROVAL_REJECT,ECommon_Model_Notification_Type.ISSUE_APPROVAL_RESOLVE,ECommon_Model_Notification_Type.ISSUE_ASSIGN_SPRINT,ECommon_Model_Notification_Type.ISSUE_ASSIGN_RELEASE]
	} else if(value==="team") {
		types.value=[ECommon_Model_Notification_Type.TEAM_USER_QUIT,ECommon_Model_Notification_Type.TEAM_USER_ROLE_CHANGE,ECommon_Model_Notification_Type.TEAM_USER_REMOVE,ECommon_Model_Notification_Type.TEAM_DISMISS,ECommon_Model_Notification_Type.TEAM_USER_ADD]
	} else if(value==="calendar") {
		types.value=[ECommon_Model_Notification_Type.CALENDAR_EVENT_INVITATION]
	} else if(value==="wiki") {
		types.value=[ECommon_Model_Notification_Type.WIKI_ITEM_AT]
	}
	getList()
}

const getUnReadCount=async ()=>{
	let res=await apiNotification.unReadCount()
	if(res?.code==0) {
		unreadCount.value=res.data.count
	}
}

onBeforeMount(()=>{
	getUnReadCount()
	eventBus.on(EClient_EVENTBUS_TYPE.REFRESH_NOTIFICATION_UNREAD,getUnReadCount)
})

onBeforeUnmount(()=>{
	eventBus.off(EClient_EVENTBUS_TYPE.REFRESH_NOTIFICATION_UNREAD,getUnReadCount)
})
</script>

<style scoped>

</style>