<template>
  <span style="display: inline-block;width: 100%" @mouseenter="onEnter" @mouseleave="onLeave" tabindex="-1" @focusin="onFocus">
    <component :is="map[item.nodeField.fieldType.type]" v-bind="{
      value:value,
      isEdit:isEdit,
      ...((item.nodeField.fieldType.type===ECommon_Field_Type.SELECT || item.nodeField.fieldType.type===ECommon_Field_Type.MULTISELECT) && {
        list:list
      }),
      ...((item.nodeField.fieldType.type===ECommon_Field_Type.LABEL || item.nodeField.fieldType.type===ECommon_Field_Type.MULTILABEL) && {
        type:type
      }),
    }" v-slot="{value}">
      <a-button type="text" @click="onClick(value)">
        <template #icon>
          <icon-check></icon-check>
        </template>
      </a-button>
      <a-button type="text" @click="onBlur">
          <template #icon>
            <icon-close style="color: red"></icon-close>
          </template>
      </a-button>
    </component>
  </span>
</template>

<script setup lang="ts">
import {ICommon_Route_Res_ProjectIssue_fieldsInfo} from "../../../../../../common/routes/response";
import FieldEditText from "./fieldEditText.vue";
import {ECommon_Field_Type} from "../../../../../../common/field/type";
import FieldEditDate from "./fieldEditDate.vue";
import FieldEditMultiLabel from "./fieldEditMultiLabel.vue";
import FieldEditMultiText from "./fieldEditMultiText.vue";
import FieldEditSwitch from "./fieldEditSwitch.vue";
import FieldEditTime from "./fieldEditTime.vue";
import FieldEditSelect from "./fieldEditSelect.vue";
import FieldEditMultiSelect from "./fieldEditMultiSelect.vue";
import FieldEditLabel from "./fieldEditLabel.vue";
import {checkPermission, Permission_Types} from "../../../../../../common/permission/permission";
import {inject, markRaw, ref} from "vue";
import {apiIssue} from "../../request/request";
import {Message} from "@arco-design/web-vue";
import {injectProjectInfo} from "../../util/symbol";
import {ICommon_Model_Project_Issue_Field_Value} from "../../../../../../common/model/project_issue_field_value";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
  item:DCSType<ICommon_Route_Res_ProjectIssue_fieldsInfo>
}>()
const map={
  [ECommon_Field_Type.SWITCH]:markRaw(FieldEditSwitch),
  [ECommon_Field_Type.TEXT]:markRaw(FieldEditText),
  [ECommon_Field_Type.MULTITEXT]:markRaw(FieldEditMultiText),
  [ECommon_Field_Type.DATE]:markRaw(FieldEditDate),
  [ECommon_Field_Type.TIME]:markRaw(FieldEditTime),
  [ECommon_Field_Type.SELECT]:markRaw(FieldEditSelect),
  [ECommon_Field_Type.MULTISELECT]:markRaw(FieldEditMultiSelect),
  [ECommon_Field_Type.LABEL]:markRaw(FieldEditLabel),
  [ECommon_Field_Type.MULTILABEL]:markRaw(FieldEditMultiLabel)
}
const isEdit=ref(false)
const value=ref();
const permission=inject(injectProjectInfo).permission
const list=ref(props.item.nodeField.values??[])
const type=ref(props.item.nodeField.field.label_type)
const assignShowValue=(item:DCSType<ICommon_Model_Project_Issue_Field_Value>)=>{
  switch (props.item.nodeField.fieldType.type) {
    case ECommon_Field_Type.DATE:
    case ECommon_Field_Type.TIME:
    case ECommon_Field_Type.TEXT:
    case ECommon_Field_Type.MULTITEXT: {
      value.value=item.string_value
      break
    }
    case ECommon_Field_Type.SWITCH:{
      value.value=item.number_value
      break
    }
    case ECommon_Field_Type.SELECT:{
      value.value=item.field_config_ids
      break
    }
    case ECommon_Field_Type.MULTISELECT:{
      value.value=item.field_config_ids
      break
    }
    case ECommon_Field_Type.MULTILABEL:
    case ECommon_Field_Type.LABEL:{
      value.value=item.ref_values
      break
    }
    default:
      break
  }
}
assignShowValue(props.item.issueFieldValue)
const onEnter=(event:MouseEvent)=>{
  if(!isEdit.value) {
    const ele=event.currentTarget as HTMLElement
    ele.style.backgroundColor="rgb(230,231,237)"
  }
}
const onLeave=(event:MouseEvent)=>{
  const ele=event.currentTarget as HTMLElement
  ele.style.backgroundColor=""
}
const onFocus=async (event:MouseEvent)=>{
  if(checkPermission(permission.value,Permission_Types.Project.EDIT)) {
    isEdit.value=true
    const ele=event.currentTarget as HTMLElement
    ele.style.backgroundColor=""
  }
}
const onBlur=async ()=>{
  isEdit.value=false
  value.value=value.value
}
const onClick=async (value:any)=>{
  let res=await apiIssue.editExtraField({
    projectIssueId:props.item.issueFieldValue.project_issue_id,
    value:{
      value:value,
      fieldValueId:props.item.issueFieldValue.id,
      fieldId:props.item.nodeField.field.id
    }
  })
  if(res?.code==0) {
    onBlur()
    assignShowValue(res.data)
  } else {
    Message.error(res.msg);
  }
}
</script>

<style scoped>

</style>