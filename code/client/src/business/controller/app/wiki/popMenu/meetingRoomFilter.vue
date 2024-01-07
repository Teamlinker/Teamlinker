<template>
	<div style="width: 100%;height: 100%">
		<a-row>
			<a-input-search size="small" style="width: 200px" :placeholder="$t('placeholder.typeMeetingRoomName')" @search="onSearch" v-model="keyword"></a-input-search>
		</a-row>
		<a-row style="margin-top: 10px">
			<a-table style="width: 100%" :pagination="pagination" :row-selection="{
				type:'radio'
			}" :columns="columns" row-key="id" :data="data" v-model:selected-keys="selectedKeys">
				<template #name="{record}">
					{{record.name}}
				</template>
				<template #startTime="{record}">
					{{moment(record.start_time).format("YYYY-MM-DD HH:mm:ss")}}
				</template>
			</a-table>
		</a-row>
	</div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {apiMeeting} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import moment from "moment";
import {ICommon_Model_Meeting_Room} from "../../../../../../../common/model/meeting_room";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const data=ref<DCSType<ICommon_Model_Meeting_Room[]>>([])
const selectedKeys=ref([])
const keyword=ref("")
const {t}=useI18n()
const columns=[
	{
		title:t("util.name"),
		slotName:"name"
	},
	{
		title: t("util.startDate"),
		slotName: "startTime"
	}
]
const pagination=reactive({
	total:0,
	current:1,
	pageSize:10
})
const search=async (page:number)=>{
	let res=await apiMeeting.listRoom({
		page:page-1,
		size:10,
		keyword:keyword.value
	})
	if(res?.code==0) {
		data.value=res.data.data
		pagination.total=res.data.count;
		pagination.current=page
	}
}
const onSearch=()=>{
	search(1)
}
onDialogOk(()=>{
	if(selectedKeys.value.length>0) {
		let id=selectedKeys.value[0]
		return data.value.find(item=>{
			if(item.id===id) {
				return true
			}
		})
	} else {
		return false
	}
})
</script>

<style scoped>

</style>