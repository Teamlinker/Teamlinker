<template>
  <div style="position: absolute;left: 0;top: 0;width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;background-color: rgba(29,33,41,0.6);z-index: 1000" ref="root">
    <div style="background-color: white;height:auto;max-height: 80%;border-radius: 5px;display: flex;flex-direction: column" :style="{
			width:(parentNode.tagName==='BODY' || parentNode.id==='teamOS')?'40%':'60%'
    }">
      <div style="height: 35px;line-height: 35px;width: 100%;text-align: center;color: rgb(93,93,93);border-bottom: 1px solid gainsboro;flex: 1 1 auto">
        <b>{{component?title:input?$t("util.input"):$t("util.alert")}}</b>
      </div>
      <div style="display: flex;overflow: auto;box-sizing: border-box;padding: 10px;flex: 0 1 auto;height: calc(100% - 80px);width: 100%">
        <div style="width: 100%;flex: 1">
          <component :is="component" v-bind="Object.assign(props.props??{},{onClose:onClose})" v-if="component"></component>
          <a-input v-else-if="input" v-model="inputValue" :placeholder="title" style="width: 80%"></a-input>
          <div v-else style="min-height: 60px;padding: 10px;font-size: medium">
            {{title}}
          </div>
        </div>
      </div>
      <div style="height: 45px;width: 100%;display: flex;justify-content: flex-end;border-top: 1px solid gainsboro;flex: 1 0 auto">
        <a-space size="medium">
          <a-button type="primary" @click="onOk" size="small" html-type="submit" :loading="props.loading?props.loading.value:false">{{(component || input)?$t("util.ok"):$t("util.yes")}}</a-button>
          <a-button type="outline" style="margin-right: 10px" size="small" @click="onClose">{{(component || input)?$t("util.close"):$t("util.no")}}</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {provide, ref} from "vue";

const props=defineProps<{
	parentNode:HTMLElement,
  title:string,
  component?:any,
  props?:object,
  events?:{
    onOk:()=>any,
    onClose:()=>void
  },
  onOk:()=>void,
  onClose:()=>void,
  loading?:any,
  input?:{
    text:string
  }
}>()
const inputValue=props.input?props.input.text:ref("")
const root=ref()
provide("dialogRootRef",root)
if(props.events) {
  provide("dialogEvents",props.events);
}

</script>

<style scoped>

</style>