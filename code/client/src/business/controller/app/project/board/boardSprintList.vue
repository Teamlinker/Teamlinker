<template>
	<div>
		<a-alert closable style="margin-bottom: 10px">
			{{$t("help.sprint")}}
		</a-alert>
		<a-row style="width: 100%;">
			<a-space>
				{{$t("util.status")}}:
				<a-select size="small" style="width: 100px;" v-model="status">
					<a-option :value="-1">{{$t("util.all")}}</a-option>
					<a-option :value="ECommon_Model_Board_Sprint_Status.NOTSTART">{{$t("controller.app.project.board.boardSprintList.notStart")}}</a-option>
					<a-option :value="ECommon_Model_Board_Sprint_Status.STARTING">{{$t("controller.app.project.board.boardSprintList.starting")}}</a-option>
					<a-option :value="ECommon_Model_Board_Sprint_Status.COMPLETED">{{$t("controller.app.project.board.boardSprintList.completed")}}</a-option>
				</a-select>
				<a-input-search size="small" style="width: 300px" v-model="keyword" @search="onSearch" search-button :placeholder="$t('placeholder.typeSprintName')" v-if="checkPermission(permission,Permission_Types.Project.READ)"></a-input-search>
				<a-button size="small" type="primary" @click="onCreate" v-if="checkPermission(permission,Permission_Types.Project.CREATE)">
					{{$t("util.create")}}
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
						<a-dropdown trigger="hover">
							<a-button size="mini" type="primary" :status="item.status===ECommon_Model_Board_Sprint_Status.COMPLETED?'success':'normal'" @click="$event.stopPropagation(),$event.preventDefault()">
								{{item.status===ECommon_Model_Board_Sprint_Status.NOTSTART?$t("util.notStart"):item.status===ECommon_Model_Board_Sprint_Status.STARTING?$t("util.starting"):$t("util.complete")}}
							</a-button>
							<template #content>
								<a-doption size="mini" type="primary" status="success" @click="onStartSprint(item,$event)" v-if="item.status!==ECommon_Model_Board_Sprint_Status.STARTING">
									{{$t("util.start")}}
								</a-doption>
								<a-doption size="mini" type="outline" status="success" @click="onCompleteSprint(item,$event)" v-else>
									{{$t("util.complete")}}
								</a-doption>
							</template>
						</a-dropdown>
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
						<FieldPriority :priority="item1.priority" only-icon></FieldPriority>
						<a-link @click="onClickIssue(item1)">
							{{key+"-"+item1.unique_id}}&nbsp;
							{{item1.name}}
						</a-link>
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
import {getCurrentInstance, inject, markRaw, onBeforeMount, reactive, ref} from "vue";
import {getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";
import {apiBoard} from "@/business/common/request/request";
import {
	ECommon_Model_Board_Sprint_Status,
	ICommon_Model_Board_Sprint
} from "../../../../../../../common/model/board_sprint";
import {Dialog} from "@/business/common/component/dialog/dialog";
import BoardSprintEdit from "@/business/controller/app/project/board/boardSprintEdit.vue";
import {ICommon_Route_Res_Board_Sprint_Issue_Item} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import moment from "moment/moment";
import {injectProjectInfo} from "@/business/common/util/symbol";
import BoardSprintAddIssue from "@/business/controller/app/project/board/boardSprintAddIssue.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "@/business/common/event/event";
import FieldPriority from "@/business/common/component/field/fieldPriority.vue";
import {useI18n} from "vue-i18n";
import {checkPermission, Permission_Types} from "../../../../../../../common/permission/permission";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	boardId:string
}>()
const keyword=ref("")
const status=ref<ECommon_Model_Board_Sprint_Status>(-1)
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
const permission=objInject.permission
const key=objInject.key
const {t}=useI18n()
const search=async (page:number)=>{
	let res=await apiBoard.listSprint({
		boardId:props.boardId,
		page:page-1,
		size:10,
		keyword:keyword.value,
		...((status.value as number)!==-1 && {
			status:status.value
		})
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
	let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(BoardSprintEdit),{
		type:"add",
		boardId:props.boardId
	})
	if(ret) {
		search(pagination.current)
	}
}

const onAddIssue=async (item:DCSType<ICommon_Model_Board_Sprint>,event:MouseEvent)=>{
	event.stopPropagation()
	let ret=await Dialog.open(root.value,appContext,t("controller.app.project.board.boardKanban.addIssue"),markRaw(BoardSprintAddIssue),{
		boardSprintId:item.id,
		boardId:item.board_id,
		projectId:projectId
	})
	if(ret) {
		onChange([item.id])
	}
}

const onEdit=async (item:DCSType<ICommon_Model_Board_Sprint>,event:MouseEvent)=>{
	event.stopPropagation()
	let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(BoardSprintEdit),{
		type:"edit",
		boardId:props.boardId,
		item
	})
	if(ret) {
		search(pagination.current)
	}
}

const onDelete=async (item:DCSType<ICommon_Model_Board_Sprint>,event:MouseEvent)=>{
	event.stopPropagation()
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteSprint"))
	if(ret) {
		let res=await apiBoard.deleteSprint({
			boardSprintId:item.id
		})
		if(res?.code==0) {
			search(pagination.current)
		}
	}
}

const onStartSprint=async (item:DCSType<ICommon_Model_Board_Sprint>,event:MouseEvent)=>{
	event.stopPropagation()
	let ret=await Dialog.confirm(root.value,appContext,t("tip.startSprint"))
	if(ret) {
		let res=await apiBoard.startSprint({
			boardSprintId:item.id
		})
		if(res?.code==0) {
			search(pagination.current)
		}
	}
}

const onCompleteSprint=async (item:DCSType<ICommon_Model_Board_Sprint>,event:MouseEvent)=>{
	event.stopPropagation()
	let ret=await Dialog.confirm(root.value,appContext,t("tip.completeSprint"))
	if(ret) {
		let res=await apiBoard.completeSprint({
			boardSprintId:item.id
		})
		if(res?.code==0) {
			search(pagination.current)
		}
	}
}

const onRemoveIssue=async (issue:DCSType<ICommon_Route_Res_Board_Sprint_Issue_Item>,sprint:DCSType<ICommon_Model_Board_Sprint>)=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.removeIssueFromSprint"))
	if(ret) {
		let res=await apiBoard.removeProjectIssue({
			projectIssueId:issue.id
		})
		if(res?.code==0) {
			onChange([sprint.id])
		}
	}
}

const onClickIssue=(item:DCSType<ICommon_Route_Res_Board_Sprint_Issue_Item>)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,item.id)
}

onBeforeMount(()=>{
	search(pagination.current)
})

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
	background-color: rgb(247, 247, 247);
}
.sprintIssueList :deep .arco-collapse-item-content-box {
	padding: 0px;
}
</style>