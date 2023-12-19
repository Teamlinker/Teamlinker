<template>
  <div style="width:130px;height: 140px;border: 1px solid gainsboro;text-align: center;border-radius: 5px;cursor: pointer;position: relative" @mouseenter="onHover" @mouseleave="onLeave">
    <a-dropdown trigger="hover" v-if="action">
      <icon-more-vertical style="position: absolute;top: 5px;right:5px" @click="onStop($event)"></icon-more-vertical>
      <template #content>
        <a-doption v-for="item in action" @click="item.func">{{item.name}}</a-doption>
      </template>
    </a-dropdown>
    <a-space direction="vertical" size="small" style="margin-top: 10px;" fill >
      <a-avatar :size="64" :image-url="photo" style="margin-left: 33px">{{imgName}}</a-avatar>
      <span style="text-align: center;width: 130px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap">{{name}}</span>
      <span style="font-size: 12px;color: #6b778c;text-align: center;width: 130px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap ">{{ description }}</span>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";

const props=defineProps<{
  name:string,
  description?:string,
  photo?:string,
  action?:{
    name:string,
    func:any
  }[]
}>()
const onHover=(event:MouseEvent)=>{
  let target=event.currentTarget as HTMLElement
  target.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
}
const onLeave=(event:MouseEvent)=>{
  let target=event.currentTarget as HTMLElement
  target.style.boxShadow=""
}
const onStop=(event:MouseEvent)=>{
  event.stopPropagation()
  event.preventDefault()
}
const imgName=computed(()=>{
  if(props.name.includes(" ")) {
    let arr=props.name.split(" ")
    return arr[0][0].toUpperCase()+arr[1][0].toUpperCase()
  } else {
    return props.name[0].toUpperCase()
  }
})
</script>

<style scoped>

</style>