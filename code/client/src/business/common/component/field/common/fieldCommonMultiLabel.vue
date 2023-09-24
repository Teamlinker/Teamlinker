<template>
	<div @focus="onFocus" tabindex="-1" class="hover">
		<template v-if="!isEdit">
			<a-space wrap v-if="showValue && showValue.length>0">
				<template v-for="(item,index) in editValue" :key="item.id">
					<UserAvatar :organization-user-id="item.id" v-if="type==='user'"></UserAvatar>
					<ProjectReleasePreview v-else-if="type==='release'"  :project-release-id="item.id" :name="item.name"></ProjectReleasePreview>
					<ProjectIssuePreview :name="item.name" :project-issue-id="item.id" v-else-if="type==='issue'"></ProjectIssuePreview>
					<a-tag v-else>
						{{item.name}}
					</a-tag>
				</template>
			</a-space>
			<span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("util.none")}}</span>
		</template>
		<template v-else>
			<a-space size="mini" wrap>
				<a-tag v-for="(value,index) in editValue" :closable="true" @close="onClose(index)" :key="value.id">
					{{value.name}}
				</a-tag>
				<a-select v-model="addValue" allow-search @search="onSearch" v-if="showInput" @change="onChange">
					<a-option v-for="item1 in searchValueList" :label="item1.name" :value="item1.id"></a-option>
				</a-select>
				<a-tag v-else :style="{backgroundColor: 'var(--color-fill-2)',border: '1px dashed var(--color-fill-3)',cursor: 'pointer',}" @click="showInput=true">
					<template #icon>
						<icon-plus />
					</template>
					{{$t("util.add")}}
				</a-tag>
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
import {ref, watchEffect} from "vue";
import {apiIssue, apiOrganization, apiProject, apiRelease, apiTeam} from "@/business/common/request/request";
import UserAvatar from "@/business/common/component/userAvatar.vue";
import ProjectIssuePreview from "@/business/controller/app/project/issue/projectIssuePreview.vue";
import ProjectReleasePreview from "@/business/controller/app/project/release/projectReleasePreview.vue";

const emit=defineEmits<{
	(e:"update:modelValue",value:string[]):void
}>()
const props=defineProps<{
	modelValue?:string[],
	type:"user"|"team"|"release"|"label"|"tag"|"issue",
	projectId?:string
}>()
const showValue=ref<{
	name?:string,
	id:string,
}[]>([]);
const editValue=ref<{
	name?:string,
	id:string
}[]>([]);
const isEdit=ref(false)
const searchValueList=ref<{
	name:string,
	id:string,
}[]>([])
const addValue=ref("")
const showInput = ref(false);
const request=async ()=>{
	if(props.modelValue && props.modelValue.length>0) {
		let arr=await Promise.all(props.modelValue.map(item=>{
			if(props.type==="team") {
				return apiTeam.info({
					teamId:item
				}).then(data=>{
					if(data.code==0) {
						return {
							id:data.data.id,
							name:data.data.name
						}
					}
				})
			} else if(props.type==="user") {
				return apiOrganization.user({
					organizationUserId:item
				}).then(data=>{
					if(data.code==0) {
						return {
							id:data.data.id,
							name:data.data.nickname
						}
					}
				})
			} else if(props.type==="release") {
				return apiRelease.info({
					projectReleaseId:item
				}).then(data=>{
					if(data.code==0) {
						return {
							id:data.data.id,
							name:data.data.name
						}
					}
				})
			} else if(props.type==="label") {
				return apiProject.getLabel({
					labelId:item
				}).then(data=>{
					if(data.code==0) {
						return {
							id:data.data.id,
							name:data.data.name
						}
					}
				})
			} else if(props.type==="tag") {
				return apiOrganization.getTag({
					memberTagId:item
				}).then(data=>{
					if(data.code==0) {
						return {
							id:data.data.id,
							name:data.data.name
						}
					}
				})
			} else if(props.type==="issue") {
				return apiIssue.basicInfo({
					projectIssueId:item
				}).then(data=>{
					if(data.code==0) {
						return {
							id:data.data.id,
							name:data.data.project.keyword+"-"+data.data.unique_id
						}
					}
				})
			}
		}))
		arr=arr.filter(item=>{
			return item!=null
		})
		showValue.value=arr
		editValue.value=[...arr]
	} else {
		showValue.value=[]
		editValue.value=[]
	}
}
watchEffect(()=>{
	request()
})

const onFocus=()=>{
	isEdit.value=true
}

const onBlur=()=>{
	isEdit.value=false
}

const onSubmit=()=>{
	isEdit.value=false
	emit("update:modelValue",editValue.value.map(item=>item.id))
}

const onChange=()=>{
	showInput.value=false
	editValue.value=[...editValue.value,searchValueList.value.find(item=>{
		if(item.id==addValue.value) {
			return true
		}
	})]
	addValue.value=""
}
const onClose=(index:number)=>{
	editValue.value.splice(index,1)
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