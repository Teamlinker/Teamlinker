<template>
	<div style="width: 100%;height: 100%">
		<a-row style="width: 100%;height: 30px;padding-left: 10px">
			<a-space>
				<a-button type="primary" size="small" @click="onAddColumn">
					{{$t("controller.app.project.board.boardConfig.addColumn")}}
				</a-button>
				<a-popover trigger="hover" position="right">
					<icon-question-circle-fill style="color: rgb(35,110,184)"></icon-question-circle-fill>
					<template #content>
						<span style="color: dodgerblue;white-space: pre-line">
							{{$t("help.column")}}
						</span>
					</template>
				</a-popover>
			</a-space>
		</a-row>
		<div style="width: 100%;margin-top: 20px;overflow: auto;height: calc(100% - 90px)">
			<Card v-if="workflowUnSetNodeMap" :data="cardData" type="fixed" :gap="10" :rect="{
				width:180,
				height:issueTypeList.length*250+30
			}" @change="onColumnChange">
				<template #header="props">
					<a-row style="height: 100%;display: flex;align-items: center;justify-content: space-between;padding: 0 5px;box-sizing: border-box">
						<span style="color: grey">{{props.item.name}}</span>
						<a-space size="mini">
							<a-button type="text" size="mini" @click="onEditColumn(props.item.id,props.item.name)">
								<template #icon>
									<icon-edit></icon-edit>
								</template>
							</a-button>
							<a-button type="text" size="mini" status="danger" @click="onDeleteColumn(props.item.id)">
								<template #icon>
									<icon-delete></icon-delete>
								</template>
							</a-button>
						</a-space>
					</a-row>
				</template>
				<template #body="props">
					<a-row style="height: 100%;width: 100%;flex-direction: column">
						<a-row style="flex: 1 1 0px;width: 100%;padding: 5px 5px;box-sizing: border-box;overflow-y: auto" :style="{borderBottom:index!==issueTypeList.length-1?'1px lightgray solid':''}" v-for="(item,index) in issueTypeList" @dragover="onDragOver(item,props.item.id,$event)" @drop="onDrop(item,props.item.id,$event)">
							<a-space direction="vertical" style="width: 100%" v-if="workflowNodeMap?.[props.item.id].filter(obj=>obj.issueType.id===item.id)">
								<div v-for="item1 in workflowNodeMap[props.item.id].filter(obj=>obj.issueType.id===item.id)" style="height: 30px;border-radius: 5px;display: flex;justify-content: center;align-items: center;cursor: move" :style="{backgroundColor:item1.workflowNode.status===ECommon_Model_Workflow_Node_Status.NOTSTART?'rgb(215, 218, 224)':item1.workflowNode.status===ECommon_Model_Workflow_Node_Status.INPROGRESS?'blue':'green',color:item1.workflowNode.status===ECommon_Model_Workflow_Node_Status.NOTSTART?'black':item1.workflowNode.status===ECommon_Model_Workflow_Node_Status.INPROGRESS?'white':'white'}" draggable="true" @dragstart="onDragStart(item1.workflowNode,props.item.id,$event)" @dragend="onDragEnd(item1.workflowNode,props.item.id,$event)">
									{{item1.workflowNode.name}}
								</div>
							</a-space>
						</a-row>
					</a-row>
				</template>
				<template #pinHeader>
					<a-row style="height: 100%;display: flex;align-items: center;justify-content: space-between;padding: 0 5px;box-sizing: border-box;">
						<a-space size="mini">
							<span style="color: grey">{{$t("util.issueType")}}</span>
							<a-popover trigger="hover" position="right">
								<icon-question-circle-fill style="color: rgb(35,110,184)"></icon-question-circle-fill>
								<template #content>
					        <span style="color: dodgerblue;white-space: pre-line">
										{{$t("help.boardIssueType")}}
					        </span>
								</template>
							</a-popover>
						</a-space>
						<a-button type="text" size="mini" @click="onAddIssueType">
							<template #icon>
								<icon-plus></icon-plus>
							</template>
						</a-button>
					</a-row>
				</template>
				<template #pinBody>
					<a-row style="height: 100%;width: 100%;flex-direction: column;">
						<a-row style="flex: 1 1 0px;width: 100%;padding: 5px 5px;box-sizing: border-box;overflow-y: auto" :style="{borderBottom:index!==issueTypeList.length-1?'1px lightgray solid':''}" v-for="(item,index) in issueTypeList" @dragover="onDragOver(item,null,$event)" @drop="onDrop(item,null,$event)">
							<a-space direction="vertical" style="width: 100%">
								<a-row style="width: 100%;justify-content: space-between;align-items: center">
									{{item.name}}:
									<a-button type="text" status="danger" size="mini" @click="onDeleteIssueType(item)">
										<template #icon>
											<icon-delete></icon-delete>
										</template>
									</a-button>
								</a-row>
								<div v-for="item1 in workflowUnSetNodeMap[item.id]" style="height: 30px;border-radius: 5px;display: flex;justify-content: center;align-items: center;cursor: move" :style="{backgroundColor:item1.status===ECommon_Model_Workflow_Node_Status.NOTSTART?'rgb(215, 218, 224)':item1.status===ECommon_Model_Workflow_Node_Status.INPROGRESS?'blue':'green',color:item1.status===ECommon_Model_Workflow_Node_Status.NOTSTART?'black':item1.status===ECommon_Model_Workflow_Node_Status.INPROGRESS?'white':'white'}" draggable="true" @dragstart="onDragStart(item1,null,$event)" @dragend="onDragEnd(item1,null,$event)">
									{{item1.name}}
								</div>
							</a-space>
						</a-row>
					</a-row>
				</template>
			</Card>
		</div>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {apiBoard} from "@/business/common/request/request";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {
	ECommon_Model_Workflow_Node_Status,
	ICommon_Model_Workflow_Node
} from "../../../../../../../common/model/workflow_node";
import {ICommon_Model_Board_Column} from "../../../../../../../common/model/board_column";
import Card from "@/business/common/component/card/card.vue";
import {ICommon_Route_Res_Board_Column_Workflow_Node_Item} from "../../../../../../../common/routes/response";
import {Dialog} from "@/business/common/component/dialog/dialog";
import {getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";
import BoardAddIssueType from "@/business/controller/app/project/board/boardAddIssueType.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	boardId:string
}>()
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const {t}=useI18n()
const workflowUnSetNodeMap=ref<{
	[issueTypeId:string]:ICommon_Model_Workflow_Node[]
}>()
const workflowNodeMap=ref<{
	[columnId:string]:DCSType<ICommon_Route_Res_Board_Column_Workflow_Node_Item>[]
}>()
const cardData=ref<{
	id:string,
	name:string,
	data:DCSType<ICommon_Model_Board_Column>
}[]>([])
let maskElement:HTMLElement
let objDrag:{
	workflowNodeId:string,
	issueTypeId:string,
	columnId:string
}
const initInfo=async ()=>{
	let [resIssueType,resColumn]=await Promise.all([
		apiBoard.listIssueType({
			boardId:props.boardId
		}),
		apiBoard.listColumn({
			boardId:props.boardId
		})
	])
	if(resIssueType?.code==0 && resColumn?.code==0) {
		issueTypeList.value=resIssueType.data
		cardData.value=resColumn.data.map(item=>{
			return {
				id:item.id,
				name:item.name,
				data:item
			}
		})
		Promise.all(resIssueType.data.map(item=>{
			return apiBoard.listUnSetWorkflowNode({
				boardId:props.boardId,
				issueTypeId:item.id
			})
		})).then(arr=>{
			workflowUnSetNodeMap.value={}
			for(let i=0;i<resIssueType.data.length;i++) {
				let objIssueType=resIssueType.data[i]
				workflowUnSetNodeMap.value[objIssueType.id]=arr[i].data
			}
			for(let key in workflowUnSetNodeMap.value) {
				let value=workflowUnSetNodeMap.value[key]
				value.sort((a, b) => {
					if(a.status===b.status) {
						if(a.name>b.name) {
							return 1
						} else {
							return -1
						}
					} else {
						return a.status-b.status
					}
				})
			}
		})
		Promise.all(resColumn.data.map(item=>{
			return apiBoard.listWorkflowNode({
				boardColumnId:item.id
			})
		})).then(arr=>{
			workflowNodeMap.value={}
			for(let i=0;i<resColumn.data.length;i++) {
				let objColumn=resColumn.data[i]
				workflowNodeMap.value[objColumn.id]=arr[i].data
			}
			for(let key in workflowNodeMap.value) {
				let value=workflowNodeMap.value[key]
				value.sort((a, b) => {
					if(a.workflowNode.status===b.workflowNode.status) {
						if(a.workflowNode.name>b.workflowNode.name) {
							return 1
						} else {
							return -1
						}
					} else {
						return a.workflowNode.status-b.workflowNode.status
					}
				})
			}
		})
	}
}


const refreshColumn=async (columnId:string)=>{
	let res=await apiBoard.listWorkflowNode({
		boardColumnId:columnId
	})
	if(res?.code==0) {
		workflowNodeMap.value[columnId]=res.data
		workflowNodeMap.value[columnId].sort((a, b) => {
			if(a.workflowNode.status===b.workflowNode.status) {
				if(a.workflowNode.name>b.workflowNode.name) {
					return 1
				} else {
					return -1
				}
			} else {
				return a.workflowNode.status-b.workflowNode.status
			}
		})
	}

}

const refreshUnSetWorkFlowNode=async (issueTypeId:string)=>{
	let res=await apiBoard.listUnSetWorkflowNode({
		boardId:props.boardId,
		issueTypeId:issueTypeId
	})
	if(res?.code==0) {
		workflowUnSetNodeMap.value[issueTypeId]=res.data
		workflowUnSetNodeMap.value[issueTypeId].sort((a, b) => {
			if(a.status===b.status) {
				if(a.name>b.name) {
					return 1
				} else {
					return -1
				}
			} else {
				return a.status-b.status
			}
		})
	}
}

const onDragOver=(item:DCSType<ICommon_Model_Issue_Type>,columnId:string,event:DragEvent)=>{
	event.stopPropagation()
	event.preventDefault()
	let ele=event.currentTarget as HTMLElement
	let rect=ele.getBoundingClientRect()
	if(objDrag.issueTypeId===item.id && objDrag.columnId!==columnId) {
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

const onDrop=async (item:DCSType<ICommon_Model_Issue_Type>,columnId:string,event:DragEvent)=>{
	event.stopPropagation()
	event.preventDefault()
	if(objDrag.issueTypeId===item.id && objDrag.columnId!==columnId) {
		let objDragCopy=Object.assign({},objDrag)
		if(columnId) {
			let res=await apiBoard.bindWorkflowNode({
				boardColumnId:columnId,
				workflowNodeId:objDrag.workflowNodeId
			})
			if(res?.code==0) {
				if(objDragCopy.columnId) {
					refreshColumn(objDragCopy.columnId)
				} else {
					refreshUnSetWorkFlowNode(objDragCopy.issueTypeId)
				}
				refreshColumn(columnId)
			}
		} else {
			let res=await apiBoard.unbindWorkflowNode({
				boardColumnId:objDrag.columnId,
				workflowNodeId:objDrag.workflowNodeId
			})
			if(res?.code==0) {
				refreshColumn(objDragCopy.columnId)
				refreshUnSetWorkFlowNode(objDragCopy.issueTypeId)
			}
		}
	}
}

const onDragStart=(item:DCSType<ICommon_Model_Workflow_Node>,columnId:string,event:DragEvent)=>{
	objDrag={
		workflowNodeId:item.id,
		issueTypeId:item.issue_type_id,
		columnId:columnId
	}
}

const onDragEnd=(item:DCSType<ICommon_Model_Workflow_Node>,columnId:string,event:DragEvent)=>{
	objDrag=null
	if(maskElement) {
		maskElement.remove()
		maskElement=null;
	}
}

const onColumnChange=async (id:string,index:number)=>{
	let res=await apiBoard.moveColumn({
		boardColumnId:id,
		weight:index
	})
	if(res?.code==0) {
		let obj=cardData.value.find(item=>item.id===id)
		let originalIndex=cardData.value.indexOf(obj)
		cardData.value.splice(originalIndex,1)
		cardData.value.splice(index,0,obj)
	}
}

const onEditColumn=async (id:string,name:string)=>{
	let ret=await Dialog.input(root.value,appContext,t("tip.editColumnName"),name)
	if(ret) {
		let res=await apiBoard.editColumn({
			boardColumnId:id,
			name:ret
		})
		if(res?.code==0) {
			let obj=cardData.value.find(item=>item.id===id)
			obj.name=res.data.name
			obj.data.name=res.data.name
		}
	}
}

const onDeleteColumn=async (id:string)=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteColumn"))
	if(ret) {
		let res=await apiBoard.deleteColumn({
			boardColumnId:id
		})
		if(res?.code==0) {
			let index=cardData.value.findIndex(item=>item.id===id)
			cardData.value.splice(index,1)
			delete workflowNodeMap.value[id]
			issueTypeList.value.forEach(item=>{
				refreshUnSetWorkFlowNode(item.id)
			})
		}
	}
}

const onAddColumn=async ()=>{
	let ret=await Dialog.input(root.value,appContext,t("tip.newColumnTitle"))
	if(ret) {
		let res=await apiBoard.addColumn({
			name:ret,
			boardId:props.boardId
		})
		if(res?.code==0) {
			cardData.value.push({
				id:res.data.id,
				name:res.data.name,
				data:res.data
			})
			workflowNodeMap.value[res.data.id]=[]
		}
	}
}

const onDeleteIssueType=async (item:DCSType<ICommon_Model_Issue_Type>)=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.removeIssueType"))
	if(ret) {
		let res=await apiBoard.unbindIssueType({
			boardId:props.boardId,
			issueTypeId:item.id
		})
		if(res?.code==0) {
			let index=issueTypeList.value.findIndex(obj=>obj.id===item.id)
			issueTypeList.value.splice(index,1)
			delete workflowUnSetNodeMap.value[item.id]
			for(let key in workflowNodeMap.value) {
				let value=workflowNodeMap.value[key]
				for(let i=0;i<value.length;i++) {
					if(value[i].issueType.id===item.id) {
						value.splice(i,1)
					}
				}
			}
		}
	}
}

const onAddIssueType=async ()=>{
	let ret=await Dialog.open(root.value,appContext,t("controller.app.project.board.boardConfig.addIssueType"),markRaw(BoardAddIssueType),{
		boardId:props.boardId
	})
	if(ret) {
		let res=await apiBoard.listIssueType({
			boardId:props.boardId
		})
		if(res?.code==0) {
			for(let obj of res.data) {
				let index=issueTypeList.value.findIndex(item=>item.id==obj.id)
				if(index==-1) {
					refreshUnSetWorkFlowNode(obj.id)
				}
			}
		}
		issueTypeList.value=res.data
	}
}

onBeforeMount(()=>{
	initInfo()
})
</script>

<style scoped>

</style>