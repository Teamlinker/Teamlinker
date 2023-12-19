<template>
	<div style="width: 100%;height: 100%;display: grid;grid-template-rows:repeat(auto-fill,120px);grid-template-columns: repeat(auto-fill,100px);align-items: center;justify-items: center;" v-drop.file.shortcut.folder.disk="objFinderHandle.onDrop.bind(objFinderHandle,props.folderId)" v-select v-menu.self="objFinderHandle.contextMenuFunc.bind(objFinderHandle)" :key="folderId" @click="$event.currentTarget===$event.target && selectItem()" onselectstart="return false">
		<template v-for="(item,index) in itemList" :key="item.meta.id">
			<IconItem :item="item" :index="index" v-if="item.meta.type===ECommon_Model_Finder_Item_Type.FILE" v-selectable.file="item.meta.id" @click="selectItem(item.meta)" @dblclick="onFileDbClick(item.meta)">
			</IconItem>
			<IconItem :item="item" :index="index" v-else-if="item.meta.type===ECommon_Model_Finder_Item_Type.FOLDER" v-selectable.folder="item.meta.id" v-drop.file.shortcut.folder.disk="objFinderHandle.onDrop.bind(objFinderHandle,item.meta.id)" @click="selectItem(item.meta)">
			</IconItem>
			<IconItem :item="item" :index="index" v-else-if="item.meta.type===ECommon_Model_Finder_Item_Type.SHORTCUT" v-selectable.shortcut="{
				shortcutType:(item.meta as ICommon_Route_Res_Finder_Info).shortcut_type,
				value:item.meta.id,
				shortcutRefId:item.meta.ref_id,
				shortcutName:item.name
			} as IClient_Drag_Shortcut_Value" @click="selectItem(item.meta)">
			</IconItem>
		</template>
		<a-image-preview :src="imgUri"
			v-model:visible="imgVisible"
		/>
	</div>
</template>

<script setup lang="ts">
import {getCurrentInstance, onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {apiFile} from "../../../common/request/request";
import {ECommon_Model_Finder_Item_Type, ICommon_Model_Finder_Item} from "../../../../../../common/model/finder_item";
import {vDrop} from "../../../../teamOS/common/directive/drop";
import {vSelect} from "../../../../teamOS/common/directive/select";
import IconItem from "../../../../teamOS/icon/iconItem.vue";
import {vSelectable} from "../../../../teamOS/common/directive/selectable";
import {vMenu} from "../../../../teamOS/common/directive/menu";
import {getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {ICommon_Route_Res_Finder_Info} from "../../../../../../common/routes/response";
import {IClient_Drag_Shortcut_Value} from "../../../../teamOS/common/directive/drag";
import {FinderHandle} from "./finderHandle";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
	folderId:string
}>()
const emit=defineEmits<{
	enterFolder:[folderId:string],
	selectItem:[item:DCSType<ICommon_Model_Finder_Item>]
}>()
const imgUri=ref("")
const imgVisible=ref(false)
const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const objFinderHandle=new FinderHandle(root,appContext,props.folderId)
const itemList=objFinderHandle.getItemList()
objFinderHandle.setNameColor("#2a2d33")
objFinderHandle.onEnterFolderFunc=folderId => {
	emit("enterFolder",folderId)
}

watch(()=>props.folderId,async value => {
	objFinderHandle.setFolderId(props.folderId)
	objFinderHandle.refresh()
},{
	immediate:true
})

const selectItem=(item?:DCSType<ICommon_Model_Finder_Item>)=>{
	emit("selectItem",item)
}

const onFileDbClick=async (item:DCSType<ICommon_Model_Finder_Item>)=>{
	let arr=[".png",".jpg",".gif",".jpeg",".bmp",".webp"]
	let isImg=false
	for(let ext of arr) {
		if(item.name.toLowerCase().endsWith(ext)) {
			isImg=true
			break
		}
	}
	if(isImg) {
		let res=await apiFile.getPath({
			fileId:item.file_id
		})
		if(res?.code==0) {
			imgUri.value=res.data.uri
			imgVisible.value=true
		}
	}
}

onBeforeMount(()=>{
	objFinderHandle.registerEvents()
})

onBeforeUnmount(()=>{
	objFinderHandle.unRegisterEvents()
})

</script>

<style scoped>

</style>