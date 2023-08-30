<template>
	<div style="width: 100%;height: 100%">
		<a-row>
			<a-input-search size="small" style="width: 200px" placeholder="type project sprint name" @search="onSearch" v-model="keyword"></a-input-search>
		</a-row>
		<a-row style="margin-top: 10px">
			<a-table style="width: 100%" :pagination="pagination" :row-selection="{
				type:'radio'
			}" :columns="columns" row-key="id" :data="data" v-model:selected-keys="selectedKeys">
				<template #name="{record}">
					{{record.name}}
				</template>
				<template #board="{record}">
					{{record.board.name}}
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
import {apiBoard, DCSType} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {ICommon_Route_Res_Board_Sprint_filter_Item} from "../../../../../../../common/routes/response";

const data=ref<DCSType<ICommon_Route_Res_Board_Sprint_filter_Item>[]>([])
const selectedKeys=ref([])
const keyword=ref("")
const columns=[
	{
		title:"Name",
		slotName:"name"
	},
	{
		title: "Board",
		slotName: "board"
	},
	{
		title: "Project",
		slotName: "project"
	}
]
const pagination=reactive({
	total:0,
	current:1,
	pageSize:10
})
const search=async (page:number)=>{
	let res=await apiBoard.filterSprint({
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