<template>
	<div>
		<a-row>
			<a-space wrap>
				<a-input-search v-model="keyword" placeholder="please type board name" style="width: 250px" @search="onSearch"></a-input-search>
				<a-button type="primary" @click="onCreate" v-if="checkPermission(permission,Permission_Types.Project.EDIT)">Create</a-button>
			</a-space>
		</a-row>
		<a-table style="margin-top: 10px" :columns="columns" :data="boardList" :pagination="pagination" @pageChange="onPageChange">
			<template #name="{record}">
				<a-link href="javascript:void(0)" @click="onProfile(record,$event)">{{record.name}}</a-link>
			</template>
			<template #description="{record}">
				{{record.description}}
			</template>
			<template #operation="{record}">
				<a-space v-if="checkPermission(permission,Permission_Types.Project.EDIT)" wrap>
					<a-button size="small" @click="onEdit(record)">Edit</a-button>
					<a-button size="small" status="danger" @click="onDelete(record)">Delete</a-button>
				</a-space>
			</template>
		</a-table>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, markRaw, reactive, ref} from "vue";
import {injectProjectInfo} from "../../../../common/util/symbol";
import {apiBoard, DCSType} from "../../../../common/request/request";
import {checkPermission, Permission_Types} from "../../../../../../../common/permission/permission";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {
	ETeamOS_Navigator_Action,
	getCurrentNavigator,
	getRootNavigatorRef,
	onNavigatorShow
} from "../../../../../teamOS/common/component/navigator/navigator";
import {Message} from "@arco-design/web-vue";
import {ICommon_Model_Board} from "../../../../../../../common/model/board";
import BoardEdit from "@/business/controller/app/project/board/boardEdit.vue";

const objInject=inject(injectProjectInfo)
const projectId=objInject.id
const permission=objInject.permission
const key=objInject.key
const columns=[
	{
		title:"Name",
		slotName:"name"
	},
	{
		title:"Description",
		slotName: "description"
	},
	{
		title:"Operation",
		slotName: "operation"
	}
]
const pagination=reactive({
	total:0,
	current:1,
	pageSize:10
})
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const keyword=ref("")
const boardList=ref<DCSType<ICommon_Model_Board[]>>([])
const navigator=getCurrentNavigator()
const search=async (page:number)=>{
	let res=await apiBoard.listBoard({
		projectId:projectId,
		page:page-1,
		size:10,
		keyword:keyword.value
	})
	if(res?.code==0) {
		boardList.value=res.data.data
		pagination.total=res.data.count;
		pagination.current=page
	}
}
const onSearch=()=>{
	search(1)
}
const onPageChange=(page:number)=>{
	search(page)
}
const onCreate=async ()=>{
	let ret=await Dialog.open(root.value,appContext,"Add",markRaw(BoardEdit),{
		type:"add",
		projectId:projectId
	})
	if(ret) {
		search(pagination.current)
	}
}
const onEdit=async (item:DCSType<ICommon_Model_Board>)=>{
	let ret=await Dialog.open(root.value,appContext,"Edit",markRaw(BoardEdit),{
		type:"edit",
		projectId:projectId,
		item:item
	})
	if(ret) {
		search(pagination.current)
	}
}
const onDelete=async (item:DCSType<ICommon_Model_Board>)=>{
	let ret=await Dialog.confirm(root.value,appContext,"Do you want to delete this board?")
	if(ret) {
		let res=await apiBoard.deleteBoard({
			boardId:item.id
		})
		if(res?.code==0) {
			Message.success("delete success")
			search(pagination.current)
		}
	}
}
const onProfile=async (item:DCSType<ICommon_Model_Board>,event:MouseEvent)=>{
	navigator.push("boardProfile",{
		boardId:item.id
	})
}
onNavigatorShow(action => {
	if(action===ETeamOS_Navigator_Action.POP || action===ETeamOS_Navigator_Action.BACK) {
		search(pagination.current)
	}
})
</script>

<style scoped>

</style>