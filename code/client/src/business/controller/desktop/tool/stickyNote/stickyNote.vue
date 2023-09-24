<template>
	<div :id="id" style="background-color: rgb(254,244,156);position: absolute;border-radius: 5px;box-shadow:0px 0px 2px 2px rgba(169, 169, 169, 0.2);overflow: hidden" :style="{
		left:rect.left,
		top:rect.top,
		width:rect.width,
		height:rect.height,
		...(!isReadOnly && {
			resize: 'both'
		})
	}" ref="topEle">
		<div style="background-color:rgb(254,234,61);height: 20px;border-radius: 5px;display: flex;align-items: center;justify-content: right;padding-right: 10px" v-drag:[id].free="rect" v-if="!isReadOnly">
			<a-space>
				<icon-check style="cursor: pointer;color: green" @click="isReadOnly=true"></icon-check>
				<icon-delete style="color: red;cursor: pointer" @click="onDelete"></icon-delete>
			</a-space>
		</div>
		<div style="background-color:rgb(254,234,61);height: 20px;border-radius: 5px;display: flex;align-items: center;justify-content: right;padding-right: 10px" v-else>
			<a-space>
				<icon-unlock style="color:grey;cursor: pointer" @click="isReadOnly=false"></icon-unlock>
				<icon-delete style="color: red;cursor: pointer" @click="onDelete"></icon-delete>
			</a-space>
		</div>
		<a-spin :loading="loading" style="height: calc(100% - 20px);width: 100%;overflow-y: auto" v-drop.file.shortcut.disk="onDrop">
			<RichEditor v-model="content" style="width: 100%" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" ref="objEditorUser" v-if="!isReadOnly"></RichEditor>
			<RichEditor v-model="content" style="width: 100%" @custom-anchor-click="onCustomAnchorClick" v-else readonly></RichEditor>
		</a-spin>
	</div>
</template>

<script setup lang="ts">
import {ICommon_Model_Sticky_Note} from "../../../../../../../common/model/sticky_note";
import {apiFile, apiTool} from "@/business/common/request/request";
import {vDrag} from "@/teamOS/common/directive/drag";
import {v4} from "uuid";
import {computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {Dialog} from "@/business/common/component/dialog/dialog";
import RichEditor from "@/business/common/component/richEditor/richEditor.vue";
import {ICommon_Route_Res_Sticky_Note_Item} from "../../../../../../../common/routes/response";
import {RichEditorEventHandle} from "@/business/common/component/richEditorEventHandle";
import {ECommon_Content_Line_Config_Type, ICommon_Content_Line_Config} from "../../../../../../../common/model/content";
import {DropParam, vDrop} from "@/teamOS/common/directive/drop";
import {useDesktopStore} from "@/business/controller/desktop/store/desktop";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	item:DCSType<ICommon_Route_Res_Sticky_Note_Item & {
		isReadOnly:boolean
	}>
}>()
const emit=defineEmits<{
	update:[item:DCSType<ICommon_Model_Sticky_Note>],
	delete:[id:string]
}>()
const rect=ref<{
	left:string,
	top:string,
	width:string,
	height:string
}>()
const id=v4()
const {t}=useI18n()
const loading=ref(false)
const objEditorUser=ref<InstanceType<typeof RichEditor>>()
const content=ref(props.item.content.content?JSON.parse(props.item.content.content):[])
const isReadOnly=ref(props.item.isReadOnly)
const topEle=ref<HTMLElement>()
const appContext=getCurrentInstance().appContext
const store=useDesktopStore()
const popMenuList=computed(()=>{
	if(store.organizationInfo) {
		return RichEditorEventHandle.popMenuList
	} else {
		return RichEditorEventHandle.popMenuList.filter(item=>{
			if(["Image","File"].includes(item.title)) {
				return true
			}
		})
	}
})
let resizeObserver=new ResizeObserver((entries, observer)=>{
	let ele=document.getElementById(id).offsetParent
	for(let entry of entries) {
		let width=entry.contentRect.width/ele.clientWidth*100
		let height=entry.contentRect.height/ele.clientHeight*100
		if(Math.abs(width-parseFloat(rect.value.width))>0.1) {
			rect.value.width= `${width.toFixed(3)}%`
		}
		if(Math.abs(height-parseFloat(rect.value.height))>0.1) {
			rect.value.height= `${height.toFixed(3)}%`
		}
	}
})
watch(props.item,()=>{
	rect.value={
		left:props.item.x,
		top:props.item.y,
		width:props.item.width,
		height:props.item.height
	}
},{
	deep:true,
	immediate:true
})
watch(isReadOnly,async ()=>{
	if(isReadOnly) {
		let res=await apiTool.editNote({
			width:rect.value.width,
			height:rect.value.height,
			x:rect.value.left,
			y:rect.value.top,
			noteId:props.item.id,
			content:JSON.stringify(content.value.map(item=>{
				return {
					arr:item.arr
				}
			}))
		})
		if(res?.code==0) {
			emit("update",res.data)
		}
	}
})

const onDelete=async ()=>{
	let ret=await Dialog.confirm(topEle.value.offsetParent as HTMLElement,appContext,t("tip.deleteNote"))
	if(ret) {
		let res=await apiTool.removeNote({
			noteId:props.item.id
		})
		if(res?.code==0) {
			emit("delete",props.item.id)
		}
	}
}

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

const onDrop=(data?:DropParam)=>{
	RichEditorEventHandle.onDrop(objEditorUser,data)
}

const onUploadFile=async (file, handleFunc) => {
	let res=await apiFile.upload({
		file:file
	})
	if(res?.code==0) {
		handleFunc(res.data.id,res.data.path)
	}
}

const onPopMenuClick=(type:ECommon_Content_Line_Config_Type,handleFunc:(item:ICommon_Content_Line_Config)=>void)=>{
	RichEditorEventHandle.onPopMenuClick(type,ref(topEle.value.offsetParent),appContext,loading,handleFunc)
}

onMounted(()=>{
	resizeObserver.observe(document.getElementById(id))
})

onBeforeUnmount(()=>{
	resizeObserver.unobserve(document.getElementById(id))
	resizeObserver.disconnect()
})

</script>

<style scoped>

</style>