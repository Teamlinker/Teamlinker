<template>
  <a-switch v-if="!isEdit" :unchecked-value="0" :checked-value="1" disabled :default-checked="!!showValue"></a-switch>
  <template v-else>
    <a-space size="mini">
      <a-switch v-model="editValue" :unchecked-value="0" :checked-value="1"></a-switch>
      <slot :value="editValue"></slot>
    </a-space>
  </template>
</template>

<script setup lang="ts">
import {ref, watchEffect} from "vue";

const props=defineProps<{
  value?:number,
  isEdit:boolean
}>()
const showValue=ref();
const editValue=ref();
watchEffect(()=>{
  showValue.value=props.value??0
  editValue.value=props.value??0
})
</script>

<style scoped>

</style>