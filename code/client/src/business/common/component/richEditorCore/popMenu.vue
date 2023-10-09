<template>
	<div style="position: absolute;boxShadow:0px 0px 2px 2px rgba(169, 169, 169, 0.2);backgroundColor:white;border:1px solid rgba(169, 169, 169, 0.2);width:150px;height: 200px;overflow:auto;outlineWidth:0;z-index: 10000" tabIndex="-1">
		<div class="item" v-for="(item,index) in list" style="height: 35px;display:flex;align-items: center;justify-content: center;cursor: pointer" :key="item.type" :style="{borderBottom:index!==list.length-1?'rgb(241,241,241) 1px solid':''}" @mousedown="onClick(item)">
			{{item.title}}
		</div>
	</div>
</template>

<script setup lang="ts">
import {nextTick, ref} from "vue";
import {RichEditorEvent} from "./event";
import {RichEditorHandle} from "./handle";
import {IEditor_Content_Line_Config} from "./types";

const props=defineProps<{
	objEditor:RichEditorEvent,
	popMenuList?:{
		type: any,
		title: string
	}[]
}>()
const list = ref(props.popMenuList??[])

const onClick=async (item:{
	type:any,
	title:string
})=>{
	let itemList=props.objEditor.getSelectionItemList()
	let selectStartIndexPath=JSON.parse(JSON.stringify(itemList[0].line.selectStartIndexPath))
	props.objEditor.onPopMenuClickFunc?.(item.type,item1 => {
		let line=itemList[0].line
		let eleLine=props.objEditor.getRoot().value.children[props.objEditor.getLineList().indexOf(line)]
		let originItem=line.arr[selectStartIndexPath[0]]
		let objTemp: IEditor_Content_Line_Config = JSON.parse(JSON.stringify(originItem));
		objTemp.value=originItem.value.substring(selectStartIndexPath[1])
		originItem.value=originItem.value.substring(0,selectStartIndexPath[1]-1)
		line.arr.splice(selectStartIndexPath[0]+1,0,item1,objTemp)
		let objFix={startIndex:selectStartIndexPath[0]+1}
		RichEditorHandle.fixLine(line,objFix)
		nextTick(()=>{
			let selection=window.getSelection()
			let range=document.createRange()
			range.setStartAfter(eleLine.childNodes[objFix.startIndex]??eleLine.lastChild)
			range.setEndAfter(eleLine.childNodes[objFix.startIndex]??eleLine.lastChild)
			selection.removeAllRanges()
			selection.addRange(range)
		})
	})
}
</script>

<style scoped>
.item:hover {
	background-color: lightgray;
}
</style>