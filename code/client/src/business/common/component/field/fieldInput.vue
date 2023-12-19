<template>
  <span style="display: inline-block;width: 100%">
    <a-switch :default-checked="!!item.field.default_number_value" :checked-value="1" :unchecked-value="0" v-if="item.fieldType.type===ECommon_Field_Type.SWITCH" v-model="item.fieldValue.value"></a-switch>
    <a-input :default-value="item.field.default_string_value" v-else-if="item.fieldType.type===ECommon_Field_Type.TEXT" v-model="item.fieldValue.value"></a-input>
    <a-textarea :default-value="item.field.default_string_value" v-else-if="item.fieldType.type===ECommon_Field_Type.MULTITEXT" v-model="item.fieldValue.value"></a-textarea>
    <a-date-picker  v-else-if="item.fieldType.type===ECommon_Field_Type.DATE" v-model="item.fieldValue.value"/>
    <a-time-picker v-else-if="item.fieldType.type===ECommon_Field_Type.TIME" v-model="item.fieldValue.value"/>
    <a-select v-else-if="item.fieldType.type===ECommon_Field_Type.SELECT" :default-value="item.values.filter((item1:ICommon_Model_Workflow_Node_Field_Type_Config)=>item1.selected).map((item1:ICommon_Model_Workflow_Node_Field_Type_Config)=>item1.id)" v-model="item.fieldValue.value">
      <a-option v-for="item in item.values" :label="item.value" :value="item.id"></a-option>
    </a-select>
    <a-select multiple v-else-if="item.fieldType.type===ECommon_Field_Type.MULTISELECT" :default-value="item.values.filter((item1:ICommon_Model_Workflow_Node_Field_Type_Config)=>item1.selected).map((item1:ICommon_Model_Workflow_Node_Field_Type_Config)=>item1.id)" v-model="item.fieldValue.value">
      <a-option v-for="item in item.values" :label="item.value" :value="item.id"></a-option>
    </a-select>
    <a-select v-else-if="item.fieldType.type===ECommon_Field_Type.MULTILABEL" allow-search @search="onSearchMultiLabel"  v-model="item.fieldValue.value" multiple>
      <a-option v-for="item1 in multiLabelList" :value="item1.id" :label="item1.name"></a-option>
    </a-select>
    <a-select v-else-if="item.fieldType.type===ECommon_Field_Type.LABEL" allow-search @search="onSearchLabel" v-model="item.fieldValue.value">
      <a-option v-for="item1 in labelList" :value="item1.id" :label="item1.name"></a-option>
    </a-select>
  </span>
</template>

<script setup lang="ts">
import {apiBoard, apiIssue, apiOrganization, apiRelease} from "../../request/request";
import {
	ICommon_Route_Req_ProjectIssue_Field,
	ICommon_Route_Res_Project_Issue_filter_Item,
	ICommon_Route_Res_Release_Item,
	ICommon_Route_Res_Workflow_Node_Field
} from "../../../../../../common/routes/response";
import {ECommon_Field_Type} from "../../../../../../common/field/type";
import {ref, watch} from "vue";
import {
	ECommon_Model_Workflow_Node_Field_Type_Label_Type
} from "../../../../../../common/model/workflow_node_field_type";
import {SessionStorage} from "../../storage/session";
import {
	ICommon_Model_Workflow_Node_Field_Type_Config
} from "../../../../../../common/model/workflow_node_field_type_config";
import {ICommon_Model_Board_Sprint} from "../../../../../../common/model/board_sprint";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
  item:DCSType<ICommon_Route_Res_Workflow_Node_Field & {
    fieldValue:ICommon_Route_Req_ProjectIssue_Field
  }>,
  projectId:string
}>()
switch (props.item.fieldType.type) {
  case ECommon_Field_Type.SWITCH:{
    props.item.fieldValue.value=props.item.field.default_number_value??0
    break
  }
  case ECommon_Field_Type.TEXT:{
    props.item.fieldValue.value=props.item.field.default_string_value??""
    break
  }
  case ECommon_Field_Type.MULTITEXT:{
    props.item.fieldValue.value=props.item.field.default_string_value??""
    break
  }
  case ECommon_Field_Type.DATE:{
    props.item.fieldValue.value=""
    break
  }
  case ECommon_Field_Type.TIME:{
    props.item.fieldValue.value=""
    break
  }
  case ECommon_Field_Type.SELECT:{
    let arr=props.item.values.filter(item=>item.selected);
    if(arr.length>0) {
      props.item.fieldValue.value=arr[0].id
    } else {
      props.item.fieldValue.value=props.item.values.length>0?props.item.values[0].id:[]
    }
    break
  }
  case ECommon_Field_Type.MULTISELECT:{
    let arr=props.item.values.filter(item=>item.selected);
    if(arr.length>0) {
      props.item.fieldValue.value=arr.map(item=>item.id)
    } else {
      props.item.fieldValue.value=props.item.values.length>0?[props.item.values[0].id]:[]
    }
    break
  }
  case ECommon_Field_Type.LABEL:{
    break
  }
  case ECommon_Field_Type.MULTILABEL:{
    break
  }
  default:
    break
}
watch(()=>props.item,async ()=>{
	if(props.item.fieldType.type===ECommon_Field_Type.LABEL) {
		if(/\d{16,}/.test(props.item.fieldValue.value as string)) {
			if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER) {
				apiOrganization.userProfile({
					organizationUserId:props.item.fieldValue.value as string
				}).then(res=>{
					if(res?.code==0) {
						labelList.value=[{
							id:res.data.organizationUser.id,
							name:res.data.organizationUser.nickname,
							photo:res.data.user.photo
						}]
					}
				})
			} else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE) {
				apiIssue.filter({
					projectIssueIds:[props.item.fieldValue.value as string],
					projectId:props.projectId,
					page:0,
					size:1
				}).then(res=>{
					if(res?.code==0) {
						labelList.value=res.data.data
					}
				})
			} else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE) {
				apiRelease.list({
					projectReleaseIds:[props.item.fieldValue.value as string],
					projectId:props.projectId,
					page:0,
					size:1
				}).then(res=>{
					if(res?.code==0) {
						labelList.value=res.data.data
					}
				})
			} else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT) {
				apiBoard.filterSprint({
					boardSprintIds:[props.item.fieldValue.value as string],
					projectId:props.projectId,
					page:0,
					size:1
				}).then(res=>{
					if(res?.code==0) {
						labelList.value=res.data.data
					}
				})
			}
		}
	} else if(props.item.fieldType.type===ECommon_Field_Type.MULTILABEL) {
		if((props.item.fieldValue.value as string[])?.length>0 && /\d{16,}/.test(props.item.fieldValue.value[0])) {
			if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER) {
				apiOrganization.listUser({
					organizationUserIds:props.item.fieldValue.value as string[],
					page:0,
					size:(props.item.fieldValue.value as string[]).length
				}).then(res=>{
					if(res?.code==0) {
						multiLabelList.value=res.data.data.map(item=>{
							return {
								id:item.organizationUser.id,
								name:item.organizationUser.nickname,
								photo:item.user.photo
							}
						})
					}
				})
			} else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE) {
				apiIssue.filter({
					projectId:props.projectId,
					projectIssueIds:props.item.fieldValue.value as string[],
					page:0,
					size:(props.item.fieldValue.value as string[]).length
				}).then(res=>{
					if(res?.code==0) {
						multiLabelList.value=res.data.data
					}
				})
			} else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE) {
				apiRelease.list({
					projectId:props.projectId,
					projectReleaseIds:props.item.fieldValue.value as string[],
					page:0,
					size:(props.item.fieldValue.value as string[]).length
				}).then(res=>{
					if(res?.code==0) {
						multiLabelList.value=res.data.data
					}
				})
			} else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT) {
				apiBoard.filterSprint({
					projectId:props.projectId,
					boardSprintIds:props.item.fieldValue.value as string[],
					page:0,
					size:(props.item.fieldValue.value as string[]).length
				}).then(res=>{
					if(res?.code==0) {
						multiLabelList.value=res.data.data
					}
				})
			}
		}
	}
},{
	immediate:true,
	deep:true
})
const multiLabelList=ref<DCSType<ICommon_Route_Res_Project_Issue_filter_Item | ICommon_Route_Res_Release_Item | ICommon_Model_Board_Sprint | {
  name:string,
  id:string,
  photo:string
}>[]>([])
const labelList=ref<DCSType<ICommon_Route_Res_Project_Issue_filter_Item | ICommon_Route_Res_Release_Item | ICommon_Model_Board_Sprint | {
  name:string,
  id:string,
  photo:string
}>[]>([])
const onSearchMultiLabel=async (value:string)=>{
  if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE) {
    let res=await apiIssue.filter({
      projectId:props.projectId,
      page:0,
      size:10,
      name:value
    })
    if(res?.code==0) {
      multiLabelList.value=res.data.data
    }
  } else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER) {
    let res=await apiOrganization.listUser({
      organizationId:SessionStorage.get("organizationId"),
      size:10,
      page:0,
      keyword:value
    })
    if(res?.code==0) {
      multiLabelList.value=res.data.data.map(item=>{
        return {
          id:item.organizationUser.id,
          name:item.organizationUser.nickname,
          photo:item.user.photo
        }
      })
    }
  } else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE) {
    let res=await apiRelease.list({
      projectId:props.projectId,
      name:value,
      page:0,
      size:10
    })
    if(res?.code==0) {
      multiLabelList.value=res.data.data
    }
  } else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT) {
	  let res=await apiBoard.filterSprint({
		  projectId:props.projectId,
		  keyword:value,
		  page:0,
		  size:10
	  })
	  if(res?.code==0) {
		  multiLabelList.value=res.data.data
	  }
  }
}
const onSearchLabel=async (value:string)=>{
  if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE) {
    let res=await apiIssue.filter({
      projectId:props.projectId,
      page:0,
      size:10,
      name:value
    })
    if(res?.code==0) {
      labelList.value=res.data.data
    }
  } else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER) {
    let res=await apiOrganization.listUser({
	    organizationId:SessionStorage.get("organizationId"),
	    size:10,
	    page:0,
	    keyword:value
    })
    if(res?.code==0) {
      labelList.value=res.data.data.map(item=>{
	      return {
		      id:item.organizationUser.id,
		      name:item.organizationUser.nickname,
		      photo:item.user.photo
	      }
      })
    }
  } else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE) {
    let res=await apiRelease.list({
      projectId:props.projectId,
      name:value,
      page:0,
      size:10
    })
    if(res?.code==0) {
      labelList.value=res.data.data
    }
  } else if(props.item.field.label_type===ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT) {
	  let res=await apiBoard.filterSprint({
		  projectId:props.projectId,
		  keyword:value,
		  page:0,
		  size:10
	  })
	  if(res?.code==0) {
		  labelList.value=res.data.data
	  }
  }
}
</script>

<style scoped>

</style>