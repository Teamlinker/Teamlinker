<template>
  <a-space v-if="!isEdit" wrap>
    <template v-if="showValue && showValue.length>0">
      <a-tag v-for="item in showValue">{{item.value}}</a-tag>
    </template>
    <span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("util.none")}}</span>
  </a-space>
  <template v-else>
    <a-space size="mini" wrap>
      <a-select v-model="editValue" allow-clear allow-search multiple>
        <a-option v-for="item1 in list" :label="item1.value" :value="item1.id"></a-option>
      </a-select>
      <slot :value="editValue"></slot>
    </a-space>
  </template>
</template>

<script setup lang="ts">
import {ref, watchEffect} from "vue";
import {
	ICommon_Model_Workflow_Node_Field_Type_Config
} from "../../../../../../common/model/workflow_node_field_type_config";

const props=defineProps<{
  isEdit:boolean,
  value?:string[],
  list:ICommon_Model_Workflow_Node_Field_Type_Config[]
}>()
const showValue=ref();
const editValue=ref();
watchEffect(()=>{
  if(props.value && props.value.length>0) {
    showValue.value=props.list.filter(item=>{
      if(props.value.includes(item.id)) {
        return true;
      } else {
        return false;
      }
    })
    editValue.value=[...showValue.value.map(item=>item.id)]
  } else {
    showValue.value=[]
    editValue.value=[]
  }

})
</script>

<style scoped>

</style>