<template>
	<div style="width: 100%;height: 100%">
		<a-row>
			<a-input-search size="small" style="width: 200px" :placeholder="$t('placeholder.typeWikiItemName')" @search="onSearch" v-model="keyword"></a-input-search>
		</a-row>
		<a-row style="margin-top: 10px">
			<a-table style="width: 100%" :pagination="pagination" :row-selection="{
				type:'radio'
			}" :columns="columns" row-key="id" :data="data" v-model:selected-keys="selectedKeys">
				<template #name="{record}">
					{{record.name}}
				</template>
				<template #wiki="{record}">
					{{record.wiki.name}}
				</template>
			</a-table>
		</a-row>
	</div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import {apiWiki} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {ICommon_Route_Res_Wiki_Item_Info} from "../../../../../../../common/routes/response";
import wiki from "../../../../../../../common/routes/wiki";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const data=ref<DCSType<ICommon_Route_Res_Wiki_Item_Info>[]>([])
const selectedKeys=ref([])
const keyword=ref("")
const {t}=useI18n()
const columns=[
	{
		title:t("util.name"),
		slotName:"name"
	},
	{
		title: t("util.wikiSpace"),
		slotName: "wiki"
	}
]
const pagination=reactive({
	total:0,
	current:1,
	pageSize:10
})
const search=async (page:number)=>{
	let res=await apiWiki.filterWikiItem({
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