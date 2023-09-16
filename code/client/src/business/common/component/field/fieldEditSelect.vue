<template>
  <a-space v-if="!isEdit" size="mini">
    <template v-if="showValue">
      <a-tag>{{showValue}}</a-tag>
    </template>
    <span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("util.none")}}</span>
  </a-space>
  <template v-else>
    <a-space size="mini">
      <a-select v-model="editValue" allow-clear>
        <a-option v-for="item1 in list" :label="item1.value" :value="item1.id"></a-option>
      </a-select>
      <slot :value="editValue"></slot>
    </a-space>
  </template>
</template>

<script setup lang="ts">
import {ref, watchEffect} from "vue";

const props=defineProps<{
  isEdit:boolean,
  value?:string[],
  list:any[]
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
    })[0]?.value
    editValue.value=props.list.filter(item=>{
      if(props.value.includes(item.id)) {
        return true;
      } else {
        return false;
      }
    })[0]?.id
  } else {
    showValue.value=""
    editValue.value=""
  }
})
</script>

<style scoped>

</style>