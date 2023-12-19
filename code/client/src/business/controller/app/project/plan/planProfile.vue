<template>
	<div style="width: 100%;height: 100%;">
		<a-row style="width: 100%;font-size: 30px;align-items: center;justify-content: space-between;padding: 0px 10px;box-sizing: border-box;height: 40px">
			<a-space>
				{{info?.name}}
				<span style="color: grey;font-size: small;height:40px;display: flex;align-items: end;padding-bottom: 5px;box-sizing: border-box">
					{{$t("util.startDate")}}:{{moment(info?.start_time).format("YYYY-MM-DD")}}
				</span>
			</a-space>
			<a-space>
				<a-select size="small" v-model="type">
					<a-option value="day">{{$t("util.day")}}</a-option>
					<a-option value="month">{{$t("util.month")}}</a-option>
				</a-select>
				<a-button size="small" type="primary" @click="onEditProfile">
					{{$t("util.edit")}}
				</a-button>
				<a-dropdown-button type="primary" size="small" status="success">
					{{$t("util.add")}}
					<template #icon>
						<icon-down></icon-down>
					</template>
					<template #content>
						<a-doption @click="onAddStage(null)">{{$t("util.stage")}}</a-doption>
						<a-doption @click="onAddMilestone(null)">{{$t("util.milestone")}}</a-doption>
						<a-doption @click="onAddIssue(null)">{{$t("util.issue")}}</a-doption>
					</template>
				</a-dropdown-button>
				<a-popover trigger="hover" position="right">
					<icon-question-circle-fill style="color: rgb(35,110,184);font-size: large"></icon-question-circle-fill>
					<template #content>
					    <span style="color: dodgerblue;white-space: pre-line">
								{{$t("help.planItemType")}}
					    </span>
					</template>
				</a-popover>
			</a-space>
		</a-row>
		<div style="height: 70px;margin-top: 20px;overflow-x: auto" v-if="milestoneList.length>0">
			<a-steps label-placement="vertical" :current="-1" small>
				<a-step v-for="item in milestoneList" :description="moment(item.startDate).format('YYYY-MM-DD')">
					{{item.name}}
					<template #icon>
						<icon-check style="color: #03ad03" v-if="item.completed"></icon-check>
						<icon-close style="color: orange" v-else></icon-close>
					</template>
				</a-step>
			</a-steps>
		</div>
		<div style="width: 100%;overflow: auto;margin-top: 20px" :style="{
			height:milestoneList.length>0?'calc(100% - 150px)':'calc(100% - 60px)'
		}">
			<Gantt :data="data" :type="type" :start-date="moment(info.start_time).startOf('day').toDate().getTime()" v-if="info && plan" @change="onChange" @move="onMove">
				<template #type="{record}">
					<span :style="{
						color:record.type===ECommon_Model_Plan_Table.MILESTONE?record.completed?typeMap[record.type].doneColor:typeMap[record.type].undoneColor:typeMap[record.type].color
					}">{{typeMap[record.type].text}}</span>
				</template>
				<template #name="{record}">
					<a-link style="box-sizing: border-box;height: 22px" @click="onOpenIssue(record.projectIssueId)" v-if="record.type===ECommon_Model_Plan_Table.ISSUE">
						{{record.name}}
					</a-link>
					<template v-else>
						{{record.name}}
					</template>
				</template>
				<template #manDay="{record}">
					<template v-if="record.type===ECommon_Model_Plan_Table.ISSUE || record.type===ECommon_Model_Plan_Table.STAGE">
						{{moment(record.endDate).startOf("day").diff(record.startDate,"day")+1}}
						<span v-if="record.type===ECommon_Model_Plan_Table.ISSUE && record.children?.length>0" style="color: dodgerblue">
						({{record.manDay}})
					</span>
					</template>
				</template>
				<template #progress="{record}">
					<template v-if="record.type===ECommon_Model_Plan_Table.MILESTONE">
						<icon-check style="color: #03ad03" v-if="record.completed"></icon-check>
						<icon-close style="color: orange" v-else></icon-close>
					</template>
					<template v-else>
						{{record.showProgress!=null?(record.showProgress.toFixed(0)+'%'):""}}
						<span v-if="record.type===ECommon_Model_Plan_Table.ISSUE && record.children?.length>0" style="color: dodgerblue">
						({{record.progress.toFixed(0)+"%"}})
					</span>
					</template>
				</template>
				<template #depend="{record}">
					<template v-if="record.type===ECommon_Model_Plan_Table.ISSUE || record.type===ECommon_Model_Plan_Table.STAGE">
						{{record.depend?getNameWithKey(record.depend):""}}
					</template>
				</template>
				<template #delay="{record}">
					<template v-if="record.type===ECommon_Model_Plan_Table.ISSUE || record.type===ECommon_Model_Plan_Table.STAGE">
						{{record.delay??""}}
					</template>
				</template>
				<template #startDate="{record}">
					{{moment(record.startDate).format("MM-DD")}}
				</template>
				<template #endDate="{record}">
					{{moment(record.endDate).format("MM-DD")}}
				</template>
				<template #operation="{record}">
					<a-dropdown trigger="hover">
						<icon-more></icon-more>
						<template #content>
							<a-dsubmenu trigger="hover" v-if="record.type===ECommon_Model_Plan_Table.STAGE">
								{{$t("util.add")}}
								<template #content>
									<a-doption @click="onAddStage(record)">{{$t("util.stage")}}</a-doption>
									<a-doption @click="onAddMilestone(record)">{{$t("util.milestone")}}</a-doption>
									<a-doption @click="onAddIssue(record)">{{$t("util.issue")}}</a-doption>
								</template>
							</a-dsubmenu>
							<a-doption @click="onEdit(record)">{{$t("util.edit")}}</a-doption>
							<a-doption @click="onEditProgress(record)" v-if="record.type===ECommon_Model_Plan_Table.ISSUE && record.progress!==0 && record.progress!==100">{{$t("util.progress")}}</a-doption>
							<a-doption @click="onDelete(record)" v-if="findObj(data,record.parentId)?.type!==ECommon_Model_Plan_Table.ISSUE">{{$t("util.delete")}}</a-doption>
						</template>
					</a-dropdown>
				</template>
				<template #shortView="{data}">
					<a-descriptions :data="shortViewInfo(data)" size="small" :title="data.name" :column="1"></a-descriptions>
				</template>
			</Gantt>
		</div>
	</div>
</template>

<script setup lang="ts">
import {computed, getCurrentInstance, inject, markRaw, onBeforeMount, ref} from "vue";
import {DCSType} from "../../../../../../../common/types";
import {
	ICommon_Route_Res_Plan_Info,
	ICommon_Route_Res_Plan_Info_Item
} from "../../../../../../../common/routes/response";
import {apiPlan} from "@/business/common/request/request";
import Gantt from "@/business/common/component/gantt/gantt.vue";
import {GanttDataItem} from "@/business/common/component/gantt/types";
import {type} from "os";
import moment from "moment";
import {ECommon_Model_Plan_Table} from "../../../../../../../common/model/plan_table";
import {injectProjectInfo} from "@/business/common/util/symbol";
import {ECommon_Model_Workflow_Node_Status} from "../../../../../../../common/model/workflow_node";
import plan from "../../../../../../../common/routes/plan";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "@/business/common/component/dialog/dialog";
import {getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";
import {useI18n} from "vue-i18n";
import PlanStageEdit from "@/business/controller/app/project/plan/planStageEdit.vue";
import PlanMilestoneEdit from "@/business/controller/app/project/plan/planMilestoneEdit.vue";
import PlanIssueEdit from "@/business/controller/app/project/plan/planIssueEdit.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "@/business/common/event/event";
import PlanProgressEdit from "@/business/controller/app/project/plan/planProgressEdit.vue";
import PlanEdit from "@/business/controller/app/project/plan/planEdit.vue";

const props=defineProps<{
	planId:string
}>()
const info=ref<DCSType<ICommon_Route_Res_Plan_Info>>()
const data=ref<GanttDataItem[]>([])
const type=ref<"day"|"month">("month")
const projectKey=inject(injectProjectInfo).key
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const {t}=useI18n()
const typeMap={
	[ECommon_Model_Plan_Table.ISSUE]:{
		text:t("util.issue"),
		color:"rgb(85, 171, 251)"
	},
	[ECommon_Model_Plan_Table.STAGE]:{
		text:t("util.stage"),
		color:"green"
	},
	[ECommon_Model_Plan_Table.MILESTONE]:{
		text:t("util.milestone"),
		undoneColor:"orange",
		doneColor:"#03ad03"
	}
}
const getInfo=async ()=>{
	let res=await apiPlan.info({
		planId:props.planId
	})
	if(res?.code==0) {
		info.value=res.data
		refreshData()
	}
}

const milestoneList=computed(()=>{
	return getMilestoneList(data.value)
})

const getMilestoneList=(data:GanttDataItem[])=>{
	let ret:GanttDataItem[]=[]
	for(let obj of data) {
		if(obj.type===ECommon_Model_Plan_Table.MILESTONE) {
			ret.push(obj)
		}
		if(obj.children?.length>0) {
			ret=ret.concat(getMilestoneList(obj.children))
		}
	}
	return ret;
}

const refreshData=()=>{
	data.value=[]
	handleInfo(info.value.data,data.value)
	calcItem(data.value,moment(info.value.start_time).startOf("day").toDate().getTime())
}

const handleInfo=(list:DCSType<ICommon_Route_Res_Plan_Info_Item>[],ganttData:GanttDataItem[])=>{
	for(let obj of list) {
		let ganttItem:GanttDataItem={
			type:obj.type,
			name:obj.type===ECommon_Model_Plan_Table.ISSUE?(projectKey.value+"-"+obj.issue.unique_id+" "+obj.issue.name):obj.name,
			progress:(()=>{
				if(obj.type===ECommon_Model_Plan_Table.ISSUE) {
					if(obj.workflow.status===ECommon_Model_Workflow_Node_Status.NOTSTART) {
						return 0
					} else if(obj.workflow.status===ECommon_Model_Workflow_Node_Status.DONE) {
						return 100
					} else {
						return obj.progress??50
					}
				} else {
					return 100
				}
			})(),
			delay:obj.delay??0,
			key:obj.id,
			depend:obj.depend_id,
			manDay:obj.type===ECommon_Model_Plan_Table.ISSUE?obj.issue.man_day:1,
			...(obj.type===ECommon_Model_Plan_Table.ISSUE && {
				uniqueId:String(obj.issue.unique_id),
				projectIssueId:obj.ref_id
			}),
			parentId:obj.parent_id
		}
		ganttData.push(ganttItem)
		if(obj.children) {
			ganttItem.children=[]
			handleInfo(obj.children,ganttItem.children)
		}
	}
}

const findObj=(data:GanttDataItem[],key:string):GanttDataItem=>{
	for(let obj of data) {
		if(obj.key===key) {
			return obj
		}
		if(obj.children?.length>0) {
			let ret=findObj(obj.children,key)
			if(ret) {
				return ret;
			}
		}
	}
}

const getNameWithKey=(key:string)=>{
	let obj=findObj(data.value,key)
	if(obj) {
		if(obj.type===ECommon_Model_Plan_Table.ISSUE) {
			return projectKey.value+"-"+obj.uniqueId
		} else if(obj.type===ECommon_Model_Plan_Table.STAGE) {
			return obj.name
		} else {
			return ""
		}
	} else {
		return ""
	}
}

const getChildrenWithKey=(key:string):GanttDataItem[]=>{
	function _find(data:GanttDataItem[]) {
		for(let obj of data) {
			if(obj.key===key) {
				return obj.children
			}
			if(obj.children?.length>0) {
				let ret=_find(obj.children)
				if(ret) {
					return ret;
				}
			}
		}
	}
	if(key===null) {
		return data.value
	} else {
		return _find(data.value)
	}
}

const calcItem=(data:GanttDataItem[],startDate:number):{
	maxEndDate:number,
	progressTotal:number
	progressCount:number
}=>{
	let maxEndDate=0,progress=0,progressCount=0
	for(let i=0;i<data.length;i++) {
		let obj=data[i]
		if(obj.type===ECommon_Model_Plan_Table.ISSUE || obj.type===ECommon_Model_Plan_Table.STAGE) {
			if(obj.depend) {
				let objDepend:GanttDataItem
				for(let j=0;j<data.length;j++) {
					if(data[j].key===obj.depend) {
						objDepend=data[j]
						break
					}
				}
				if(objDepend) {
					obj.startDate=moment(objDepend.endDate).add(1,"day").startOf("day").add(obj.delay??0,"day").toDate().getTime()
				}
			} else {
				obj.startDate=moment(startDate).add(obj.delay??0,"day").toDate().getTime()
			}
			if(obj.children?.length>0) {
				let temp=calcItem(obj.children,obj.startDate)
				let endDate=moment(obj.startDate).add(obj.manDay-1,"day").toDate().getTime()
				obj.endDate=Math.max(temp.maxEndDate,endDate)
				if(obj.type===ECommon_Model_Plan_Table.ISSUE) {
					obj.showProgress=(temp.progressTotal+obj.progress)/(temp.progressCount+1)
				} else {
					obj.showProgress=temp.progressTotal/temp.progressCount
					obj.manDay=moment(obj.endDate).diff(obj.startDate,"day")+1
				}
			} else {
				obj.showProgress=obj.progress
				obj.endDate=moment(obj.startDate).add(obj.manDay-1,"day").toDate().getTime()
			}
			progressCount++;
			progress+=obj.showProgress
		} else {
			let maxEndDate:number=0,isCompleted=true
			for(let j=0;j<i;j++) {
				maxEndDate=Math.max(data[j].endDate,maxEndDate)
				if(data[j].type===ECommon_Model_Plan_Table.STAGE || data[j].type===ECommon_Model_Plan_Table.ISSUE) {
					if(data[j].showProgress!==100) {
						isCompleted=false
					}
				}
			}
			obj.completed=isCompleted
			if(maxEndDate===0) {
				obj.startDate=startDate
				obj.endDate=startDate
			} else {
				obj.startDate=maxEndDate
				obj.endDate=maxEndDate
			}
		}
		maxEndDate=Math.max(obj.endDate,maxEndDate)
	}
	return {
		maxEndDate,
		progressTotal:progress,
		progressCount
	}
}

const onChange=async (item:GanttDataItem,originalStartDate:number,originalEndDate:number,originalDalay:number) => {
	if(item.type===ECommon_Model_Plan_Table.ISSUE) {
		let res=await apiPlan.editIssue({
			planItemId:item.key,
			dependId:item.depend,
			delay:item.delay,
			manDay:item.manDay
		})
		if(res?.code==0) {
			info.value.data=res.data
			refreshData()
		} else {
			Message.error(res.msg)
			item.delay=originalDalay
			item.manDay=moment(originalEndDate).endOf("day").diff(originalStartDate,"day")
		}
	} else if(item.type===ECommon_Model_Plan_Table.STAGE) {
		let res=await apiPlan.editStage({
			planItemId:item.key,
			delay:item.delay,
			dependId:item.depend,
			name:item.name
		})
		if(res?.code==0) {
			info.value.data=res.data
			refreshData()
		} else {
			Message.error(res.msg)
			item.delay=originalDalay
		}
	} else if(item.type===ECommon_Model_Plan_Table.MILESTONE) {
		let res=await apiPlan.editMileStone({
			planItemId:item.key,
			name:item.name
		})
		if(res?.code==0) {
			info.value.data=res.data
			refreshData()
		}
	}
}

const onMove=async (key:string,destKey:string,type:"in"|"top"|"bottom") =>{
	let res=await apiPlan.moveItem({
		planItemId:key,
		targetId:destKey,
		action:type
	})
	if(res?.code==0) {
		info.value.data=res.data
		refreshData()
	} else {
		Message.error(res.msg)
	}
}

const onAddStage=async (item:GanttDataItem)=>{
	if(item===null || item.type===ECommon_Model_Plan_Table.STAGE) {
		let list=getChildrenWithKey(item?item.key:null)?.filter(obj=>obj.type!==ECommon_Model_Plan_Table.MILESTONE && obj.key!=item?.key)
		let ret:any=await Dialog.open(root.value,appContext,t("util.add"),markRaw(PlanStageEdit),{
			type:"add",
			planId:props.planId,
			dependList:list??[],
			parentId:item?item.key:null
		})
		if(ret) {
			info.value.data=ret.data
			refreshData()
		}
	}
}

const onAddMilestone=async (item:GanttDataItem)=>{
	if(item===null || item.type===ECommon_Model_Plan_Table.STAGE) {
		let ret:any=await Dialog.open(root.value,appContext,t("util.add"),markRaw(PlanMilestoneEdit),{
			type:"add",
			planId:props.planId,
			parentId:item?item.key:null
		})
		if(ret) {
			info.value.data=ret.data
			refreshData()
		}
	}
}

const onAddIssue=async (item:GanttDataItem)=>{
	if(item===null || item.type===ECommon_Model_Plan_Table.STAGE) {
		let list=getChildrenWithKey(item?item.key:null)?.filter(obj=>obj.type!==ECommon_Model_Plan_Table.MILESTONE && obj.key!=item?.key)
		let ret:any=await Dialog.open(root.value,appContext,t("util.add"),markRaw(PlanIssueEdit),{
			type:"add",
			projectId:info.value.project_id,
			planId:props.planId,
			dependList:list??[],
			parentId:item?item.key:null
		})
		if(ret) {
			info.value.data=ret.data
			refreshData()
		}
	}
}

const onOpenIssue=(projectIssueId:string)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,info.value.project_id,projectIssueId)
}

const onEdit=async (item:GanttDataItem)=>{
	let ret:any
	let list=getChildrenWithKey(item?item.parentId:null)?.filter(obj=>obj.type!==ECommon_Model_Plan_Table.MILESTONE && obj.key!=item?.key)
	if(item.type===ECommon_Model_Plan_Table.ISSUE) {
		ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(PlanIssueEdit),{
			type:"edit",
			projectId:info.value.project_id,
			planId:props.planId,
			dependList:list??[],
			parentId:item?item.key:null,
			item
		})
	} else if(item.type===ECommon_Model_Plan_Table.STAGE) {
		ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(PlanStageEdit),{
			type:"edit",
			planId:props.planId,
			dependList:list??[],
			parentId:item?item.key:null,
			item
		})

	}else if(item.type===ECommon_Model_Plan_Table.MILESTONE) {
		ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(PlanMilestoneEdit),{
			type:"edit",
			planId:props.planId,
			parentId:item?item.key:null,
			item
		})
	}
	if(ret) {
		info.value.data=ret.data
		refreshData()
	}
}

const onEditProgress=async (item:GanttDataItem)=>{
	let ret:any=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(PlanProgressEdit),{
		planItemId:item.key,
		progress:item.progress
	})
	if(ret) {
		info.value.data=ret.data
		refreshData()
	}
}

const onDelete=async (item:GanttDataItem)=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteItem"))
	if(ret) {
		let res=await apiPlan.removeItem({
			planItemId:item.key
		})
		if(res?.code==0) {
			info.value.data=res.data
			refreshData()
		}
	}
}

const shortViewInfo=(item:GanttDataItem):{
	label:string,
	value:string
}[]=>{
	if(item.type===ECommon_Model_Plan_Table.ISSUE || item.type===ECommon_Model_Plan_Table.STAGE) {
		return [
			{
				label:t("util.type"),
				value:typeMap[ECommon_Model_Plan_Table.ISSUE].text
			},
			{
				label: t("util.progress"),
				value:item.showProgress.toFixed(0)+"%"
			},
			{
				label: t("util.delay"),
				value:String(item.delay)
			},
			{
				label: t("util.startDate"),
				value:moment(item.startDate).format("YYYY-MM-DD")
			},
			{
				label: t("util.endDate"),
				value:moment(item.endDate).format("YYYY-MM-DD")
			},
		]
	}
}

const onEditProfile=async ()=>{
	let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(PlanEdit),{
		type:"edit",
		projectId:info.value.project_id,
		item:info.value
	})
	if(ret) {
		getInfo()
	}
}

onBeforeMount(()=>{
	getInfo()
})

</script>

<style scoped>
:deep td a {
	padding: 1px 0px;
}
</style>