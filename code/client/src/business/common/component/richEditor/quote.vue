<template>
	<div style="width: 100%;height: 100%;padding: 5px;box-sizing: border-box" ref="rootEle" @mousedown="onMouseDown">
		<div style="height: 30px;border-bottom: 1px lightgray solid">
			<input v-model="keyword" :placeholder="$t('placeholder.typeName')" style="width: 100%;box-sizing: border-box" @input="onChange">
		</div>
		<div class="hover" v-for="item in list" style="height: 40px;display: flex;align-items: center" @click="onClick(item)">
			<img v-if="item.photo" style="width: 30px;height: 30px;border-radius: 15px" :src="item.photo">&nbsp;
			{{item.label}}
		</div>
	</div>
</template>

<script setup lang="ts">
import {nextTick, onBeforeMount, ref} from "vue";
import {SessionStorage} from "../../storage/session";
import {RichEditorEvent} from "./event";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config
} from "../../../../../../common/model/content";
import {RichEditorHandle} from "./handle";

const props=defineProps<{
	objEditor:RichEditorEvent
}>()
const keyword=ref("")
const rootEle=ref<HTMLElement>()
const list=ref<{
	value:string,
	label:string,
	photo:string
}[]>([])
const organizationId=SessionStorage.get("organizationId")
let itemList:{
	line: ICommon_Content_Line,
	data: ICommon_Content_Line_Config[]
}[]
let selectStartIndexPath
const onChange=async ()=>{
	props.objEditor.onQuoteListFunc?.(keyword.value,list1 => {
		list.value=list1
	})
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
	let objTemp:ICommon_Content_Line_Config=JSON.parse(JSON.stringify(originItem))
	objTemp.value=originItem.value.substring(selectStartIndexPath[1])
	originItem.value=originItem.value.substring(0,selectStartIndexPath[1]-1)
	let item1:ICommon_Content_Line_Config={
		type:ECommon_Content_Line_Config_Type.QUOTE_PERSON,
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