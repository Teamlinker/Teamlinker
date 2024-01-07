<template>
	<div>
		<template v-if="!isEdit">
			<a-space wrap size="mini" v-if="showValue.length>0">
				<template #split>
					/
				</template>
				<span v-for="item in showValue" style="color: blue">{{item.name}}</span>
			</a-space>
			<span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("util.none")}}</span>
		</template>
		<a-row style="padding-right: 10px" v-else>
			<a-cascader v-model="editValue" :field-names="fields" :options="moduleList" :placeholder="$t('placeholder.pleaseSelect')" :format-label="format" check-strictly allow-clear allow-search></a-cascader>
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

import {ICommon_Model_Project_Module} from "../../../../../../../common/model/project_module";
import {inject, ref, watch} from "vue";
import {injectProjectInfo} from "../../../util/symbol";
import {ICommon_Route_Res_Project_CreateModule_Data} from "../../../../../../../common/routes/response";
import {apiIssue, apiProject} from "../../../request/request";

const props=defineProps<{
	isEdit:boolean,
	showValue?:ICommon_Model_Project_Module[],
	projectIssueId:string
}>()
const emit=defineEmits<{
	cancel:[],
	update:[value:ICommon_Model_Project_Module[]]
}>()
const labelList=ref<{
	id:string,
	name:string
}[]>([])
const editValue=ref("")
const fields={
	label:"name",
	value:"id",
	children:"data"
}
const projectId=inject(injectProjectInfo).id;
const moduleList=ref<ICommon_Route_Res_Project_CreateModule_Data[]>([])
const assignValue=()=>{
	editValue.value=props.showValue.length>0?props.showValue[props.showValue.length-1].id:""
}
watch(()=>props.showValue,()=>{
	assignValue()
},{
	immediate:true,
	deep:true
})
watch(()=>props.isEdit,()=>{
	getModuleList()
})
const format = (options) => {
	const labels = options.map(option => option.name)
	return labels.join('/')
}

const getModuleList=async ()=>{
	let res=await apiProject.listModule({
		projectId
	})
	if(res?.code==0) {
		moduleList.value=res.data
	}
}

const onClick=async ()=>{
	let res=await apiIssue.bindModule({
		projectIssueId:props.projectIssueId,
		moduleId:editValue.value
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