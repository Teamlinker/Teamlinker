<template>
  <template v-if="!isEdit">
    <span v-if="showValue">{{showValue}}</span>
    <span v-else style="line-height: 30px;width: 100%;color: gray">{{$t("util.none")}}</span>
  </template>
  <template v-else>
    <a-space size="mini">
      <a-input v-model="editValue"></a-input>
      <slot :value="editValue"></slot>
    </a-space>
  </template>
</template>

<script setup lang="ts">
import {ref, watchEffect} from "vue";

const props=defineProps<{
  value?:string,
  isEdit:boolean
}>()
const showValue=ref();
const editValue=ref();
watchEffect(()=>{
  showValue.value=props.value??""
  editValue.value=props.value??""
})
</script>

<style scoped>

</style>