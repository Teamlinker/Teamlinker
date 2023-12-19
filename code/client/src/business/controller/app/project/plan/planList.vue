<template>
	<div>
		<a-alert closable style="margin-bottom: 10px">
			{{$t("help.plan")}}
		</a-alert>
		<a-row>
			<a-space wrap>
				<a-input-search v-model="keyword" :placeholder="$t('placeholder.typePlanName')" style="width: 250px" @search="onSearch" v-if="checkPermission(permission,Permission_Types.Project.READ)"></a-input-search>
				<a-button type="primary" @click="onCreate" v-if="checkPermission(permission,Permission_Types.Project.CREATE)">{{$t("util.create")}}</a-button>
			</a-space>
		</a-row>
		<a-table style="margin-top: 10px" :columns="columns" :data="planList" :pagination="pagination" @pageChange="onPageChange">
			<template #name="{record}">
				<a-link href="javascript:void(0)" @click="onProfile(record,$event)">{{record.name}}</a-link>
			</template>
			<template #startDate="{record}">
				{{moment(record.start_time).format("YYYY-MM-DD")}}
			</template>
			<template #operation="{record}">
				<a-space v-if="checkPermission(permission,Permission_Types.Project.EDIT)" wrap>
					<a-button size="small" @click="onEdit(record)">{{$t("util.edit")}}</a-button>
					<a-button size="small" status="danger" @click="onDelete(record)" v-if="checkPermission(permission,Permission_Types.Project.DELETE) || record?.created_by.id===myOrganizationUserId">{{$t("util.delete")}}</a-button>
				</a-space>
			</template>
		</a-table>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, markRaw, onBeforeMount, reactive, ref} from "vue";
import {injectProjectInfo} from "../../../../common/util/symbol";
import {apiPlan} from "../../../../common/request/request";
import {checkPermission, Permission_Types} from "../../../../../../../common/permission/permission";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {
	ETeamOS_Navigator_Action,
	getCurrentNavigator,
	getRootNavigatorRef,
	onNavigatorShow
} from "../../../../../teamOS/common/component/navigator/navigator";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {SessionStorage} from "@/business/common/storage/session";
import {DCSType} from "../../../../../../../common/types";
import {ICommon_Model_Plan} from "../../../../../../../common/model/plan";
import PlanEdit from "@/business/controller/app/project/plan/planEdit.vue";
import moment from "moment";

const objInject=inject(injectProjectInfo)
const projectId=objInject.id
const permission=objInject.permission
const key=objInject.key
const myOrganizationUserId=SessionStorage.get("organizationUserId")
const {t}=useI18n()
const columns=[
	{
		title:t("util.name"),
		slotName:"name"
	},
	{
		title:t("util.startDate"),
		slotName:"startDate"
	},
	{
		title:t("util.operation"),
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
const planList=ref<DCSType<ICommon_Model_Plan[]>>([])
const navigator=getCurrentNavigator()
const search=async (page:number)=>{
	let res=await apiPlan.listPlan({
		projectId:projectId,
		page:page-1,
		size:10,
		keyword:keyword.value
	})
	if(res?.code==0) {
		planList.value=res.data.data
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
	let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(PlanEdit),{
		type:"add",
		projectId:projectId
	})
	if(ret) {
		search(pagination.current)
	}
}
const onEdit=async (item:DCSType<ICommon_Model_Plan>)=>{
	let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(PlanEdit),{
		type:"edit",
		projectId:projectId,
		item:item
	})
	if(ret) {
		search(pagination.current)
	}
}
const onDelete=async (item:DCSType<ICommon_Model_Plan>)=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deletePlan"))
	if(ret) {
		let res=await apiPlan.removePlan({
			planId:item.id
		})
		if(res?.code==0) {
			Message.success(t("tip.deleteSuccess"))
			search(pagination.current)
		}
	}
}
const onProfile=async (item:DCSType<ICommon_Model_Plan>,event:MouseEvent)=>{
	navigator.push("planProfile",{
		planId:item.id
	})
}
onNavigatorShow(action => {
	if(action===ETeamOS_Navigator_Action.POP || action===ETeamOS_Navigator_Action.BACK) {
		search(pagination.current)
	}
})

onBeforeMount(()=>{
	search(pagination.current)
})
</script>

<style scoped>

</style>