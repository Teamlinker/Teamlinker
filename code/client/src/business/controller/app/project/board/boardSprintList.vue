<template>
	<div>
		<a-row style="width: 100%;">
			<a-space>
				<a-input-search size="small" style="width: 300px" v-model="keyword" @search="onSearch" search-button></a-input-search>
				<a-button size="small" type="primary" @click="onCreate">
					Create
				</a-button>
			</a-space>
		</a-row>
		<a-collapse @change="onChange" v-if="sprintList.length>0" accordion style="margin-top: 20px" class="sprintIssueList">
			<a-collapse-item v-for="item in sprintList" :key="item.id">
				<template #header>
					<a-space>
						<span style="font-weight: bold">{{item.name}}</span>
						<span style="color: grey">
							{{moment(item.start_time).format("MM-DD")}}&nbsp;-&nbsp;{{moment(item.end_time).format("MM-DD")}}
						</span>
					</a-space>
				</template>
				<template #extra>
					<a-space>
						<a-button type="text" @click="onAddIssue(item,$event)">
							<template #icon>
								<icon-plus></icon-plus>
							</template>
						</a-button>
						<a-button type="text" @click="onEdit(item,$event)">
							<template #icon>
								<icon-edit></icon-edit>
							</template>
						</a-button>
						<a-button type="text" status="danger" @click="onDelete(item,$event)">
							<template #icon>
								<icon-delete></icon-delete>
							</template>
						</a-button>
					</a-space>
				</template>
				<a-list :loading="loading" :bordered="false" size="small" hoverable>
					<a-list-item v-for="item1 in sprintIssueList">
						{{item1.name}}
						<template #actions>
							<a-button type="text" status="danger" size="mini" @click="onRemoveIssue(item1,item)">
								<template #icon>
									<icon-delete></icon-delete>
								</template>
							</a-button>
						</template>
					</a-list-item>
				</a-list>
			</a-collapse-item>
		</a-collapse>
		<a-pagination :page-size="10" :total="pagination.total" style="margin-top: 10px" @change="onPageChange"></a-pagination>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, markRaw, reactive, ref} from "vue";
import {getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";
import {apiBoard, DCSType} from "@/business/common/request/request";
import {ICommon_Model_Board_Sprint} from "../../../../../../../common/model/board_sprint";
import {Dialog} from "@/business/common/component/dialog/dialog";
import BoardSprintEdit from "@/business/controller/app/project/board/boardSprintEdit.vue";
import {ICommon_Route_Res_Board_Sprint_Issue_Item} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import moment from "moment/moment";
import {injectProjectInfo} from "@/business/common/util/symbol";
import BoardSprintAddIssue from "@/business/controller/app/project/board/boardSprintAddIssue.vue";

const props=defineProps<{
	boardId:string
}>()
const keyword=ref("")
const pagination=reactive({
	total:0,
	current:1,
	pageSize:10
})
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const sprintList=ref<DCSType<ICommon_Model_Board_Sprint>[]>([])
const sprintIssueList=ref<DCSType<ICommon_Route_Res_Board_Sprint_Issue_Item>[]>([])
const loading=ref(false)
const objInject=inject(injectProjectInfo)
const projectId=objInject.id
const search=async (page:number)=>{
	let res=await apiBoard.listSprint({
		boardId:props.boardId,
		page:page-1,
		size:10,
		keyword:keyword.value
	})
	if(res?.code==0) {
		sprintList.value=res.data.data
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

const onChange=async (keys:string[])=>{
	let id=keys[0]
	if(!id) {
		return
	}
	sprintIssueList.value=[]
	loading.value=true
	let res=await apiBoard.listSprintIssue({
		boardSprintId:id
	})
	if(res?.code==0) {
		sprintIssueList.value=res.data
		loading.value=false
	} else {
		Message.error(res.msg)
		loading.value=false
	}
}

const onCreate=async ()=>{
	let ret=await Dialog.open(root.value,appContext,"Add",markRaw(BoardSprintEdit),{
		type:"add",
		boardId:props.boardId
	})
	if(ret) {
		search(pagination.current)
	}
}

const onAddIssue=async (item:ICommon_Model_Board_Sprint,event:MouseEvent)=>{
	event.stopPropagation()
	let ret=await Dialog.open(root.value,appContext,"Add Issue",markRaw(BoardSprintAddIssue),{
		boardSprintId:item.id,
		boardId:item.board_id,
		projectId:projectId
	})
	if(ret) {
		onChange([item.id])
	}
}

const onEdit=async (item:ICommon_Model_Board_Sprint,event:MouseEvent)=>{
	event.stopPropagation()
	let ret=await Dialog.open(root.value,appContext,"Edit",markRaw(BoardSprintEdit),{
		type:"edit",
		boardId:props.boardId,
		item
	})
	if(ret) {
		search(pagination.current)
	}
}

const onDelete=async (item:ICommon_Model_Board_Sprint,event:MouseEvent)=>{
	event.stopPropagation()
	let ret=await Dialog.confirm(root.value,appContext,"Do you want to delete this sprint?")
	if(ret) {
		let res=await apiBoard.deleteSprint({
			boardSprintId:item.id
		})
		if(res?.code==0) {
			search(pagination.current)
		}
	}
}

const onRemoveIssue=async (issue:DCSType<ICommon_Route_Res_Board_Sprint_Issue_Item>,sprint:ICommon_Model_Board_Sprint)=>{
	let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove this issue from this sprint?")
	if(ret) {
		let res=await apiBoard.removeProjectIssue({
			projectIssueId:issue.id
		})
		if(res?.code==0) {
			onChange([sprint.id])
		}
	}
}

</script>

<style scoped>
.sprintIssueList :deep(div[role="region"]) {
	background-color: white !important;
	padding-left: 5px;
	padding-right: 0px;
}
.sprintIssueList :deep .arco-form-item {
	margin-bottom: 10px;
}
.sprintIssueList :deep .arco-form-item-label {
	font-weight: bold;
}
.sprintIssueList :deep .arco-collapse-item-header {
	background-color: rgb(244, 245, 247);
}
.sprintIssueList :deep .arco-collapse-item-content-box {
	padding: 0px;
}
</style>