<template>
  <div style="width: 180px;height: 130px;border-radius: 5px;cursor: pointer" @mouseenter="onHover" @mouseleave="onLeave">
    <a-row style="height: 50px;justify-content: left;align-items: center;padding-left: 10px;border-bottom: 1px solid rgb(240,240,240)">
      <a-space size="medium">
        <a-avatar :size="32" :image-url="photo"></a-avatar>
        <span style="max-width:120px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap">{{name}}</span>
      </a-space>
    </a-row>
    <a-row style="height: 35px;justify-content: space-between;align-items: center;padding: 0 10px">
      {{openTitle}}
      <a-tag size="small" color="#168cff">{{openCount}}</a-tag>
    </a-row>
    <a-row style="height: 35px;justify-content: space-between;align-items: center;padding: 0 10px">
      {{doneTitle}}
      <a-tag size="small" color="#168cff">{{doneCount}}</a-tag>
    </a-row>
    <a-row style="height: 10px"></a-row>
  </div>
</template>

<script setup lang="ts">

const props=defineProps<{
  projectId:string,
  photo?:string,
  name?:string,
  openTitle:string,
  openCount:number,
  doneTitle:string,
  doneCount:number
}>()
const onHover=(event:MouseEvent)=>{
  let target=event.currentTarget as HTMLElement
  target.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
}
const onLeave=(event:MouseEvent)=>{
  let target=event.currentTarget as HTMLElement
  target.style.boxShadow=""
}
</script>

<style scoped>

</style>