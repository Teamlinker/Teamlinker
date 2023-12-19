<template>
	<div style="width: 100%;height: 100%;display: grid;grid-template-rows:repeat(auto-fill,120px);grid-template-columns: repeat(auto-fill,100px);align-items: center;justify-items: center" v-select v-menu.self="objFinderHandle.contextMenuFunc.bind(objFinderHandle)" :key="folderId" @click="$event.currentTarget===$event.target && selectItem()">
		<template v-for="(item,index) in itemList" :key="item.meta.id">
			<IconItem :item="item" :index="index" v-if="item.meta.type===ECommon_Model_Finder_Item_Type.FILE" v-selectable.file="item.meta.id" @click="selectItem(item.meta)">
			</IconItem>
			<IconItem :item="item" :index="index" v-else-if="item.meta.type===ECommon_Model_Finder_Item_Type.FOLDER" v-selectable.folder="item.meta.id" v-drop.file.shortcut.folder.disk="objFinderHandle.onDrop.bind(objFinderHandle,item.meta.id)" @click="selectItem(item.meta)">
			</IconItem>
			<IconItem :item="item" :index="index" v-else-if="item.meta.type===ECommon_Model_Finder_Item_Type.SHORTCUT" v-selectable.shortcut="{
				shortcutType:(item.meta as ICommon_Route_Res_Finder_Info).shortcut_type,
				value:item.meta.id,
				shortcutRefId:item.meta.ref_id
			} as IClient_Drag_Shortcut_Value" @click="selectItem(item.meta)">
			</IconItem>
		</template>
	</div>
</template>

<script setup lang="ts">
import {ECommon_Model_Finder_Item_Type, ICommon_Model_Finder_Item} from "../../../../../../common/model/finder_item";
import {ICommon_Route_Res_Finder_Info} from "../../../../../../common/routes/response";
import {IClient_Drag_Shortcut_Value} from "../../../../teamOS/common/directive/drag";
import IconItem from "../../../../teamOS/icon/iconItem.vue";
import {getCurrentInstance, onBeforeMount, onBeforeUnmount, watch} from "vue";
import {getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {FinderHandle} from "./finderHandle";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {vMenu} from "../../../../teamOS/common/directive/menu";
import {vSelect} from "../../../../teamOS/common/directive/select";
import {vSelectable} from "../../../../teamOS/common/directive/selectable";
import {vDrop} from "../../../../teamOS/common/directive/drop";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
	folderId?:string,
	keyword:string
}>()
const emit=defineEmits<{
	selectItem:[item:DCSType<ICommon_Model_Finder_Item>]
}>()
const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const objFinderHandle=new FinderHandle(root,appContext,props.folderId)
const itemList=objFinderHandle.getItemList()
objFinderHandle.setNameColor("#2a2d33")
objFinderHandle.onEnterFolderFunc=folderId => {
	eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_OPEN_WINDOW,folderId)
}

watch(()=>props.keyword,()=>{
	objFinderHandle.setKeyword(props.keyword)
	objFinderHandle.refresh()
},{
	immediate:true
})

const selectItem=(item?:DCSType<ICommon_Model_Finder_Item>)=>{
	emit("selectItem",item)
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