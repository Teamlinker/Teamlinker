<template>
	<div>
		<template v-if="!isEdit">
			<UserAvatar v-if="showValue" :photo="showValue.photo" :name="showValue.nickname" :organization-user-id="showValue.organizationUserId"></UserAvatar>
			<span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("common.component.field.basic.fieldEditBasicAssigner.noUser")}}</span>
		</template>
		<a-row style="padding-right: 10px" v-else>
			<a-select allow-search allow-clear v-model="editValue" @search="onSearchAssigner">
				<a-option v-for="item in assignerList" :label="item.organizationUser?.nickname" :value="item.organizationUser?.id">
					<a-avatar :size="24" :image-url="item.user.photo"></a-avatar>&nbsp;&nbsp;
					{{ item.organizationUser?.nickname }}
				</a-option>
			</a-select>
			<a-button type="text" @click="onClick">
				<template #icon>
					<icon-check></icon-check>
				</template>
			</a-button>
			<a-button type="text" @click="onBlur">
				<template #icon>
					<icon-close style="color: red"></icon-close>
				</template>
			</a-button>
		</a-row>
	</div>
</template>

<script setup lang="ts">

import UserAvatar from "../../userAvatar.vue";
import {ref, watch} from "vue";
import {apiIssue, apiOrganization} from "../../../request/request";
import {ICommon_Route_Res_Organization_User_Item} from "../../../../../../../common/routes/response";
import {SessionStorage} from "../../../storage/session";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	isEdit:boolean,
	showValue?:{
		id:string,
		organizationUserId?:string,
		photo?:string,
		nickname?:string
	},
	projectIssueId:string
}>()
const emit=defineEmits<{
	cancel:[],
	update:[value:{
		id:string,
		organizationUserId?:string,
		photo?:string,
		nickname?:string
	}]
}>()
const editValue=ref("")
const assignerList=ref<DCSType<ICommon_Route_Res_Organization_User_Item>[]>([])

const assignValue=()=>{
	editValue.value=""
}
watch(()=>props.showValue,()=>{
	assignValue()
},{
	immediate:true,
	deep:true
})

const onClick=async()=>{
	let res=await apiIssue.editBasicField({
		projectIssueId:props.projectIssueId,
		assignerId:editValue.value as string
	})
	if(res?.code==0) {
		emit("update",res.data.assigner_id)
	}
}

const onSearchAssigner=async (keyword:string)=>{
	let res=await apiOrganization.listUser({
		organizationId:SessionStorage.get("organizationId"),
		keyword,
		page:0,
		size:10
	})
	if(res?.code==0) {
		assignerList.value=res.data.data
	}
}

const onBlur=()=>{
	emit('cancel')
	assignValue()
}
</script>


<style scoped>

</style>