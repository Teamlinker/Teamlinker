<template>
	<div>
		<template v-if="!isEdit">
			<a-space wrap size="mini" v-if="showValue">
				<BoardSprintPreview :key="showValue.id" :board-sprint-id="showValue.id" :name="showValue.name"></BoardSprintPreview>
			</a-space>
			<span v-else style="line-height: 30px;width: 100%;color: grey">{{$t("util.none")}}</span>
		</template>
		<a-row style="padding-right: 10px" v-else>
			<a-space size="mini" wrap>
				<a-select v-model="addValue" allow-search @search="onSearchSprint">
					<a-option v-for="item in labelList" :label="item.name" :value="item.id">
						{{item.boardName+" -> "+item.name}}
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
			</a-space>
		</a-row>
	</div>
</template>

<script setup lang="ts">

import {inject, ref, watch} from "vue";
import {injectProjectInfo} from "../../../util/symbol";
import {apiBoard} from "../../../request/request";
import BoardSprintPreview from "@/business/controller/app/project/board/boardSprintPreview.vue";

const props=defineProps<{
	isEdit:boolean,
	showValue?:{
		id:string,
		name:string
	},
	projectIssueId:string
}>()
const emit=defineEmits<{
	cancel:[],
	update:[value:{
		id:string,
		name:string
	}]
}>()
const labelList=ref<{
	id:string,
	name:string,
	boardName:string
}[]>([])
const editValue=ref<{
	id:string,
	name:string
}>()
const addValue=ref("")
const projectId=inject(injectProjectInfo).id;

const assignValue=()=>{
	editValue.value={
		id:props.showValue?.id,
		name:props.showValue?.name
	}
	addValue.value=""
}

watch(()=>props.showValue,()=>{
	assignValue()
},{
	immediate:true,
	deep:true
})


const onSearchSprint=async (keyword:string)=>{
	let res=await apiBoard.filterSprint({
		projectId,
		keyword:keyword,
		page:0,
		size:10
	})
	if(res?.code==0) {
		labelList.value=res.data.data.map(item=>{
			return {
				id:item.id,
				name:item.name,
				boardName:item.board.name
			}
		})
	}
}

const onClick=async ()=>{
	if(addValue.value) {
		let res=await apiBoard.addSprintIssues({
			boardSprintId:addValue.value,
			projectIssueIds:[props.projectIssueId]
		})
		if(res?.code==0) {
			emit("update",labelList.value.find(item=>item.id===addValue.value))
		}
	} else {
		let res=await apiBoard.removeProjectIssue({
			projectIssueId:props.projectIssueId
		})
		if(res?.code==0) {
			emit("update",null)
		}
	}

}

const onBlur=()=>{
	emit('cancel')
	assignValue()
}

</script>

<style scoped>

</style>