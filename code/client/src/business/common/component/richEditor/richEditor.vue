<template>
  <div>
    <div ref="root" @mouseover="onMouseOver" @keydown="onKeyDown" style="padding: 10px" :style="{border:border?'border: 1px solid lightgray;':'0px'}" @copy="onCopy">
      <div v-for="(item,index) in lineList" :key="index" contenteditable="true" @blur="onBlur(item,$event)" ref="elementList" v-html="RichEditorHandle.handle(item)" @keydown.enter="onEnter(item,index,$event)" @keydown.delete="onDelete(index,item,$event)" style="line-height: 1.5" @focus="onFocus(item,$event)" @mousedown="onMouseDown" @mouseup="onMouseUp" @mousemove="onMouseMove" @dblclick="onDbClick" @paste="onPaste" placeholder="type your content" v-if="!readonly">
      </div>
      <div v-for="(item,index) in lineList" :key="index+1" v-html="RichEditorHandle.handle(item)" style="line-height: 1.5;min-height: 21px" v-else>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, onBeforeUnmount, ref, watch} from "vue";
import {RichEditorEvent} from "./event";
import {RichEditorHandle} from "./handle";
import {
	ICommon_Wiki_Content_Line,
	ICommon_Wiki_Content_Line_Config
} from "../../../../../../common/model/wiki_item_content";
import "./font/css/font-awesome.min.css"

const emit=defineEmits<{
  (e:"update:modelValue",value:ICommon_Wiki_Content_Line[]):void
	(e:"uploadFile", file:File, handleFunc:(fileId:string, path:string)=>void):void
	(e:"popMenuClick",type:any,handleFunc:(item:ICommon_Wiki_Content_Line_Config)=>void):void
}>()
const props=defineProps<{
  readonly?:boolean,
  modelValue:ICommon_Wiki_Content_Line[],
  border?:boolean,
	popMenuList?:{
		type: any,
		title: string
	}[]
}>()

const root=ref<HTMLElement>()
const elementList=ref<HTMLElement[]>([])
const objEditor=new RichEditorEvent(root,elementList,getCurrentInstance().appContext)
if(props.popMenuList) {
	objEditor.setPopMenuList(props.popMenuList)
}
objEditor.onUploadFileFunc=(file, handleFunc) => {
	emit("uploadFile",file,handleFunc)
}
objEditor.onPopMenuClickFunc=(type, handleFunc) => {
	emit("popMenuClick",type,handleFunc)
}
const lineList=objEditor.getLineList()
let historyList:ICommon_Wiki_Content_Line[][]=[]
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
const onFocus=(item:ICommon_Wiki_Content_Line, event:MouseEvent)=>{
  objEditor.onFocus(item,event)
}
const onDbClick=(event:MouseEvent)=>{
  objEditor.onDbClick(event)
}

const onBlur=(item:ICommon_Wiki_Content_Line, event:FocusEvent)=>{
  objEditor.onBlur(item,event)
}

const onEnter=(line:ICommon_Wiki_Content_Line, index:number, event:MouseEvent)=>{
  objEditor.onEnter(line,index,event)
}
const onDelete=(index, item:ICommon_Wiki_Content_Line, event:MouseEvent)=>{
  objEditor.onDelete(index,item,event)
}

const onMouseDown=(event:MouseEvent)=>{
  objEditor.onMouseDown(event)
}
const onMouseMove=(event:MouseEvent)=>{
  objEditor.onMouseMove(event)
}

const onMouseUp=(event:MouseEvent)=>{
  objEditor.onMouseUp(event)
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

onBeforeUnmount(()=>{
	objEditor.clear()
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
</style>