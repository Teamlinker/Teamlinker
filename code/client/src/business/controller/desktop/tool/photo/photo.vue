<template>
	<div ref="topEle" :id="id" class="frame" v-drag.free="rect" v-if="!isReadOnly" :style="{
		left:rect.left,
		top:rect.top,
		width:rect.width,
		height:rect.height,
		...(!isReadOnly && {
			resize: 'both'
		})
	}" @mouseenter="isMenuVisible=true" @mouseleave="isMenuVisible=false">
		<Upload fill :default-uri="item.path" types=".png,.jpg,.jpeg,.gif,.bmp,.svg,.webp" @upload="onUpdate" class="img"></Upload>
		<a-space style="position: absolute;top:0;right: 0;z-index: 1" v-if="isMenuVisible">
			<icon-check style="color: green;cursor: pointer" @click="isReadOnly=true"></icon-check>
			<icon-delete style="color: red;cursor: pointer" @click="onDelete"></icon-delete>
		</a-space>
	</div>
	<div ref="topEle" :id="id" class="frame" v-else :style="{
		left:rect.left,
		top:rect.top,
		width:rect.width,
		height:rect.height
	}" @mouseenter="isMenuVisible=true" @mouseleave="isMenuVisible=false">
		<img :src="item.path"/>
		<a-space style="position: absolute;top:0;right: 0;z-index: 1" v-if="isMenuVisible">
			<icon-unlock style="color: grey;cursor: pointer" @click="isReadOnly=false"></icon-unlock>
			<icon-delete style="color: red;cursor: pointer" @click="onDelete"></icon-delete>
		</a-space>
	</div>
</template>

<script setup lang="ts">
import {apiTool} from "@/business/common/request/request";
import Upload from "@/business/common/component/upload.vue";
import {getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {v4} from "uuid";
import {vDrag} from "@/teamOS/common/directive/drag";
import {ICommon_Route_Res_Photo_item} from "../../../../../../../common/routes/response";
import {Dialog} from "@/business/common/component/dialog/dialog";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	item:DCSType<ICommon_Route_Res_Photo_item & {
		isReadOnly:boolean
	}>
}>()
const emit=defineEmits<{
	update:[item:DCSType<ICommon_Route_Res_Photo_item>],
	delete:[id:string]
}>()
const topEle=ref<HTMLElement>()
const appContext=getCurrentInstance().appContext
const isReadOnly=ref(props.item.isReadOnly)
const uploadUriId=ref("")
const id=v4()
const {t}=useI18n()
const rect=ref<{
	left:string,
	top:string,
	width:string,
	height:string
}>()
const isMenuVisible=ref(false)
let resizeObserver=new ResizeObserver((entries, observer)=>{
	let ele=document.getElementById(id).offsetParent as HTMLElement
	for(let entry of entries) {
		let width=document.getElementById(id).offsetWidth/ele.offsetWidth*100
		let height=document.getElementById(id).offsetHeight/ele.offsetHeight*100
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
	if(isReadOnly.value) {
		resizeObserver.unobserve(document.getElementById(id))
		let res=await apiTool.editPhoto({
			width:rect.value.width,
			height:rect.value.height,
			x:rect.value.left,
			y:rect.value.top,
			photoId:props.item.id,
			...(uploadUriId.value && {
				fileId:uploadUriId.value
			})
		})
		if(res?.code==0) {
			emit("update",res.data)
		}
	} else {
		nextTick(()=>{
			resizeObserver.observe(document.getElementById(id))
		})
	}
})
const onUpdate=(id:string)=>{
	uploadUriId.value=id
}

const onDelete=async ()=>{
	let ret=await Dialog.confirm(topEle.value.offsetParent as HTMLElement,appContext,t("tip.deleteAlbum"))
	if(ret) {
		let res=await apiTool.removePhoto({
			photoId:props.item.id
		})
		if(res?.code==0) {
			emit("delete",props.item.id)
		}
	}
}

onMounted(()=>{
	if(!isReadOnly.value) {
		resizeObserver.observe(document.getElementById(id))
	}
})

onBeforeUnmount(()=>{
	resizeObserver.unobserve(document.getElementById(id))
	resizeObserver.disconnect()
})
</script>

<style scoped>
img,.img {
	border:solid 2px;
	border-bottom-color:#ffe;
	border-left-color:#eed;
	border-right-color:#eed;
	border-top-color:#ccb;
	height:100%;
	width:100%;
	user-select: none;
}

.frame {
	position: absolute;
	overflow: hidden;
	background-color:#ddc;
	border:solid 3vmin #eee;
	border-bottom-color:#fff;
	border-left-color:#eee;
	border-radius:2px;
	border-right-color:#eee;
	border-top-color:#ddd;
	box-shadow:0 0 5px 0 rgba(0,0,0,.25) inset, 0 5px 10px 5px rgba(0,0,0,.25);
	box-sizing:border-box;
	display:inline-block;
	height:80%;
	padding:3vmin;
	text-align:center;
	&:before {
		border-radius:2px;
		bottom:-2vmin;
		box-shadow:0 2px 5px 0 rgba(0,0,0,.25) inset;
		content:"";
		left:-2vmin;
		position:absolute;
		right:-2vmin;
		top:-2vmin;
	}
	&:after {
		border-radius:2px;
		bottom:-2.5vmin;
		box-shadow: 0 2px 5px 0 rgba(0,0,0,.25);
		content:"";
		left:-2.5vmin;
		position:absolute;
		right:-2.5vmin;
		top:-2.5vmin;
		pointer-events: none;
	}
}
</style>