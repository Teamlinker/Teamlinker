<template>
  <div :style="{width:Icon.width+'px',height:Icon.height+'px',left:point.left,top:point.top,position: 'absolute'}" @focus="onFocus" @blur="onBlur" :tabindex="index" v-drag="point" v-menu="item.onContextMenu" @dblclick="item.onDBClick" @dragend="item.onMove">
    <a-row :style="{width: Icon.width+'px',height:Icon.width+'px',textAlign: 'center'}" style="justify-content: center;align-items: center">
      <sicon name="Ant" :type="item.icon" size="40" color=""></sicon>
    </a-row>
    <div :style="{width: '100%',height:Icon.height-Icon.width+'px'}" style="overflow: hidden;text-overflow:ellipsis;textAlign:center;vertical-align:middle;white-space: nowrap;user-select: none;color: rgb(249,249,249)">
      {{item.name}}
    </div>
  </div>
</template>

<script setup lang="ts">
import {Icon} from "./icon"
import {vDrag} from "../common/directive/drag";
import {vMenu} from "../common/directive/menu";

vMenu;
vDrag;
const props=defineProps<{
  item:Icon,
  index:number,
}>();
let point=props.item.point;
const onFocus=(ev)=> {
  ev.target.style.backgroundColor="rgba(0,0,0,0.1)"
}

const onBlur=(ev)=>{
  ev.target.style.backgroundColor="rgba(111,111,11,0)"
}
</script>

<style scoped>

</style>