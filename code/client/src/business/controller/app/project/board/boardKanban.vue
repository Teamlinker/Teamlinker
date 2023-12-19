<template>
	<div style="width: 100%;height: 100%">
		<a-alert closable style="margin-bottom: 10px">
			{{$t("help.kanban")}}
		</a-alert>
		<a-row style="width: 100%;height: 30px;padding-left: 10px">
			<a-space>
				<a-select v-model="sprintId" allow-search allow-clear @search="onSearch" size="small">
					<a-option v-for="item in sprintList" :label="item.name" :value="item.id"></a-option>
				</a-select>
				<a-button type="primary" size="small" @click="onGo">
					{{$t("util.go")}}
				</a-button>
			</a-space>
		</a-row>
		<div style="width: 100%;margin-top: 20px;overflow: auto;height: calc(100% - 140px)">
			<Card v-if="sprintInfo" :data="cardData" type="fixed" :gap="10" :rect="{
				width:230,
				height:swimLaneList.length*250+30
			}" readonly style="overflow: visible">
				<template #header="props">
					<a-row style="height: 100%;display: flex;align-items: center;justify-content: center;padding: 0 5px;box-sizing: border-box">
						<span style="color: grey">{{props.item.name}}</span>
					</a-row>
				</template>
				<template #body="props">
					<a-row style="height: 100%;width: 100%;flex-direction: column;background-color: rgb(249,249,249)">
						<a-row style="flex: 1 1 0px;width: 100%;padding: 5px 5px;box-sizing: border-box;overflow-y: auto" :style="{borderBottom:index!==swimLaneList.length-1?'1px lightgray solid':''}" v-for="(item,index) in swimLaneList" @dragover="onDragOver(item,props.item.id,$event)" @drop="onDrop(item,props.item.id,$event)">
							<a-space direction="vertical" style="width: 100%" v-if="issueMap?.[item.id]?.[props.item.id]">
								<div v-for="item1 in issueMap[item.id][props.item.id]" style="height: 80px;border-radius: 5px;background-color: white;box-shadow: 0 2px 12px 0 rgba(45,45,46,.05), 0 2px 4px 0 rgba(45,45,46,.1);padding: 5px;box-sizing: border-box"  :draggable="sprintInfo.status!==ECommon_Model_Board_Sprint_Status.COMPLETED" @dragstart="onDragStart(item1,props.item.id,item.id,$event)" @dragend="onDragEnd(item1,props.item.id,item.id,$event)" :style="{cursor:sprintInfo.status!==ECommon_Model_Board_Sprint_Status.COMPLETED?'move':'normal'}">
									<div style="width: 100%;height: 40px;overflow: hidden;text-overflow: ellipsis;word-break: break-all">
										<a style="color: dodgerblue;cursor: pointer" @click="onClickIssue(item1.project_id,item1.id)" :title="item1.name">
											<FieldPriority :priority="item1.priority" only-icon></FieldPriority>
											[{{item1.issueType.name}}]
											&nbsp;{{key+"-"+item1.unique_id}}&nbsp;{{item1.name}}
										</a>
									</div>
									<a-row style="width: 100%;height: 30px;justify-content: space-between;align-items: center">
										<UserAvatar :organization-user-id="item1.assigner_id.organizationUserId" v-if="item1.assigner_id" only-photo></UserAvatar>
										<span v-else></span>
										<a-dropdown-button size="mini" @popupVisibleChange="(visible:boolean)=>{onPopupVisibleChange(item1.id,visible)}" :type="item1.workflowNode.status===ECommon_Model_Workflow_Node_Status.NOTSTART?'secondary':'primary'" :status="item1.workflowNode.status===ECommon_Model_Workflow_Node_Status.DONE?'success':'normal'" v-if="sprintInfo.status!==ECommon_Model_Board_Sprint_Status.COMPLETED">
											<div style="overflow: hidden;text-overflow: ellipsis;max-width: 120px">
												{{calculateApprovalName(item1)}}
											</div>
											<template #icon>
												<icon-down />
											</template>
											<template #content>
												<a-doption v-if="actionList" v-for="item in actionList as any[]" :key="item.isApproval?item.type:item.id" @click="onAction(item1.id,item)">{{item.isApproval?approvalMap[item.type]:item.name}}</a-doption>
												<a-spin loading v-else></a-spin>
											</template>
										</a-dropdown-button>
										<a-button size="mini" v-else>
											<div style="overflow: hidden;text-overflow: ellipsis;max-width: 140px">
												{{calculateApprovalName(item1)}}
											</div>
										</a-button>
									</a-row>
								</div>
							</a-space>
						</a-row>
					</a-row>
				</template>
				<template #pinHeader>
					<a-row style="height: 100%;display: flex;align-items: center;justify-content: space-between;padding: 0 5px;box-sizing: border-box;">
						<a-space>
							<span style="color: grey">{{$t("util.swimLane")}}</span>
							<span :style="{color: sprintInfo.status!==ECommon_Model_Board_Sprint_Status.COMPLETED?'dodgerblue':'rgb(0,180,42)'}">
								({{sprintInfo.status===ECommon_Model_Board_Sprint_Status.NOTSTART?$t("util.notStart"):sprintInfo.status===ECommon_Model_Board_Sprint_Status.STARTING?$t("util.starting"):$t("util.completed")}})
							</span>
							<a-popover trigger="hover" position="right">
								<icon-question-circle-fill style="color: rgb(35,110,184)"></icon-question-circle-fill>
								<template #content>
					    <span style="color: dodgerblue;white-space: pre-line">
								{{$t("help.swimLane")}}
					    </span>
								</template>
							</a-popover>
						</a-space>
						<a-button size="mini" type="text" @click="onAddSwimLane" v-if="sprintInfo.status!==ECommon_Model_Board_Sprint_Status.COMPLETED">
							<template #icon>
								<icon-plus></icon-plus>
							</template>
						</a-button>
					</a-row>
				</template>
				<template #pinBody>
					<a-row style="height: 100%;width: 100%;flex-direction: column;background-color: rgb(249,249,249);">
						<a-row style="flex: 1 1 0px;width: 100%;padding: 5px 5px;box-sizing: border-box;overflow-y: auto;justify-content: center" :style="{borderBottom:index!==swimLaneList.length-1?'1px lightgray solid':''}" v-for="(item,index) in swimLaneList">
							<a-row v-if="item.id!=='_'" style="width: calc(100% - 10px);">
								<div style="width: 100%;align-items: center;word-break: break-all;">
									<FieldPriority :priority="item.priority" only-icon></FieldPriority>&nbsp;
									{{item.name}}&nbsp;
									<span style="color: grey;font-size: smaller">{{moment(item.created_time).format("MM-DD")}}</span>
								</div>
								<a-row style="width: 100%;align-items: center;justify-content: space-between" v-if="sprintInfo.status!==ECommon_Model_Board_Sprint_Status.COMPLETED">
									<a-space size="mini">
										<a-button size="mini" type="text" @click="onAddIssue(item)">
											<template #icon>
												<icon-plus></icon-plus>
											</template>
										</a-button>
										<a-button size="mini" type="text" @click="onEditSwimLane(item)">
											<template #icon>
												<icon-edit></icon-edit>
											</template>
										</a-button>
									</a-space>
									<a-button size="mini" type="text" status="danger" @click="onDeleteSwimLane(item)">
										<template #icon>
											<icon-delete></icon-delete>
										</template>
									</a-button>
								</a-row>
							</a-row>
							<template v-else>
								{{item.name}}
							</template>
						</a-row>
					</a-row>
				</template>
			</Card>
		</div>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, markRaw, onBeforeMount, ref} from "vue";
import {apiBoard, apiIssue} from "@/business/common/request/request";
import {
	ECommon_Model_Board_Sprint_Status,
	ICommon_Model_Board_Sprint
} from "../../../../../../../common/model/board_sprint";
import {
	ICommon_Route_Res_Board_Column_Workflow_Node_Item,
	ICommon_Route_Res_Board_Sprint_Info,
	ICommon_Route_Res_Board_Sprint_Info_Issue
} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import Card from "@/business/common/component/card/card.vue";
import {ICommon_Model_Board_Column} from "../../../../../../../common/model/board_column";
import {ICommon_Model_Board_Sprint_SwimLane} from "../../../../../../../common/model/board_sprint_swimlane";
import {Dialog} from "@/business/common/component/dialog/dialog";
import {getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";
import BoardSwimLaneEdit from "@/business/controller/app/project/board/boardSwimLaneEdit.vue";
import FieldPriority from "@/business/common/component/field/fieldPriority.vue";
import moment from "moment/moment";
import BoardSwimLaneAddIssue from "@/business/controller/app/project/board/boardSwimLaneAddIssue.vue";
import {injectProjectInfo} from "@/business/common/util/symbol";
import BoardIssueFields from "@/business/controller/app/project/board/boardIssueFields.vue";
import UserAvatar from "@/business/common/component/userAvatar.vue";
import {ICommon_Model_Workflow_Action} from "../../../../../../../common/model/workflow_action";
import ProjectIssueNext from "@/business/controller/app/project/issue/projectIssueNext.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "@/business/common/event/event";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import {
	ECommon_Model_Project_Issue_Approval_Action,
	ECommon_Model_Project_Issue_Approval_Type
} from "../../../../../../../common/model/project_issue_approval";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

moment;
const props=defineProps<{
	boardId:string,
	boardSprintId?:string
}>()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const sprintId=ref("")
const sprintList=ref<DCSType<ICommon_Model_Board_Sprint>[]>([])
const sprintInfo=ref<DCSType<ICommon_Route_Res_Board_Sprint_Info>>()
const {t}=useI18n()
const approvalMap={
	[ECommon_Model_Project_Issue_Approval_Action.COMMIT]:t("util.commit"),
	[ECommon_Model_Project_Issue_Approval_Action.RESOLVE]:t("util.resolve"),
	[ECommon_Model_Project_Issue_Approval_Action.REJECT]:t("util.reject"),
	[ECommon_Model_Project_Issue_Approval_Action.REVOKE]:t("util.revoke")
}
const cardData=ref<{
	id:string,
	name:string,
	data:DCSType<ICommon_Model_Board_Column>
}[]>([])
const swimLaneList=ref<DCSType<ICommon_Model_Board_Sprint_SwimLane>[]>([])
const issueMap=ref<{
	[swimLaneId:string]:{
		[columnId:string]:DCSType<ICommon_Route_Res_Board_Sprint_Info_Issue>[]
	}
}>()
const workflowNodeMap=ref<{
	[columnId:string]:DCSType<ICommon_Route_Res_Board_Column_Workflow_Node_Item>[]
}>()
const objInject=inject(injectProjectInfo)
const key=objInject.key
const projectId=objInject.id
let maskElement:HTMLElement
let objDrag:{
	workflowNodeId:string,
	swimLaneId:string,
	projectIssueId:string,
	columnId:string
}
const actionList=ref<DCSType<ICommon_Model_Workflow_Action>[] | {
	isApproval:true,
	type:ECommon_Model_Project_Issue_Approval_Action
}[]>()
const onSearch=async (keyword:string)=>{
	let res=await apiBoard.listSprint({
		boardId:props.boardId,
		keyword:keyword,
		size:10,
		page:0
	})
	if(res?.code==0) {
		sprintList.value=res.data.data
	}
}

const onGo=async ()=>{
	if(!sprintId.value) {
		Message.error(t("tip.selectSprint"))
		return
	}
	let [resSprintInfo,resListColumn]=await Promise.all([
		apiBoard.sprintInfo({
			boardSprintId:sprintId.value
		}),
		apiBoard.listColumn({
			boardId:props.boardId
		})
	])
	if(resSprintInfo?.code==0 && resListColumn?.code==0) {
		sprintInfo.value=resSprintInfo.data
		handleSwimLaneList(resSprintInfo.data.swimLanes)
		cardData.value=resListColumn.data.map(item=>{
			return {
				id:item.id,
				name:item.name,
				data:item
			}
		})
		let arr=await Promise.all(resListColumn.data.map(item=>{
			return apiBoard.listWorkflowNode({
				boardColumnId:item.id
			})
		}))
		workflowNodeMap.value={}
		for(let i=0;i<resListColumn.data.length;i++) {
			let objColumn=resListColumn.data[i]
			workflowNodeMap.value[objColumn.id]=arr[i].data
		}
		handleIssue(resSprintInfo.data.issues)
	} else {
		Message.error(resSprintInfo.msg || resListColumn.msg)
	}
}

const refreshIssue=async ()=>{
	let res=await apiBoard.sprintInfo({
		boardSprintId:sprintId.value
	})
	handleIssue(res.data.issues)
}

const handleIssue=(list:DCSType<(ICommon_Route_Res_Board_Sprint_Info_Issue & {
	swimLaneId:string
})>[])=>{
	issueMap.value={}
	for(let obj of list) {
		let swimLaneId=""
		if(obj.swimLaneId) {
			swimLaneId=obj.swimLaneId
		} else {
			swimLaneId="_"
		}
		if(!issueMap.value[swimLaneId]) {
			issueMap.value[swimLaneId]={}
		}
		let columnId=getColumnId(obj)
		if(columnId) {
			if(!issueMap.value[swimLaneId][columnId]) {
				issueMap.value[swimLaneId][columnId]=[]
			}
			issueMap.value[swimLaneId][columnId].push(obj)
		}
		for(let swimLaneId in issueMap.value) {
			for(let columnId in issueMap.value[swimLaneId]) {
				let value=issueMap.value[swimLaneId][columnId]
				value.sort((a, b) => {
					if(a.priority===b.priority) {
						if(a.unique_id>b.unique_id) {
							return 1
						} else {
							return -1
						}
					} else {
						return b.priority-a.priority
					}
				})
			}
		}
	}
}

const refreshSwimLane=async ()=>{
	let res=await apiBoard.listSwimLane({
		boardSprintId:sprintId.value
	})
	if(res?.code==0) {
		handleSwimLaneList(res.data)
	}
}

const handleSwimLaneList=(list:DCSType<ICommon_Model_Board_Sprint_SwimLane>[])=>{
	swimLaneList.value=list
	swimLaneList.value.sort((a, b) => {
		if(a.priority===b.priority) {
			if(a.created_time<b.created_time) {
				return 1
			} else {
				return -1
			}
		} else {
			return b.priority-a.priority
		}
	})
	swimLaneList.value.push({
		id:"_",
		name:t("util.unNamed"),
		priority:null,
		board_sprint_id:sprintId.value,
		board_id:props.boardId,
		created_time:null
	})
}

const onAddSwimLane=async ()=>{
	let ret=await Dialog.open(root.value,appContext,t("controller.app.project.board.boardKanban.addSwimLane"),markRaw(BoardSwimLaneEdit),{
		type:"add",
		boardSprintId:sprintId.value
	})
	if(ret) {
		refreshSwimLane()
	}
}

const onEditSwimLane=async (item:DCSType<ICommon_Model_Board_Sprint_SwimLane>)=>{
	let ret=await Dialog.open(root.value,appContext,t("controller.app.project.board.boardKanban.editSwimLane"),markRaw(BoardSwimLaneEdit),{
		type:"edit",
		item:item
	})
	if(ret) {
		refreshSwimLane()
	}
}

const onDeleteSwimLane=async (item:DCSType<ICommon_Model_Board_Sprint_SwimLane>)=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteSwimLane"))
	if(ret) {
		let res=await apiBoard.deleteSwimLane({
			boardSprintSwimLaneId:item.id
		})
		if(res?.code==0) {
			refreshSwimLane()
			refreshIssue()
		}
	}
}

const onAddIssue=async (item:DCSType<ICommon_Model_Board_Sprint_SwimLane>)=>{
	let ret=await Dialog.open(root.value,appContext,t("controller.app.project.board.boardKanban.addIssue"),markRaw(BoardSwimLaneAddIssue),{
		boardSprintSwimLaneId:item.id,
		boardSprintId:item.board_sprint_id,
		projectKey:key.value
	})
	if(ret) {
		refreshIssue()
	}
}

const onDragOver=(item:DCSType<ICommon_Model_Board_Sprint_SwimLane>,columnId:string,event:DragEvent)=>{
	event.stopPropagation()
	event.preventDefault()
	if(sprintInfo.value.status==ECommon_Model_Board_Sprint_Status.COMPLETED) {
		return
	}
	let ele=event.currentTarget as HTMLElement
	let rect=ele.getBoundingClientRect()
	if(objDrag.swimLaneId!==item.id || objDrag.columnId!==columnId) {
		event.dataTransfer.dropEffect="copy"
		if(!maskElement) {
			maskElement=document.createElement("div")
			maskElement.style.position="absolute"
			document.body.appendChild(maskElement)
			maskElement.style.backgroundColor="rgba(50,144,202,0.2)"
			maskElement.style.zIndex="10000"
			maskElement.style.pointerEvents="none"
			maskElement.style.border="1px dashed blue"
		}
		maskElement.style.left=rect.x+"px"
		maskElement.style.top=rect.y+"px"
		maskElement.style.width=rect.width+"px"
		maskElement.style.height=rect.height+"px"
	} else {
		event.dataTransfer.dropEffect="none"
		if(maskElement) {
			maskElement.remove()
			maskElement=null;
		}
	}
}

const onDrop=async (item:DCSType<ICommon_Model_Board_Sprint_SwimLane>,columnId:string,event:DragEvent)=>{
	event.stopPropagation()
	event.preventDefault()
	if(sprintInfo.value.status==ECommon_Model_Board_Sprint_Status.COMPLETED) {
		return
	}
	if(objDrag.swimLaneId!==item.id || objDrag.columnId!==columnId) {
		let objDragCopy=Object.assign({},objDrag)
		if(objDragCopy.columnId===columnId) {
			let res=await apiBoard.addProjectIssue({
				projectIssueId:objDragCopy.projectIssueId,
				boardSprintId:sprintId.value,
				...(item.id!=="_" && {
					boardSprintSwimLaneId:item.id
				})
			})
			if(res?.code==0) {
				refreshIssue()
			}
		} else {
			let res=await apiBoard.checkIssueAction({
				projectIssueId:objDragCopy.projectIssueId,
				boardColumnId:columnId,
				boardSprintId:sprintId.value
			})
			if(res?.code==0) {
				let nextActionList=res.data.nextActionList
				if(res.data.isDirect && nextActionList.length>0) {
					let res=await apiIssue.confirmNextNode({
						projectIssueId:objDragCopy.projectIssueId,
						workflowActionId:nextActionList[0].id
					})
					if(res?.code==0) {
						if(objDragCopy.swimLaneId!==item.id) {
							let res=await apiBoard.addProjectIssue({
								projectIssueId:objDragCopy.projectIssueId,
								boardSprintId:sprintId.value,
								...(item.id!=="_" && {
									boardSprintSwimLaneId:item.id
								})
							})
							if(res?.code==0) {
								refreshIssue()
							}
						} else {
							refreshIssue()
						}
					}
				} else if(nextActionList.length>0) {
					let ret=await Dialog.open(root.value,appContext,t("controller.app.project.board.boardKanban.selectAction"),markRaw(BoardIssueFields),{
						projectId:projectId,
						projectIssueId :objDragCopy.projectIssueId,
						workflowActionList:nextActionList
					})
					if(ret) {
						if(objDragCopy.swimLaneId!==item.id) {
							let res=await apiBoard.addProjectIssue({
								projectIssueId:objDragCopy.projectIssueId,
								boardSprintId:sprintId.value,
								...(item.id!=="_" && {
									boardSprintSwimLaneId:item.id
								})
							})
							if(res?.code==0) {
								refreshIssue()
							}
						} else {
							refreshIssue()
						}
					}
				} else if(nextActionList.length==0) {
					Message.error(t("tip.notMoveToColumn"))
				}
			}
		}
	}
}

const onDragStart=(item:DCSType<ICommon_Route_Res_Board_Sprint_Info_Issue>,columnId:string,swimLaneId:string,event:DragEvent)=>{
	if(sprintInfo.value.status==ECommon_Model_Board_Sprint_Status.COMPLETED) {
		return
	}
	objDrag={
		workflowNodeId:item.workflow_node_id,
		columnId:columnId,
		projectIssueId:item.id,
		swimLaneId:swimLaneId
	}
}

const onDragEnd=(item:DCSType<ICommon_Route_Res_Board_Sprint_Info_Issue>,columnId:string,swimLaneId:string,event:DragEvent)=>{
	if(sprintInfo.value.status==ECommon_Model_Board_Sprint_Status.COMPLETED) {
		return
	}
	objDrag=null
	if(maskElement) {
		maskElement.remove()
		maskElement=null;
	}
}

const onPopupVisibleChange=(projectIssueId:string,visible:boolean)=>{
	if(visible) {
		actionList.value=null
		getActionList(projectIssueId)
	}
}

const onClickIssue=(projectId:string,projectIssueId:string)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,projectIssueId)
}

const onAction=async (projectIssueId:string,item:ICommon_Model_Workflow_Action | {
	isApproval:true,
	type:ECommon_Model_Project_Issue_Approval_Action
})=>{
	if("isApproval" in item) {
		if(item.type===ECommon_Model_Project_Issue_Approval_Action.REVOKE) {
			let res=await apiIssue.revokeApproval({
				projectIssueId:projectIssueId
			})
			if(res?.code!=0) {
				Message.error(res.msg)
				return
			}
		} else if(item.type==ECommon_Model_Project_Issue_Approval_Action.RESOLVE) {
			let res=await apiIssue.resolveApproval({
				projectIssueId:projectIssueId
			})
			if(res?.code!=0) {
				Message.error(res.msg)
				return
			}
		} else if(item.type==ECommon_Model_Project_Issue_Approval_Action.REJECT) {
			let ret:any=await Dialog.inputRich(root.value,appContext,t("tip.rejectReason"))
			if(ret) {
				let res=await apiIssue.rejectApproval({
					projectIssueId:projectIssueId,
					reason:JSON.stringify(ret.map(item=>{
						return {
							arr:item.arr
						}
					}))
				})
				if(res?.code!=0) {
					Message.error(res.msg)
					return
				}
			} else {
				return
			}
		} else if(item.type==ECommon_Model_Project_Issue_Approval_Action.COMMIT) {
			let res=await apiIssue.commitApproval({
				projectIssueId:projectIssueId
			})
			if(res?.code!=0) {
				Message.error(res.msg)
				return
			}
		}
	} else {
		let res=await apiIssue.getNextNodeFields({
			projectIssueId:projectIssueId,
			workflowActionId:item.id
		})
		if(res?.code==0) {
			if(res.data.length>0) {
				let ret=await Dialog.open(root.value,appContext,item.name,markRaw(ProjectIssueNext),{
					projectId:projectId,
					projectIssueId:projectIssueId,
					workflowActionId:item.id,
					items:res.data
				})
				if(!ret) {
					return
				}
			} else {
				await apiIssue.confirmNextNode({
					projectIssueId:projectIssueId,
					workflowActionId:item.id
				})
			}
		} else {
			Message.error(res.msg)
			return
		}
	}
	refreshIssue()
}

const getActionList=async (projectIssueId:string)=>{
	let res=await apiIssue.actionsInfo({
		projectIssueId:projectIssueId
	})
	if(res?.code==0) {
		actionList.value=res.data
	}
}

const getColumnId=(item:DCSType<ICommon_Route_Res_Board_Sprint_Info_Issue>)=>{
	for(let columnId in workflowNodeMap.value) {
		let arr=workflowNodeMap.value[columnId]
		for(let obj of arr) {
			if(obj.workflowNode.id===item.workflowNode.id) {
				return columnId
			}
		}
	}
}

const calculateApprovalName=(item:DCSType<ICommon_Route_Res_Board_Sprint_Info_Issue>)=>{
	if(item.approval) {
		if(item.approval.type===ECommon_Model_Project_Issue_Approval_Type.PENDING) {
			return `${item.approval.workflowNode.name}(Wait For Approval)`
		} else if(item.approval.type===ECommon_Model_Project_Issue_Approval_Type.RESOLVED) {
			return item.workflowNode.name
		} else if(item.approval.type===ECommon_Model_Project_Issue_Approval_Type.REJECTED) {
			return `${item.approval.workflowNode.name}(Rejected)`
		}
	} else {
		return item.workflowNode.name
	}
}

onBeforeMount(async ()=>{
	if(props.boardSprintId) {
		sprintId.value=props.boardSprintId
		await onGo()
		if(sprintInfo.value) {
			sprintList.value=[sprintInfo.value]
		}
	} else {
		onSearch("")
	}
})
</script>

<style scoped>

</style>