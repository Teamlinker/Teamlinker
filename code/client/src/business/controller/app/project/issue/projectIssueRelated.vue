<template>
	<div>
		<template v-if="parentIssue">
			<a-row style="margin-top: 20px;font-weight: bold">{{$t("controller.app.project.issue.projectIssueRelated.parentIssue")}}</a-row>
			<a-list style="margin-top: 10px;margin-right: 10px" size="small" hoverable>
				<a-list-item>
					<a-space size="large">
						{{key+"-"+parentIssue.unique_id}}
						<a-link href="javascript:void(0)" @click="onOpenIssue(parentIssue.id)">{{parentIssue.name}}</a-link>
						<FieldPriority :priority="parentIssue.priority"></FieldPriority>
					</a-space>
					<template #actions>
						<a-button type="text" size="mini" @click="onRemoveItem('parent',null)">
							<template #icon>
								<icon-close style="color: red"></icon-close>
							</template>
						</a-button>
					</template>
				</a-list-item>
			</a-list>
		</template>
		<template v-if="childIssueList.length>0">
			<a-row style="margin-top: 20px;font-weight: bold">{{$t("controller.app.project.issue.projectIssueRelated.childIssues")}}</a-row>
			<a-list style="margin-top: 10px;margin-right: 10px" size="small" hoverable>
				<a-list-item v-for="(item,index) in childIssueList" :key="item.id">
					<a-space size="large">
						{{key+"-"+item.unique_id}}
						<a-link href="javascript:void(0)" @click="onOpenIssue(item.id)">{{item.name}}</a-link>
						<FieldPriority :priority="item.priority"></FieldPriority>
					</a-space>
					<template #actions>
						<a-button type="text" size="mini" @click="onRemoveItem('child',index)">
							<template #icon>
								<icon-close style="color: red"></icon-close>
							</template>
						</a-button>
					</template>
				</a-list-item>
			</a-list>
		</template>
		<template v-if="relatedIssueList.length>0">
			<a-row style="margin-top: 20px;font-weight: bold">{{$t("controller.app.project.issue.projectIssueRelated.relatedIssues")}}</a-row>
			<a-list style="margin-top: 10px;margin-right: 10px" size="small" hoverable>
				<a-list-item v-for="(item,index) in relatedIssueList" :key="item.id">
					<a-space size="large">
						{{key+"-"+item.unique_id}}
						<a-link href="javascript:void(0)" @click="onOpenIssue(item.id)">{{item.name}}</a-link>
						<FieldPriority :priority="item.priority"></FieldPriority>
					</a-space>
					<template #actions>
						<a-button type="text" size="mini" @click="onRemoveItem('related',index)">
							<template #icon>
								<icon-close style="color: red"></icon-close>
							</template>
						</a-button>
					</template>
				</a-list-item>
			</a-list>
		</template>
	</div>
</template>

<script setup lang="ts">

import FieldPriority from "../../../../common/component/field/fieldPriority.vue";
import {apiIssue} from "../../../../common/request/request";
import {ICommon_Model_Project_Issue} from "../../../../../../../common/model/project_issue";
import {getCurrentInstance, inject} from "vue";
import {injectProjectInfo} from "../../../../common/util/symbol";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../../common/event/event";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	parentIssue?:DCSType<ICommon_Model_Project_Issue>,
	childIssueList?:DCSType<ICommon_Model_Project_Issue>[],
	relatedIssueList?:DCSType<ICommon_Model_Project_Issue>[]
	projectIssueId:string
}>()
const emit=defineEmits<{
	removeParent:[]
}>()
const key=inject(injectProjectInfo).key
const projectId=inject(injectProjectInfo).id
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const {t}=useI18n()
const onRemoveItem=async (type:"parent"|"child"|"related",index:number)=>{
	if(type==="parent") {
		let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteParentIssue"))
		if(ret) {
			let res=await apiIssue.removeParentIssue({
				projectIssueId:props.projectIssueId,
				projectIssueParentId:props.parentIssue.id
			})
			if(res?.code==0) {
				emit("removeParent")
			}
		}
	} else if(type=="child") {
		let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteChildIssue"))
		if(ret) {
			let res=await apiIssue.removeChildIssue({
				projectIssueId:props.projectIssueId,
				projectIssueChildId:props.childIssueList[index].id
			})
			if(res?.code==0) {
				props.childIssueList.splice(index,1)
			}
		}
	} else if(type=="related") {
		let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteRelatedIssue"))
		if(ret) {
			let res=await apiIssue.removeRelatedIssue({
				projectIssueId:props.projectIssueId,
				projectIssueRelatedId:props.relatedIssueList[index].id
			})
			if(res?.code==0) {
				props.relatedIssueList.splice(index,1)
			}
		}
	}
}

const onOpenIssue=(projectIssueId:string)=>{
	eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,projectId,projectIssueId)
}
</script>

<style scoped>

</style>