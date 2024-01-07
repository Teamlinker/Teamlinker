<template>
	<a-spin :loading="loading" :tabindex="index"  v-menu="item.onContextMenu" @dblclick="item.onDBClick" @dragend="item.onMove" :title="item.name" @click="item.onClick">
		<div :style="{
		width:Icon.width+'px',
		height:Icon.height+'px',
		...(scale && {
			transform:`scale(${scale},${scale})`
		})
	}">
			<a-row :style="{width: Icon.width+'px',height:Icon.width+'px',textAlign: 'center'}" style="justify-content: center;align-items: center">
<!--				<sicon name="Ant" :type="item.icon" size="40" :color="item.iconColor"></sicon>-->
				<SvgIcon prefix="" :name="item.icon" class-name="" style="width: 45px;height: 45px"></SvgIcon>
			</a-row>
			<div :style="{width: '100%',height:Icon.height-Icon.width+'px',color:item.nameColor}" style="overflow-y: visible;text-overflow:ellipsis;textAlign:center;vertical-align:middle;white-space: nowrap;user-select: none;">
				<a-input ref="input" size="mini" v-if="item.rename" v-model="editName" :autofocus="true" @press-enter="onEnter" @blur="onBlur" @dragstart="$event.stopPropagation();$event.preventDefault()" @click="$event.stopPropagation();" @mousedown="$event.stopPropagation();" @mouseup="$event.stopPropagation();" @contextmenu="$event.stopPropagation();" @dblclick="$event.stopPropagation();" draggable="true"></a-input>
				<span style="white-space: normal;word-break: break-all;max-width: 100%;text-align: center;line-clamp: 4;-webkit-box-orient: vertical;overflow: hidden;display: -webkit-box;-moz-box-orient: vertical" v-else>
					{{item.name}}
				</span>
			</div>
		</div>
	</a-spin>
</template>

<script setup lang="ts">
import {Icon} from "./icon"
import {vMenu} from "../common/directive/menu";
import {computed, nextTick, ref, watch} from "vue";
import SvgIcon from "../../icon/svgIcon.vue";

const props=defineProps<{
  item:Icon,
  index:number,
	scale?:number
}>();
const editName=ref("")
const input=ref()
const loading=computed(props.item.loadingFunc?props.item.loadingFunc:()=>{
	return false
})
watch(()=>props.item.name,value => {
	editName.value=props.item.name
},{
	immediate:true
})
watch(()=>props.item.rename,value => {
	if(value===true) {
		nextTick(()=>{
			input.value.focus()
		})
	}
})
const onEnter=async ()=>{
	await props.item.onRename?.(props.item,editName.value)
	props.item.rename=false
}
const onBlur=()=>{
	props.item.rename=false
	editName.value=props.item.name
}
</script>

<style scoped>

</style>