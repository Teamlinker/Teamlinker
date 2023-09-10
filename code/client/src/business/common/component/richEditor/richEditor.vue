<template>
  <div>
    <div ref="root" @mouseover="onMouseOver" @keydown="onKeyDown" style="padding: 10px" @keyup="onKeyUp" :style="{border:border?'border: 1px solid lightgray;':'0px'}" @copy="onCopy" @dragstart="onDragStart">
      <div v-for="(item,index) in lineList" :key="index" contenteditable="true" @blur="onBlur(item,$event)" ref="elementList" v-html="RichEditorHandle.handle(item)" @keydown.enter="onEnter(item,index,$event)" @keydown.delete="onDelete(index,item,$event)" style="line-height: 1.5" @focus="onFocus(item,$event)" @mousedown="onMouseDown" @mouseup="onMouseUp" @mousemove="onMouseMove" @dblclick="onDbClick" @paste="onPaste" @click="onClick" :placeholder="$t('placeholder.richText')" v-if="!readonly">
      </div>
      <div v-for="(item,index) in lineList" @click="onClick" :key="index+1" v-html="RichEditorHandle.handle(item)" style="line-height: 1.5;min-height: 21px" v-else>
      </div>
    </div>
	  <teleport to="body" v-if="userShortViewInfo">
			<UserShortView ref="userShortViewEle" :organization-user-id="userShortViewInfo.id" style="position:absolute;z-index: 1000;box-shadow: rgba(169, 169, 169, 0.2) 0px 0px 2px 2px;border-radius: 5px;background-color: white" :style="{left:userShortViewInfo.x+'px',top:userShortViewInfo.y+'px'}" tabindex="0" @blur="onUserShotViewBlur"></UserShortView>
	  </teleport>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, nextTick, onBeforeUnmount, ref, watch, watchEffect} from "vue";
import {RichEditorEvent} from "./event";
import {RichEditorHandle} from "./handle";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config
} from "../../../../../../common/model/content";
import UserShortView from "../userShortView.vue";
import {dragElementList, EClient_Drag_Type} from "../../../../teamOS/common/directive/drag";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";

const emit=defineEmits<{
  (e:"update:modelValue",value:ICommon_Content_Line[]):void
	(e:"uploadFile", file:File, handleFunc:(fileId:string, path:string)=>void):void
	(e:"popMenuClick",type:any,handleFunc:(item:ICommon_Content_Line_Config)=>void):void
	(e:"customAnchorClick",type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string):void
	(e:"quoteList",keyword:string,handleFunc:(list:{
		value:string,
		label:string,
		photo:string
	}[])=>void):void
	(e:"metaEnter"):void
}>()
const props=defineProps<{
  readonly?:boolean,
  modelValue:ICommon_Content_Line[],
  border?:boolean,
	popMenuList?:{
		type: any,
		title: string
	}[]
}>()
const userShortViewEle=ref()
const userShortViewInfo=ref<{
	x:number,
	y:number,
	id:string
}>()
const root=ref<HTMLElement>()
const elementList=ref<HTMLElement[]>([])
let selectStartIndexPath=[0,0,0]
const objEditor=new RichEditorEvent(root,elementList,getCurrentInstance().appContext)
watchEffect(()=>{
	if(props.popMenuList) {
		objEditor.setPopMenuList(props.popMenuList)
	}
})
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
let historyList:ICommon_Content_Line[][]=[]
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
const onFocus=(item:ICommon_Content_Line, event:MouseEvent)=>{
  objEditor.onFocus(item,event)
}
const onDbClick=(event:MouseEvent)=>{
  objEditor.onDbClick(event)
}

const onBlur=(item:ICommon_Content_Line, event:FocusEvent)=>{
  objEditor.onBlur(item,event)
}

const onEnter=(line:ICommon_Content_Line, index:number, event:KeyboardEvent)=>{
	if(event.metaKey) {
		RichEditorHandle.handleInnerHtml(line,event.currentTarget as HTMLElement)
		nextTick(()=>{
			emit("metaEnter")
		})
	} else {
		objEditor.onEnter(line,index,event)
	}
}
const onDelete=(index, item:ICommon_Content_Line, event:MouseEvent)=>{
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
		if(ele.tagName==="A" && type && Number(type)===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
			let value=ele.getAttribute("value")
			if(value!=="0") {
				userShortViewInfo.value={
					id:value,
					x:event.x,
					y:event.y
				}
				nextTick(()=>{
					userShortViewEle.value.$el.focus()
				})
			}
		}
	}
}

const onUserShotViewBlur=(event:FocusEvent)=>{
	userShortViewInfo.value=null
}


const onDragStart=(event:DragEvent)=>{
	let target=event.target as HTMLElement
	if(target.tagName==="A" || target.parentElement.tagName==="A" || target.tagName==="IMG") {
		let ele:HTMLElement
		if(target.tagName==="A" || target.tagName==="IMG") {
			ele=target
		} else {
			ele=target.parentElement
		}
		if(ele.getAttribute("allowDrag")==="1") {
			let type=ele.getAttribute("dragType")
			if(type===EClient_Drag_Type.FILE) {
				let value=ele.getAttribute("dragValue")
				event.dataTransfer.setData(type,value)
				dragElementList.push({
					element:target,
					value:value,
					type:type,
					from:"content"
				})
			} else {
				let value=ele.getAttribute("shortcutRefId")
				event.dataTransfer.setData(type,value)
				dragElementList.push({
					element:target,
					value:target.getAttribute("dragValue"),
					type:type as EClient_Drag_Type,
					shortcutType:target.getAttribute("shortcutType") as ECommon_Model_Finder_Shortcut_Type,
					shortcutRefId:target.getAttribute("shortcutRefId"),
					shortcutName:target.getAttribute("shortcutName"),
					from:"content"
				})
			}
			if(!ele.ondragend) {
				ele.ondragend=ev => {
					dragElementList.splice(0,dragElementList.length)
					let dragContainer=document.getElementById("dragContainer")
					if(dragContainer) {
						dragContainer.remove()
					}
				}
			}
			event.dataTransfer.setDragImage(ele,0,0)
		}
	}
}

const insertConfig=(itemList:ICommon_Content_Line_Config[])=>{
	if(itemList.length==0) {
		return
	}
	let items:ICommon_Content_Line_Config[]=[]
	itemList.forEach(item=>{
		items.push(item,{
			type:ECommon_Content_Line_Config_Type.TEXT,
			value:"&nbsp;"
		})
	})
	let line=lineList[selectStartIndexPath[0]]
	let eleLine=elementList.value[selectStartIndexPath[0]]
	RichEditorHandle.handleInnerHtml(line,eleLine)
	let originItem=line.arr[selectStartIndexPath[1]]
	let objFix
	if(originItem) {
		let objTemp:ICommon_Content_Line_Config=JSON.parse(JSON.stringify(originItem))
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
:deep a[fileId]:hover {
	background-color: lightgray;
}
:deep .svg {
	display: inline-block;
	width: 1em;
	vertical-align: middle;
	background-position: 50% 50%;
	background-repeat: repeat;
	background-size: contain;
	height: 1em;
	transform: translateY(-1px);
}
:deep .svg-file {
	background-image: url("@/assert/custom/file.svg");
}
:deep .svg-project {
	background-image: url("@/assert/custom/project_item.svg");
}
:deep .svg-project-issue {
	background-image: url("@/assert/custom/project_issue_item.svg");
}
:deep .svg-project-release {
	background-image: url("@/assert/custom/project_release_item.svg");
}
:deep .svg-board-sprint {
	background-image: url("@/assert/custom/board_sprint_item.svg");
}
:deep .svg-wiki {
	background-image: url("@/assert/custom/wiki_space_item.svg");
}
:deep .svg-wiki-item {
	background-image: url("@/assert/custom/wiki_item.svg");
}
:deep .svg-calendar-event {
	background-image: url("@/assert/custom/calendar_event_item.svg");
}
:deep .svg-meeting-room {
	background-image: url("@/assert/custom/meeting_room_item.svg");
}
</style>