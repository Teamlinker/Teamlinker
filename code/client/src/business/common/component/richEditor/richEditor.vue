<template>
  <div>
    <div ref="root" @mouseover="onMouseOver" @keydown="onKeyDown" style="padding: 10px" :style="{border:border?'border: 1px solid lightgray;':'0px'}">
      <div v-for="(item,index) in lineList" :key="index" contenteditable="true" @blur="onBlur(item,$event)" ref="elementList" v-html="RichEditorHandle.handle(item)" @keydown.enter="onEnter(item,index,$event)" @keydown.delete="onDelete(index,item,$event)" style="line-height: 1.5" @focus="onFocus(item,$event)" @mousedown="onMouseDown" @mouseup="onMouseUp" @mousemove="onMouseMove" @dblclick="onDbClick" @paste="onPaste" placeholder="type your content" v-if="!readonly">
      </div>
      <div v-for="(item,index) in lineList" :key="index+1" v-html="RichEditorHandle.handle(item)" style="line-height: 1.5;min-height: 21px" v-else>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {RichEditorEvent} from "./event";
import {Line} from "./type";
import {RichEditorHandle} from "./handle";

const emit=defineEmits<{
  (e:"update:modelValue",value:Line[]):void
}>()
const props=defineProps<{
  readonly?:boolean,
  modelValue:Line[],
  border?:boolean
}>()

const root=ref<HTMLElement>()
const elementList=ref<HTMLElement[]>([])
const objEditor=new RichEditorEvent(root,elementList)
const lineList=objEditor.getLineList()
watch(lineList,()=>{
  emit("update:modelValue",lineList)
},{
  deep:true
})
watch(()=>props.modelValue,()=>{
  objEditor.setLineList(props.modelValue)
  if(lineList.length==0) {
    objEditor.addLine("")
  }
},{
  deep:true,
  immediate:true
})
const onFocus=(item:Line,event:MouseEvent)=>{
  objEditor.onFocus(item,event)
}
const onDbClick=(event:MouseEvent)=>{
  objEditor.onDbClick(event)
}

const onBlur=(item:Line,event:FocusEvent)=>{
  objEditor.onBlur(item,event)
}

const onEnter=(line:Line,index:number,event:MouseEvent)=>{
  objEditor.onEnter(line,index,event)
}
const onDelete=(index,item:Line,event:MouseEvent)=>{
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

const onKeyDown=(event:KeyboardEvent)=>{
  if(!props.readonly) {
    objEditor.onKeyDown(event)
  }
}

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