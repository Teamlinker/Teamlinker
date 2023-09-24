<template>
	<a-form :model="form" ref="eleForm">
		<a-form-item :label="$t('util.issueType')" field="issueTypeIds" required>
			<a-select v-model="form.issueTypeIds" multiple>
				<a-option v-for="item in issueTypeList" :value="item.id" :label="item.name"></a-option>
			</a-select>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {apiBoard} from "@/business/common/request/request";
import {onBeforeMount, reactive, ref} from "vue";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	boardId:string,
}>()
const form=reactive({
	issueTypeIds:[]
})
const {t}=useI18n()
const eleForm=ref(null)
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])

const getIssueTypeList=async ()=>{
	let res=await apiBoard.listUnBindIssueType({
		boardId:props.boardId
	})
	if(res?.code==0) {
		issueTypeList.value=res.data
	}
}

onBeforeMount(()=>{
	getIssueTypeList()
})

onDialogOk(dialogFuncGenerator({
	func:()=>{
		if(issueTypeList.value.length==0) {
			Message.error(t("tip.issueTypeCannotBeEmpty"))
			return false
		}
		return Promise.all(issueTypeList.value.map(item=>{
			return apiBoard.bindIssueType({
				boardId:props.boardId,
				issueTypeId:item.id
			})
		})).then(res=>{
			return res[0]
		})
	},
	form:()=>{
		return eleForm.value
	}
}))
</script>

<style scoped>

</style>