<template>
	<a-form :model="form" ref="eleForm" auto-label-width>
		<a-form-item field="issues" :label="$t('util.issues')" required>
			<a-select multiple allow-search v-model="form.issues" @search="onSearch">
				<a-optgroup v-for="(_,swimLaneName) in optionMap" :label="swimLaneName">
					<a-option v-for="item in optionMap[swimLaneName]" :value="item.id" :label="props.projectKey+'-'+item.unique_id">
						<a-space size="mini" wrap>
							{{props.projectKey+'-'+item.unique_id}}
							{{item.name}}
						</a-space>
					</a-option>
				</a-optgroup>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">

import {onBeforeMount, reactive, ref} from "vue";
import {apiBoard} from "@/business/common/request/request";
import {ICommon_Route_Res_Board_Sprint_Issue_Item} from "../../../../../../../common/routes/response";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	boardSprintSwimLaneId:string,
	boardSprintId:string
	projectKey:string
}>()

const form=reactive({
	issues:[]
})
const eleForm=ref()
const {t}=useI18n()
const issueMap=ref<{
	[swimLaneName:string]:DCSType<ICommon_Route_Res_Board_Sprint_Issue_Item>[]
}>()
const optionMap=ref<{
	[swimLaneName:string]:DCSType<ICommon_Route_Res_Board_Sprint_Issue_Item>[]
}>()
const getIssueList=async ()=>{
	let res=await apiBoard.listSprintIssue({
		boardSprintId:props.boardSprintId
	})
	if(res?.code==0) {
		issueMap.value={}
		for(let obj of res.data) {
			let name=""
			if(!obj.swimLane) {
				name=t("util.unNamed")
			} else {
				name=obj.swimLane.name
			}
			if(!issueMap.value[name]) {
				issueMap.value[name]=[]
			}
			issueMap.value[name].push(obj)
		}
		optionMap.value=JSON.parse(JSON.stringify(issueMap.value))
	}
}

const onSearch=async (keyword:string)=>{
	optionMap.value={}
	for(let swimLaneName in issueMap.value) {
		let value=issueMap.value[swimLaneName]
		optionMap.value[swimLaneName]=value.filter(item=>{
			if((props.projectKey+"-"+item.unique_id).includes(keyword) || item.name.includes(keyword)) {
				return true
			}
		})
		if(optionMap.value[swimLaneName].length==0) {
			delete optionMap.value[swimLaneName]
		}
	}
}

onBeforeMount(()=>{
	getIssueList()
})

onDialogOk(dialogFuncGenerator({
	form:()=>{
		return eleForm.value
	},
	func:()=>{
		if(form.issues.length==0) {
			Message.error(t("tip.issueShouldNotBeEmpty"))
			return false
		}
		return Promise.all(form.issues.map(item=>{
			return apiBoard.addProjectIssue(({
				boardSprintId:props.boardSprintId,
				boardSprintSwimLaneId:props.boardSprintSwimLaneId,
				projectIssueId:item
			}))
		})).then(res=>{
			return res[0]
		})
	}
}))
</script>

<style scoped>

</style>