<template>
	<div style="width: 100%;height: 100%">
		<a-row>
			<a-input-search size="small" style="width: 200px" :placeholder="$t('placeholder.typeProjectReleaseName')" @search="onSearch" v-model="keyword"></a-input-search>
		</a-row>
		<a-row style="margin-top: 10px">
			<a-table style="width: 100%" :pagination="pagination" :row-selection="{
				type:'radio'
			}" :columns="columns" row-key="id" :data="data" v-model:selected-keys="selectedKeys">
				<template #name="{record}">
					{{record.name}}
				</template>
				<template #status="{record}">
					<a-tag color="blue" v-if="record.status===ECommon_Model_Project_Release_Status.UNRELEASE">{{$t("util.unReleased")}}</a-tag>
					<a-tag color="green" v-else-if="record.status===ECommon_Model_Project_Release_Status.RELEASE">{{$t("util.released")}}</a-tag>
					<a-tag v-else-if="record.status===ECommon_Model_Project_Release_Status.ARCHIVED">{{$t("util.archived")}}</a-tag>
				</template>
				<template #project="{record}">
					{{record.project.name}}
				</template>
			</a-table>
		</a-row>
	</div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {apiRelease} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {ICommon_Route_Res_Release_Item} from "../../../../../../../common/routes/response";
import {ECommon_Model_Project_Release_Status} from "../../../../../../../common/model/project_release";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const data=ref<DCSType<ICommon_Route_Res_Release_Item>[]>([])
const selectedKeys=ref([])
const keyword=ref("")
const {t}=useI18n()
const columns=[
	{
		title:t("util.name"),
		slotName:"name"
	},
	{
		title: t("util.status"),
		slotName: "status"
	},
	{
		title: t("util.project"),
		slotName: "project"
	}
]
const pagination=reactive({
	total:0,
	current:1,
	pageSize:10
})
const search=async (page:number)=>{
	let res=await apiRelease.list({
		page:page-1,
		size:10,
		name:keyword.value
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