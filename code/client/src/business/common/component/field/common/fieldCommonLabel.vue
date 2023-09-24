<template>
	<div @focus="onFocus" tabindex="-1" class="hover">
		<template v-if="!isEdit">
			<template v-if="showValue.id">
				<UserAvatar :organization-user-id="showValue.id" v-if="type==='user'"></UserAvatar>
				<ProjectReleasePreview v-else-if="type==='release'"  :project-release-id="showValue.id" :name="showValue.name"></ProjectReleasePreview>
				<ProjectIssuePreview :name="showValue.name" :project-issue-id="showValue.id" v-else-if="type==='issue'"></ProjectIssuePreview>
				<a-tag v-else>
					{{showValue.name}}
				</a-tag>
			</template>
			<span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("util.none")}}</span>
		</template>
		<template v-else>
			<a-space size="mini" wrap>
				<a-select v-model="addValue" allow-search allow-clear @search="onSearch" v-model:input-value="label">
					<a-option v-for="item1 in searchValueList" :label="item1.name" :value="item1.id"></a-option>
				</a-select>
				<a-button type="text" @click="onSubmit">
					<template #icon>
						<icon-check></icon-check>
					</template>
				</a-button>
				<a-button type="text" @click="onBlur">
					<template #icon>
						<icon-close></icon-close>
					</template>
				</a-button>
			</a-space>
		</template>
	</div>
</template>

<script setup lang="ts">
import {ref, watch, watchEffect} from "vue";
import {
	apiField,
	apiIssue,
	apiOrganization,
	apiProject,
	apiRelease,
	apiTeam,
	apiWorkflow
} from "@/business/common/request/request";
import UserAvatar from "@/business/common/component/userAvatar.vue";
import ProjectIssuePreview from "@/business/controller/app/project/issue/projectIssuePreview.vue";
import ProjectReleasePreview from "@/business/controller/app/project/release/projectReleasePreview.vue";

const emit=defineEmits<{
	(e:"update:modelValue",value:string):void
}>()
const props=defineProps<{
	modelValue?:string,
	type:"user"|"team"|"release"|"label"|"tag"|"issue"|"field",
	projectId?:string,
	workflowNodeId?:string
}>()
const showValue=ref<{
	name?:string,
	id:string,
}>({} as any);
const isEdit=ref(false)
const searchValueList=ref<{
	name:string,
	id:string,
}[]>([])
const addValue=ref("")
const label=ref("")
const request=async ()=>{
	if(props.modelValue && props.modelValue.length>0) {
		let ret:{
			id:string,
			name:string
		}
		if(props.type==="team") {
			ret=await apiTeam.info({
				teamId:props.modelValue
			}).then(data=>{
				if(data.code==0) {
					return {
						id:data.data.id,
						name:data.data.name
					}
				}
			})
		} else if(props.type==="user") {
			ret=await apiOrganization.user({
				organizationUserId:props.modelValue
			}).then(data=>{
				if(data.code==0) {
					return {
						id:data.data.id,
						name:data.data.nickname
					}
				}
			})
		} else if(props.type==="release") {
			ret=await apiRelease.info({
				projectReleaseId:props.modelValue
			}).then(data=>{
				if(data.code==0) {
					return {
						id:data.data.id,
						name:data.data.name
					}
				}
			})
		} else if(props.type==="label") {
			ret=await apiProject.getLabel({
				labelId:props.modelValue
			}).then(data=>{
				if(data.code==0) {
					return {
						id:data.data.id,
						name:data.data.name
					}
				}
			})
		} else if(props.type==="tag") {
			ret=await apiOrganization.getTag({
				memberTagId:props.modelValue
			}).then(data=>{
				if(data.code==0) {
					return {
						id:data.data.id,
						name:data.data.name
					}
				}
			})
		} else if(props.type==="issue") {
			ret=await apiIssue.basicInfo({
				projectIssueId:props.modelValue
			}).then(data=>{
				if(data.code==0) {
					return {
						id:data.data.id,
						name:data.data.project.keyword+"-"+data.data.unique_id
					}
				}
			})
		} else if(props.type==="field") {
			ret=await apiField.workflowNodeFieldInfo({
				workflowNodeFieldTypeId:props.modelValue
			}).then(data=>{
				if(data.code==0) {
					return {
						id:data.data.field.id,
						name:data.data.field.name
					}
				}
			})
		}
		showValue.value=ret
		label.value=showValue.value.name
	} else {
		showValue.value={} as any
	}
}
watchEffect(()=>{
	request()
})

watch(isEdit,async ()=>{
	if(isEdit.value) {
		if(props.type==="field") {
			let res=await apiWorkflow.listApprovalField({
				workflowNodeId:props.workflowNodeId
			})
			if(res?.code==0) {
				searchValueList.value=res.data.map(item=>{
					return {
						id:item.id,
						name:item.name
					}
				})
			}
		}
	}
})

const onFocus=()=>{
	isEdit.value=true
}

const onBlur=()=>{
	isEdit.value=false
}

const onSubmit=()=>{
	isEdit.value=false
	emit("update:modelValue",addValue.value)
}


const onSearch=async (keyword:string)=>{
	if(keyword) {
		if(props.type==="team") {
			let res=await apiTeam.list({
				keyword,
				page:0,
				size:10
			})
			if(res?.code==0) {
				searchValueList.value=res.data.data.map(item=>{
					return {
						id:item.id,
						name:item.name
					}
				})
			}
		} else if(props.type==="user") {
			let res=await apiOrganization.listUser({
				keyword,
				page:0,
				size:10
			})
			if(res?.code==0) {
				searchValueList.value=res.data.data.map(item=>{
					return {
						id:item.organizationUser?.id,
						name:item.organizationUser?.nickname
					}
				})
			}
		} else if(props.type==="release") {
			let res=await apiRelease.list({
				page:0,
				size:10,
				name:keyword,
				projectId:props.projectId
			})
			if(res?.code==0) {
				searchValueList.value=res.data.data.map(item=>{
					return {
						id:item.id,
						name:item.name
					}
				})
			}
		} else if(props.type==="label") {
			let res=await apiProject.listLabel({
				page:0,
				size:10,
				keyword,
				projectId:props.projectId
			})
			if(res?.code==0) {
				searchValueList.value=res.data.data.map(item=>{
					return {
						id:item.id,
						name:item.name
					}
				})
			}
		} else if(props.type==="tag") {
			let res=await apiOrganization.listTag({
				keyword
			})
			if(res?.code==0) {
				searchValueList.value=res.data.map(item=>{
					return {
						id:item.id,
						name:item.name
					}
				})
			}
		} else if(props.type==="issue") {
			let res=await apiIssue.filter({
				page:0,
				size:10,
				projectId:props.projectId,
				name:keyword
			})
			if(res?.code==0) {
				searchValueList.value=res.data.data.map(item=>{
					return {
						id:item.id,
						name:item.name
					}
				})
			}
		}
	}
}
</script>

<style scoped>
.hover:hover {
	background-color: rgb(230,231,237);
}
</style>