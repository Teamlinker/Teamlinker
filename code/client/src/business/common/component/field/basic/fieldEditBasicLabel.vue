<template>
	<div>
		<template v-if="!isEdit">
			<a-space wrap size="mini" v-if="(showValue as ICommon_Model_Project_Label[]).length>0">
				<a-tag v-for="item in (showValue as ICommon_Model_Project_Label[])" color="blue">{{item.name}}</a-tag>
			</a-space>
			<span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("util.none")}}</span>
		</template>
		<a-row style="padding-right: 10px" v-else>
			<a-space size="mini" wrap>
				<a-tag v-for="(item,index) in (editValue as {id:string,name:string}[])" :closable="true" @close="onCloseLabelTag(index)" :key="item.id">
					{{item.name}}
				</a-tag>
				<a-select v-model="addValue" allow-search @search="onSearchLabel" v-if="showInput" @change="onAddChange">
					<a-option v-for="item in labelList" :label="item.name" :value="item.id"></a-option>
				</a-select>
				<a-tag v-else :style="{backgroundColor: 'var(--color-fill-2)',border: '1px dashed var(--color-fill-3)',cursor: 'pointer',}" @click="showInput=true">
					<template #icon>
						<icon-plus />
					</template>
					{{$t("util.add")}}
				</a-tag>
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
			</a-space>
		</a-row>
	</div>
</template>

<script setup lang="ts">

import {ICommon_Model_Project_Label} from "../../../../../../../common/model/project_label";
import {inject, ref, watch} from "vue";
import {apiIssue, apiProject} from "../../../request/request";
import {injectProjectInfo} from "../../../util/symbol";

const props=defineProps<{
	isEdit:boolean,
	showValue?:ICommon_Model_Project_Label[],
	projectIssueId:string
}>()
const emit=defineEmits<{
	cancel:[],
	update:[value:ICommon_Model_Project_Label[]]
}>()
const labelList=ref<{
	id:string,
	name:string
}[]>([])
const editValue=ref<{
	id:string,
	name:string
}[]>()
const showInput=ref(false)
const addValue=ref("")
const projectId=inject(injectProjectInfo).id;

const assignValue=()=>{
	editValue.value=props.showValue.length>0?props.showValue.map(item=>{
		return {
			id:item.id,
			name:item.name
		}
	}):[]
	showInput.value=false
	addValue.value=""
}
watch(()=>props.showValue,()=>{
	assignValue()
},{
	immediate:true,
	deep:true
})

const onCloseLabelTag=(index:number)=>{
	editValue.value.splice(index,1)
}

const onSearchLabel=async (keyword:string)=>{
	let res=await apiProject.listLabel({
		projectId,
		keyword,
		page:0,
		size:10
	})
	if(res?.code==0) {
		labelList.value=res.data.data
	}
}

const onAddChange=()=>{
	let arr=editValue.value as {
		id:string,
		name:string
	}[]
	let index=labelList.value.findIndex((item)=>{
		if(item.id==addValue.value) {
			return true;
		}
	})
	arr.push({
		id:labelList.value[index].id,
		name:labelList.value[index].name
	})
	addValue.value=""
	showInput.value=false
}

const onClick=async ()=>{
	let arr=editValue.value as {
		id:string,
		name:string
	}[]
	let arrId=Array.from(new Set(arr.map(item=>item.id)));
	let res=await apiIssue.bindLabel({
		projectIssueId:props.projectIssueId,
		labelIds:arrId
	})
	if(res?.code==0) {
		emit("update",res.data)
	}
}

const onBlur=()=>{
	emit('cancel')
	assignValue()
}
</script>

<style scoped>

</style>