<template>
	<div style="padding: 0 10px">
		<a-form layout="vertical" :model="form" ref="eleForm">
			<a-form-item :label="$t('util.issueType')" field="issueTypeId" required>
				<a-select v-model="form.issueTypeId" @change="onIssueTypeChange">
					<a-option v-for="item in issueTypeList" :label="item.name" :value="item.id"></a-option>
				</a-select>
			</a-form-item>
			<a-divider orientation="left" v-if="valueList.length>0">{{$t("controller.app.project.issue.projectIssueConvert.convertFields")}}</a-divider>
			<a-form-item v-for="value in valueList" :key="value.field.id" :extra="value.field.description" :field="value.field.name" :required="!value.field.optional">
				<template #label>
					{{value.field.name}}&nbsp;
					<template v-if="value.fieldType.type!==ECommon_Field_Type.SELECT && value.fieldType.type!==ECommon_Field_Type.MULTISELECT">
						<a-popover>
							<icon-import></icon-import>
							<template #content>
								<a-list hoverable>
									<a-list-item v-for="item in originValueList.filter(item=>item.nodeField.fieldType.type===value.fieldType.type)" :key="item.issueFieldValue.id">
										{{item.nodeField.field.name}}&nbsp;&nbsp;
										<template #actions>
											<a-button type="primary" size="mini" @click="onImport(item,value)">{{$t("util.import")}}</a-button>
										</template>
									</a-list-item>
								</a-list>
							</template>
						</a-popover>
					</template>
				</template>
				<FieldInput :item="value" :project-id="projectId"></FieldInput>
			</a-form-item>
		</a-form>
	</div>
</template>

<script setup lang="ts">
import FieldInput from "@/business/common/component/field/fieldInput.vue";
import {onBeforeMount, reactive, ref, toRef} from "vue";
import {apiIssue, apiProject} from "@/business/common/request/request";
import {ICommon_Model_Issue_Type} from "../../../../../../../common/model/issue_type";
import {
	ICommon_Route_Req_ProjectIssue_Field,
	ICommon_Route_Res_ProjectIssue_fieldsInfo,
	ICommon_Route_Res_Workflow_Node_Field
} from "../../../../../../../common/routes/response";
import {ECommon_Field_Type} from "../../../../../../../common/field/type";
import {onDialogOk} from "@/business/common/component/dialog/dialog";
import {dialogFuncGenerator} from "@/business/common/util/helper";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	projectId:string,
	projectIssueId:string,
	issueTypeId:string
}>()
const eleForm=ref(null);
const issueTypeList=ref<DCSType<ICommon_Model_Issue_Type>[]>([])
const valueList=ref<DCSType<(ICommon_Route_Res_Workflow_Node_Field & {
	fieldValue:ICommon_Route_Req_ProjectIssue_Field
})>[]>([])
const originValueList=ref<DCSType<ICommon_Route_Res_ProjectIssue_fieldsInfo>[]>([])
const form=reactive({
	issueTypeId:"",
})
const onIssueTypeChange=async ()=>{
	let res=await apiIssue.listConvertField({
		projectId:props.projectId,
		issueTypeId:form.issueTypeId
	})
	if(res?.code==0) {
		valueList.value=res.data.map(item=>{
			return {
				...item,
				fieldValue:{
					fieldId:item.field.id,
					value:null
				}
			}
		})
		valueList.value.forEach(item=>{
			form[item.field.name]=toRef(item.fieldValue,"value")
		})
	}
}

const onImport=async (item:DCSType<ICommon_Route_Res_ProjectIssue_fieldsInfo>,value:DCSType<(ICommon_Route_Res_Workflow_Node_Field & {
	fieldValue:ICommon_Route_Req_ProjectIssue_Field
})>)=>{
	if(value.fieldType.type===ECommon_Field_Type.TEXT || value.fieldType.type===ECommon_Field_Type.MULTITEXT || value.fieldType.type===ECommon_Field_Type.DATE || value.fieldType.type===ECommon_Field_Type.TIME) {
		value.fieldValue.value=item.issueFieldValue.string_value
	} else if(value.fieldType.type===ECommon_Field_Type.SWITCH) {
		value.fieldValue.value=item.issueFieldValue.number_value
	} else if ((value.fieldType.type===ECommon_Field_Type.LABEL || value.fieldType.type===ECommon_Field_Type.MULTILABEL) && value.field.label_type===item.nodeField.field.label_type) {
		value.fieldValue.value=item.issueFieldValue.ref_values
	}
}


const getIssueTypeList=async ()=>{
	let res=await apiProject.issueTypeList({
		projectId:props.projectId
	})
	if(res?.code==0) {
		issueTypeList.value=res.data.filter(item=>item.id!==props.issueTypeId)
	}
}

const getOriginValueList=async ()=>{
	let res=await apiIssue.fieldsInfo({
		projectIssueId:props.projectIssueId
	})
	if(res?.code==0) {
		originValueList.value=res.data
	}
}

onBeforeMount(async ()=>{
	getIssueTypeList()
	getOriginValueList()
})

onDialogOk(dialogFuncGenerator({
	form:()=>{
		return eleForm.value
	},
	func:()=>{
		return apiIssue.convert({
			projectIssueId:props.projectIssueId,
			values:valueList.value.map(item=>item.fieldValue),
			issueTypeId:form.issueTypeId
		})
	}
}))
</script>

<style scoped>

</style>