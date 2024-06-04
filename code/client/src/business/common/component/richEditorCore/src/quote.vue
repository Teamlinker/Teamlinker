<template>
	<div style="width: 100%;height: 100%;position: absolute;z-index: 10000;left: 0px;top:0px" @click.self="onMaskClick">
		<div style="width: 150px;height: 200px;padding: 5px;box-sizing: border-box;position: absolute;box-shadow: 0px 0px 2px 2px rgba(169, 169, 169, 0.2);border: 1px solid rgba(169, 169, 169, 0.2);background-color: white;overflow:auto;outline-width: 0;" :style="{
			left:position.left+'px',
			top:position.top+'px'
		}" ref="rootEle" @mousedown="onMouseDown">
			<div style="height: 30px;border-bottom: 1px lightgray solid">
				<input v-model="keyword" style="width: 100%;box-sizing: border-box" @input="onChange">
			</div>
			<div class="hover" v-for="item in list" style="height: 40px;display: flex;align-items: center" @click="onClick(item)">
				<img v-if="item.photo" style="width: 30px;height: 30px;border-radius: 15px" :src="item.photo">&nbsp;
				{{item.label}}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {nextTick, onBeforeMount, ref} from "vue";
import {RichEditorEvent} from "./event";
import {RichEditorHandle} from "./handle";
import {IEditor_Content_Line, IEditor_Content_Line_Config} from "./types";

const props=defineProps<{
	objEditor:RichEditorEvent,
	quoteType?:any,
	position:{
		left:number,
		top:number
	}
}>()
const keyword=ref("")
const rootEle=ref<HTMLElement>()
const list=ref<{
	value:string,
	label:string,
	photo:string
}[]>([])
let itemList:{
	line: IEditor_Content_Line,
	data: IEditor_Content_Line_Config[]
}[]
let selectStartIndexPath
const onChange=async ()=>{
	props.objEditor.onQuoteListFunc?.(keyword.value,list1 => {
		list.value=list1
	})
}

const onMaskClick=(event:MouseEvent)=>{
	props.objEditor.clearQuote()
}

const onMouseDown=(event:MouseEvent)=>{
	if(!itemList) {
		itemList=props.objEditor.getSelectionItemList()
		selectStartIndexPath=JSON.parse(JSON.stringify(itemList[0].line.selectStartIndexPath))
	}
}

const onClick=async (item:{
	value:string,
	label:string,
	photo:string
})=>{
	props.objEditor.clearQuote()
	let line=itemList[0].line
	let eleLine=props.objEditor.getRoot().value.children[props.objEditor.getLineList().indexOf(line)]
	let originItem=line.arr[selectStartIndexPath[0]]
	let objTemp:IEditor_Content_Line_Config=JSON.parse(JSON.stringify(originItem))
	objTemp.value=originItem.value.substring(selectStartIndexPath[1])
	originItem.value=originItem.value.substring(0,selectStartIndexPath[1]-1)
	let item1:IEditor_Content_Line_Config={
		type:props.quoteType,
		value:item.value,
		label:item.label
	}
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
}

onBeforeMount(()=>{
	onChange()
})
</script>

<style scoped>
.hover:hover {
	background-color: lightgray;
}
</style>