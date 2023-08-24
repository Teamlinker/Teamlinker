<template>
  <div style="width: 100%;height: 100%;" ref="root">
    <template v-for="(item,index) in list">
      <component  :is="item" v-show="index==currentIndex"></component>
    </template>
  </div>
</template>

<script setup lang="ts">
import {inject, onMounted, onUnmounted, provide, ref, watchEffect} from "vue";
import {Navigator} from "./navigator";
import {NavigatorManager} from "./navigatorManager";

let props=defineProps<{
  id?:string,
  name?:string,
  routes:{
    [name:string]:any
  }
  default?:{
    name:string,
    props?:object,
    title?:string
  },
  meta?:{
    title?:string,
    data?:any
  },
  path?:{
    [name:string]:{
      name:string,
      props?:object
    }
  }
}>()
let root=ref(null);
let parent=inject("navigator",null) as Navigator;
const objNavigator=new Navigator(props.name,props.routes)
const duplicateFunc=ref()
objNavigator.setParent(parent);
let manager:NavigatorManager;
if(!parent) {
  manager=new NavigatorManager()
  objNavigator.setManager(manager)
  if(props.path) {
    manager.locate(JSON.parse(JSON.stringify(props.path)))
  }
  provide("navigatorManager",manager)
  provide("navigatorRootRef",root)
} else {
  manager=inject("navigatorManager",null) as NavigatorManager
  objNavigator.setManager(manager);
}
const list=objNavigator.list();
const currentIndex=objNavigator.getIndex();
provide("navigator",objNavigator)
if(props.default) {
  objNavigator.push(props.default.name,props.default.props,props.default.title);
}
if(props.meta) {
  provide("navigatorMeta",props.meta)
}
watchEffect(()=>{
  let objPath=manager.getObjPath();
  let obj=objPath[props.name]
  if(obj) {
    objNavigator.replaceRoot(obj.name,obj.props);
    delete objPath[props.name];
  }
})
onUnmounted(()=>{
  delete manager.getNavigators()[objNavigator.getName()]
})
defineExpose({
  navigator:objNavigator,
  navigatorManager:manager,
  id:props.id
})
onMounted(()=>{
  if(!parent) {
    manager.setRootElement(root.value);
  }
})
</script>

<style scoped>

</style>