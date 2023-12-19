<template>
	<div ref="root" @mouseover="onMouseOver" @keydown="onKeyDown" style="padding: 10px" @keyup="onKeyUp" :style="{border:border?'border: 1px solid lightgray;':'0px'}" @copy="onCopy" v-bind="$attrs">
		<div v-for="(item,index) in lineList" :key="index" contenteditable="true" @blur="onBlur(item,$event)" ref="elementList" v-html="RichEditorHandle.handle(item,objEditor.onSetLineConfigType)" @keydown.enter="onEnter(item,index,$event)" @keydown.delete="onDelete(index,item,$event)" style="line-height: 1.5" @focus="onFocus(item,$event)" @mousedown="onMouseDown" @mouseup="onMouseUp" @mousemove="onMouseMove" @dblclick="onDbClick" @paste="onPaste" @click="onClick" :placeholder="placeholder" v-if="!readonly">
		</div>
		<div v-for="(item,index) in lineList" @click="onClick" :key="index+1" v-html="RichEditorHandle.handle(item,objEditor.onSetLineConfigType)" style="line-height: 1.5;min-height: 21px" v-else>
		</div>
	</div>
	<teleport to="body" v-if="popMenuPosition && popMenuList?.length>0">
		<PopMenu :obj-editor="objEditor" :pop-menu-list="popMenuList" :style="{
			left:popMenuPosition.left+'px',
			top:popMenuPosition.top+'px'
		}">
		</PopMenu>
	</teleport>
	<teleport to="body" v-if="quotePosition && quoteType!=null">
		<Quote :obj-editor="objEditor" :quote-type="quoteType" :position="quotePosition"></Quote>
	</teleport>
</template>

<script setup lang="ts">
import {getCurrentInstance, nextTick, onBeforeUnmount, ref, watch} from "vue";
import {RichEditorEvent} from "./event";
import {RichEditorHandle} from "./handle";
import {EEditor_Content_Line_Config_Type, IEditor_Content_Line, IEditor_Content_Line_Config} from "./types";
import PopMenu from "./popMenu.vue";
import Quote from "./quote.vue";

const emit=defineEmits<{
  (e:"update:modelValue",value:IEditor_Content_Line[]):void
	(e:"uploadFile", file:File, handleFunc:(fileId:string, path:string)=>void):void
	(e:"popMenuClick",type:any,handleFunc:(item:IEditor_Content_Line_Config)=>void):void
	(e:"customAnchorClick",type:any,value:string,link:string,label:string):void
	(e:"quoteList",keyword:string,handleFunc:(list:{
		value:string,
		label:string,
		photo:string
	}[])=>void):void
	(e:"metaEnter"):void
	(e:"linkClick",type:any,value:string,x:number,y:number):void
	(e:"setLineConfigType",linkElement:HTMLElement,objConfig:IEditor_Content_Line_Config)
	(e:"getLineConfigType",config:IEditor_Content_Line_Config,linkElement:HTMLElement)
}>()
const props=defineProps<{
  readonly?:boolean,
  modelValue:IEditor_Content_Line[],
  border?:boolean,
	popMenuList?:{
		type: any,
		title: string
	}[],
	placeholder?:string,
	quoteType?:any
}>()

const root=ref<HTMLElement>()
const elementList=ref<HTMLElement[]>([])
let selectStartIndexPath=[0,0,0]
const popMenuPosition=ref<{
	left:number,
	top:number
}>()
const quotePosition=ref<{
	left:number,
	top:number
}>()
const objEditor=new RichEditorEvent(root,popMenuPosition,quotePosition)
objEditor.onSetLineConfigType=(linkElement,objConfig) => {
	emit("setLineConfigType",linkElement,objConfig)
}
objEditor.onGetLineConfigType=(config, linkElement) => {
	emit("getLineConfigType",config,linkElement)
}
objEditor.onUploadFileFunc=(file, handleFunc) => {
	emit("uploadFile",file,handleFunc)
}
objEditor.onPopMenuClickFunc=(type, handleFunc) => {
	emit("popMenuClick",type,handleFunc)
}
objEditor.onCustomMenuClickFunc=(type, value, link, label) => {
	emit("customAnchorClick",type,value,link,label)
}
if(getCurrentInstance().vnode.props.onQuoteList) {
	objEditor.onQuoteListFunc=(keyword, handleFunc) => {
		emit("quoteList",keyword,handleFunc)
	}
}
const lineList=objEditor.getLineList()
let historyList:IEditor_Content_Line[][]=[]
let recall=false
watch(lineList,()=>{
  emit("update:modelValue",lineList)
},{
  deep:true
})

watch(()=>props.modelValue,(value, oldValue, onCleanup)=>{
  objEditor.setLineList(props.modelValue)
  if(lineList.length==0) {
    objEditor.addLine("")
  }
	if(oldValue && oldValue.length>0 && !recall) {
		let obj=JSON.parse(JSON.stringify(oldValue))
		obj.forEach(obj=>{
			delete obj.selectStartIndexPath
			delete obj.selectEndIndexPath
		})
		let str=JSON.stringify(obj)
		if(historyList.length==0) {
			historyList.unshift(obj)
		} else {
			let objFirst=historyList[0]
			if(JSON.stringify(objFirst)!==str) {
				historyList.unshift(obj)
			}
		}
		if(historyList.length>10) {
			historyList.pop()
		}
	} else if(recall===true) {
		recall=false
	}
},{
  deep:true,
  immediate:true
})

const onFocus=(item:IEditor_Content_Line, event:MouseEvent)=>{
  objEditor.onFocus(item,event)
}
const onDbClick=(event:MouseEvent)=>{
  objEditor.onDbClick(event)
}

const onBlur=(item:IEditor_Content_Line, event:FocusEvent)=>{
  objEditor.onBlur(item,event)
}

const onEnter=(line:IEditor_Content_Line, index:number, event:KeyboardEvent)=>{
	if(event.metaKey) {
		RichEditorHandle.handleInnerHtml(line,event.currentTarget as HTMLElement,false,objEditor.onGetLineConfigType)
		nextTick(()=>{
			emit("metaEnter")
		})
	} else {
		objEditor.onEnter(line,index,event)
	}
}
const onDelete=(index, item:IEditor_Content_Line, event:MouseEvent)=>{
  objEditor.onDelete(index,item,event)
}

const onMouseDown=(event:MouseEvent)=>{
  objEditor.onMouseDown(event)
}
const onMouseMove=(event:MouseEvent)=>{
  objEditor.onMouseMove(event)
}

const calculateIndex=()=>{
	let selection=window.getSelection()
	if(selection.rangeCount==0) {
		return
	}
	let range=selection.getRangeAt(0)
	let startOffset=range.startOffset
	selectStartIndexPath=[]
	let startContainer=range.startContainer as HTMLElement
	if(startContainer.tagName==="DIV") {
		selectStartIndexPath=[0,startOffset]
		selectStartIndexPath.unshift(Array.from(startContainer.parentElement.children).indexOf(startContainer))
	} else {
		selectStartIndexPath=[startOffset]
		let parentElement=startContainer.parentElement
		if(parentElement.tagName=="DIV") {
			startOffset=Array.from(parentElement.childNodes).indexOf(startContainer as Element)
			selectStartIndexPath.unshift(startOffset)
			startContainer=parentElement
		} else {
			startOffset=Array.from(parentElement.parentElement.childNodes).indexOf(parentElement as Element)
			selectStartIndexPath.unshift(startOffset)
			startContainer=parentElement.parentElement
		}
		selectStartIndexPath.unshift(Array.from(startContainer.parentElement.children).indexOf(startContainer))
	}
}

const onKeyUp=(event:KeyboardEvent)=>{
	calculateIndex()
}

const onMouseUp=(event:MouseEvent)=>{
  objEditor.onMouseUp(event)
	calculateIndex()
}
const onPaste=(event:ClipboardEvent)=>{
  objEditor.onPaste(event)
}

const onMouseOver=(event:MouseEvent)=>{
  if(!props.readonly) {
    objEditor.onMouseOver(event)
  }
}

const onCopy=(event:ClipboardEvent)=>{
	objEditor.onCopy(event)
}

const onKeyDown=(event:KeyboardEvent)=>{
  if(!props.readonly) {
    objEditor.onKeyDown(event)
    if(event.key=="z" && (event.metaKey || event.ctrlKey)) {
		  event.stopPropagation()
		  event.preventDefault()
	    if(historyList.length>0) {
		    let list=historyList.shift()
		    objEditor.setLineList(list)
	    }
			recall=true
	  }
  }
}

const onClick=(event:MouseEvent)=>{
	objEditor.onClick(event)
	if(props.readonly) {
		let ele=event.target as HTMLElement
		let type=ele.getAttribute("type")
		if(ele.tagName==="A" && type) {
			let value=ele.getAttribute("value")
			emit("linkClick",Number(type),value,event.x,event.y)
		}
	}
}

const insertConfig=(itemList:IEditor_Content_Line_Config[])=>{
	if(itemList.length==0) {
		return
	}
	let items:IEditor_Content_Line_Config[]=[]
	itemList.forEach(item=>{
		items.push(item,{
			type:EEditor_Content_Line_Config_Type.TEXT,
			value:"&nbsp;"
		})
	})
	let line=lineList[selectStartIndexPath[0]]
	let eleLine=elementList.value[selectStartIndexPath[0]]
	RichEditorHandle.handleInnerHtml(line,eleLine,false,objEditor.onGetLineConfigType)
	let originItem=line.arr[selectStartIndexPath[1]]
	let objFix
	if(originItem) {
		let objTemp:IEditor_Content_Line_Config=JSON.parse(JSON.stringify(originItem))
		objTemp.value=originItem.value.substring(selectStartIndexPath[2])
		originItem.value=originItem.value.substring(0,selectStartIndexPath[2])
		line.arr.splice(selectStartIndexPath[1]+1,0,...items,objTemp)
		objFix={endIndex:selectStartIndexPath[1]+items.length}
	} else {
		line.arr.push(...items)
		objFix={endIndex:selectStartIndexPath[1]+items.length-1}
	}
	RichEditorHandle.fixLine(line,objFix)
	nextTick(()=>{
		let selection=window.getSelection()
		let range=document.createRange()
		range.setStart(eleLine.childNodes[objFix.endIndex],1)
		range.setEnd(eleLine.childNodes[objFix.endIndex],1)
		selection.removeAllRanges()
		selection.addRange(range)
	})
}

onBeforeUnmount(()=>{
	objEditor.clear()
})

defineExpose({
	insertConfig
})
</script>

<style scoped>
div {
  word-break: break-all;
}
[contenteditable] {
  outline: 0px solid transparent;
}
[contenteditable=true]:first-child:empty:not(:focus):before{
  content: attr(placeholder);
  color:grey;
  font-style:italic;
  pointer-events: none;
  display: block;
}

</style>