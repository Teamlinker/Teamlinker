<template>
  <div style="width: 100%;height: 100%;display: flex;flex-direction:column" ref="root" >
    <a-dropdown-button type="primary" size="small">
	    {{$t("util.add")}}
      <template #icon>
        <icon-down></icon-down>
      </template>
      <template #content>
        <a-doption @click="onAdd">{{$t("util.add")}}</a-doption>
        <a-doption @click="onCopyFrom">{{$t("controller.app.setting.issue.filedList.copyFrom")}}</a-doption>
      </template>
    </a-dropdown-button>
    <a-layout style="flex:1 1 auto;border: 1px solid gainsboro;margin-top: 10px;height: 0">
      <a-layout-content style="overflow-y:auto;height: 100%">
        <a-form :model="{}" auto-label-width size="small">
          <a-table :data="data" size="mini" :draggable="{}" :show-header="false" :columns="columns" @change="onHandleChange" @row-click="onClickRow" :pagination="false">
            <template #field="{record}">
              <a-form-item :label="record.field.name" :required="!record.field.optional" :extra="record.field.description" style="margin-top: 5px">
                <a-switch :default-checked="!!record.field.default_number_value" :checked-value="1" :unchecked-value="0" v-if="record.fieldType.type===ECommon_Field_Type.SWITCH" :key="record.field.default_number_value"></a-switch>
                <a-space v-else-if="record.fieldType.type===ECommon_Field_Type.MULTILABEL">
                  <a-tag>tag1</a-tag>
                  <a-tag>tag2</a-tag>
                  <a-tag>tag3</a-tag>
                </a-space>
                <a-tag v-else-if="record.fieldType.type===ECommon_Field_Type.LABEL">tag1</a-tag>
                <a-input :default-value="record.field.default_string_value" v-else-if="record.fieldType.type===ECommon_Field_Type.TEXT" :key="record.field.default_string_value"></a-input>
                <a-textarea :default-value="record.field.default_string_value" v-else-if="record.fieldType.type===ECommon_Field_Type.MULTITEXT" :key="record.field.default_string_value"></a-textarea>
                <a-select v-else-if="record.fieldType.type===ECommon_Field_Type.SELECT" :default-value="record.values.filter(item=>item.selected).map(item=>item.value)" :key="JSON.stringify(record.values)">
                  <a-option v-for="item in record.values" :label="item.value" :value="item.value"></a-option>
                </a-select>
                <a-select multiple v-else-if="record.fieldType.type===ECommon_Field_Type.MULTISELECT" :default-value="record.values.filter(item=>item.selected).map(item=>item.value)" :key="JSON.stringify(record.values)">
                  <a-option v-for="item in record.values" :label="item.value" :value="item.value"></a-option>
                </a-select>
                <a-date-picker  v-else-if="record.fieldType.type===ECommon_Field_Type.DATE"/>
                <a-time-picker v-else-if="record.fieldType.type===ECommon_Field_Type.TIME" />
              </a-form-item>
            </template>
          </a-table>
        </a-form>
      </a-layout-content>
      <a-layout-sider :resize-directions="['left']" :width="250">
        <a-form :model="form" layout="vertical" style="margin:10px 5px 0px 5px;width: 90%" v-if="form.type!==null && form.type!==undefined" @submitSuccess="onEdit" ref="eleForm">
          <a-form-item :label="$t('util.type')">
            {{Field_Types[form.type].name.toUpperCase()}}
          </a-form-item>
          <a-form-item field="name" :label="$t('util.name')" required>
            <a-input v-model="form.name"></a-input>
          </a-form-item>
          <a-form-item field="description" :label="$t('util.description')">
            <a-textarea v-model="form.description"></a-textarea>
          </a-form-item>
          <a-form-item field="optional" :label="$t('util.optional')">
            <a-switch v-model="form.optional" :checked-value="1" :unchecked-value="0"></a-switch>
          </a-form-item>
          <a-form-item field="default_string_value" :label="$t('util.default')" v-if="form.type===ECommon_Field_Type.TEXT || form.type===ECommon_Field_Type.MULTITEXT">
            <a-input v-model="form.default_string_value" v-if="form.type==ECommon_Field_Type.TEXT"></a-input>
            <a-textarea v-model="form.default_string_value" v-if="form.type==ECommon_Field_Type.MULTITEXT" allow-clear></a-textarea>
          </a-form-item>
          <a-form-item field="default_string_value" :label="$t('util.default')" v-if="form.type===ECommon_Field_Type.SWITCH">
            <a-switch v-model="form.default_number_value" :checked-value="1" :unchecked-value="0"></a-switch>
          </a-form-item>
          <a-form-item field="label_type" :label="$t('util.labelType')" v-if="form.type===ECommon_Field_Type.LABEL || form.type===ECommon_Field_Type.MULTILABEL">
            <a-select v-model="form.label_type">
              <a-option :value="ECommon_Model_Workflow_Node_Field_Type_Label_Type.USER" label="USER"></a-option>
              <a-option :value="ECommon_Model_Workflow_Node_Field_Type_Label_Type.RELEASE" label="RELEASE"></a-option>
              <a-option :value="ECommon_Model_Workflow_Node_Field_Type_Label_Type.ISSUE" label="ISSUE"></a-option>
	            <a-option :value="ECommon_Model_Workflow_Node_Field_Type_Label_Type.SPRINT" label="SPRINT"></a-option>
            </a-select>
          </a-form-item>
          <a-form-item field="values" :label="$t('util.options')" v-if="form.type==ECommon_Field_Type.SELECT || form.type==ECommon_Field_Type.MULTISELECT">
            <a-checkbox-group v-model="valueSelected" :max="form.type==ECommon_Field_Type.SELECT?1:100" style="width: 100%">
              <a-table :data="form.values" :draggable="{ type: 'handle', width: 20 }" :columns="columnsValues" :show-header="false" style="width: 100%" :pagination="false" @change="(_data)=>{form.values=_data as any}">
                <template #name="{record,rowIndex}">
                  <a-input size="small" v-model="record.value"></a-input>
                </template>
                <template #operation="{record,rowIndex}">
                  <a-space>
                    <a-checkbox :value="record.value" ></a-checkbox>
                    <a-button size="mini" type="text" @click="form.values.splice(rowIndex,1)">
                      <template #icon>
                        <IconClose style="color: red"></IconClose>
                      </template>
                    </a-button>
                  </a-space>
                </template>
                <template #footer>
                  <a-button size="mini" html-type="button" type="primary" @click="onAddValue">
	                  {{$t("util.addItem")}}
                  </a-button>
                </template>
              </a-table>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item>
            <a-space style="width: 100%;display: flex;justify-content: flex-end">
              <a-button type="primary" html-type="submit">{{$t("util.save")}}</a-button>
              <a-button status="danger" html-type="button" @click="onDelete">{{$t("util.delete")}}</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import {computed, getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiField} from "../../../../common/request/request";
import {ICommon_Route_Res_Workflow_Node_Field} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import {ECommon_Field_Type, Field_Types} from "../../../../../../../common/field/type";
import {
	ECommon_Model_Workflow_Node_Field_Type_Label_Type
} from "../../../../../../../common/model/workflow_node_field_type";
import AddField from "./addField.vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import FieldCopyFrom from "./FieldCopyFrom.vue";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  workflowNodeId:string
}>()
const eleForm=ref(null)
const root=ref(null)
const appContext=getCurrentInstance().appContext
const data=ref<ICommon_Route_Res_Workflow_Node_Field[]>([])
const {t}=useI18n()
const columns = reactive([
  {
    title: "",
    slotName: "field",
  },
]);
const columnsValues=reactive([
  {
    title:"",
    slotName:"name"
  },
  {
    title:"",
    slotName: "operation"
  }
])
const form=reactive({
  name:"",
  description:"",
  id:"",
  type:null,
  optional:0,
  default_string_value:"",
  default_number_value:0,
  label_type:0,
  values:[] as {
		id?:string
    value:string,
    selected:number
  }[]
})
const valueSelected=computed({
  get:()=>{
    return form.values.filter(item=>item.selected).map(item=>item.value)
  },
  set:(newValue)=>{
    form.values.forEach(item=>{
      if(newValue.includes(item.value)) {
        item.selected=1
      } else {
        item.selected=0
      }
    })
  }
})
const onAdd=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(AddField),{
    workflowNodeId:props.workflowNodeId
  })
  if(ret) {
    requestList();
  }
}
const onCopyFrom=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.copy"),markRaw(FieldCopyFrom),{
    workflowNodeId:props.workflowNodeId
  })
  if(ret) {
    requestList();
  }
}
const onEdit=async ()=>{
  let res=await apiField.editWorkflowNodeField({
    workflowNodeFieldTypeId:form.id,
    name:form.name,
    description:form.description,
    optional:form.optional,
    defaultStringValue:form.default_string_value,
    defaultNumberValue:form.default_number_value,
    labelType:form.label_type
  })
  if(res?.code==0) {
    let resData=res.data;
    if(resData.field_type_id==ECommon_Field_Type.SELECT || resData.field_type_id==ECommon_Field_Type.MULTISELECT){
      let res=await apiField.editWorkflowNodeFieldConfig({
        workflowNodeFieldTypeId:resData.id,
        data:form.values
      })
      if(res?.code==0) {
        for(let obj of data.value) {
          if(obj.field.id===resData.id) {
            obj.values=res.data
            break
          }
        }
      } else {
        Message.error(res.msg)
        return;
      }
    }
    Message.success(t("tip.saveSuccess"))
    for(let obj of data.value) {
      if(obj.field.id===resData.id) {
        Object.assign(obj.field,resData);
        break
      }
    }
  } else {
    Message.error(res.msg)
  }
}
const onHandleChange=async (_data:ICommon_Route_Res_Workflow_Node_Field[])=>{
  let ids=_data.map(item=>{
    return item.field.id
  })
  let res=await apiField.setWorkflowNodeFieldsWeight({
    workflowNodeFieldTypeIds:ids.join(",")
  })
  if(res?.code==0) {
    data.value=_data
  }
}
const onClickRow=async (item:ICommon_Route_Res_Workflow_Node_Field)=>{
  form.type=item.field.field_type_id;
  form.label_type=item.field.label_type
  form.name=item.field.name
  form.optional=item.field.optional
  form.id=item.field.id
  form.description=item.field.description
  form.default_number_value=item.field.default_number_value
  form.default_string_value=item.field.default_string_value
  if(item.values) {
    form.values=[]
    for(let obj of item.values) {
      form.values.push({
	      id:obj.id,
        value:obj.value,
        selected:obj.selected
      })
    }
  }
}
const onAddValue=async ()=>{
  form.values.push({
    value:"",
    selected:0
  })
}
const onDelete=async ()=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteField"))
  if(ret) {
    let res=await apiField.deleteWorkflowNodeField({
      workflowNodeFieldTypeId:form.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      form.id=""
      form.type=null
      requestList();
    } else {
      Message.error(res.msg)
    }
  }
}
const requestList=async ()=>{
  let res=await apiField.listWorkflowNodeField({
    workflowNodeId:props.workflowNodeId
  })
  if(res?.code==0) {
    data.value=res.data
  } else {
    Message.error(res.msg)
  }
}
onBeforeMount(()=>{
  requestList();
})
</script>

<style scoped>

</style>