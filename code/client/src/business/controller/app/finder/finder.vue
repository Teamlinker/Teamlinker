<template>
	<a-layout style="height: 100%">
		<a-layout-sider style="width: 200px" :resize-directions="['right']">
			<FinderFolderTree @select="onSelectFolder"></FinderFolderTree>
		</a-layout-sider>
		<a-layout-content>
			<a-row style="width: 100%;height: 50px;background-color: rgb(249,249,249);align-items: center;justify-content: space-between;padding:0 10px;box-sizing: border-box;flex-wrap: nowrap">
				<a-row style="min-height: 28px;border: 1px lightgray solid;background-color: white;max-width: 80%;flex-wrap: nowrap;align-items: center" v-if="mode===EClient_Finder_Mode.NORMAL">
					<a-button type="text" size="small" @click="onParentFolder" :disabled="pathList.length==1 && !pathList[0].id">
						<template #icon>
							<icon-arrow-up></icon-arrow-up>
						</template>
					</a-button>
					<a-row style="align-items: center;height: 100%;background-color: white;border-left:1px lightgray solid;overflow-x: auto;">
						<a-breadcrumb>
							<a-breadcrumb-item v-for="item in pathList">
								<a-button type="text" size="small" style="color: grey" @click="onClickFolder(item)">
									{{item.name}}
									<template #icon>
										<icon-folder></icon-folder>
									</template>
								</a-button>
							</a-breadcrumb-item>
						</a-breadcrumb>
					</a-row>
				</a-row>
				<template v-else-if="mode===EClient_Finder_Mode.SEARCH">
					{{$t("controller.app.finder.finder.searchResult")}}:
				</template>
				<a-row>
					<a-input-search size="mini" style="background-color: white;border: 1px lightgray solid" @search="onSearch"></a-input-search>
				</a-row>
			</a-row>
			<a-row style="width: 100%;height: calc(100% - 50px)">
				<a-layout style="height: 100%">
					<a-layout-content>
						<FinderContent :folder-id="pathList[pathList.length-1].id" @enter-folder="onSelectFolder" @select-item="onSelectItem" v-if="pathList.length>0 && mode===EClient_Finder_Mode.NORMAL"></FinderContent>
						<FinderSearchContent :folder-id="pathList[pathList.length-1].id" :keyword="keyword" @select-item="onSelectItem" v-else-if="mode===EClient_Finder_Mode.SEARCH"></FinderSearchContent>
					</a-layout-content>
					<a-layout-sider style="width: 250px" :resize-directions="['left']">
						<FinderItemInfo :item="selectedItem"></FinderItemInfo>
					</a-layout-sider>
				</a-layout>
			</a-row>
		</a-layout-content>
	</a-layout>
</template>

<script setup lang="ts">
import FinderFolderTree from "./finderFolderTree.vue";
import {onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {apiFinder} from "../../../common/request/request";
import FinderContent from "./finderContent.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import FinderItemInfo from "./finderItemInfo.vue";
import {ECommon_Model_Finder_Item_Type, ICommon_Model_Finder_Item} from "../../../../../../common/model/finder_item";
import FinderSearchContent from "./finderSearchContent.vue";
import {DCSType} from "../../../../../../common/types";

enum EClient_Finder_Mode {
	NORMAL,
	SEARCH
}
const props=defineProps<{
	folderId?:string
}>()
const pathList=ref<{
	name:string,
	id:string
}[]>([])
if(props.folderId==null) {
	pathList.value.push({
		name:"Desktop",
		id:""
	})
}
const keyword=ref("")
const mode=ref(EClient_Finder_Mode.NORMAL)
const selectedItem=ref<DCSType<ICommon_Model_Finder_Item>>()
watch(pathList,()=>{
	if(selectedItem.value?.id!==pathList.value[pathList.value.length-1].id) {
		selectedItem.value={
			id:pathList.value[pathList.value.length-1].id,
			type:ECommon_Model_Finder_Item_Type.FOLDER
		} as any
	}
},{
	deep:true
})

const onSelectFolder=async (path:string[]|string)=>{
	mode.value=EClient_Finder_Mode.NORMAL
	let id=Array.isArray(path)?path[path.length-1]:path
	if(id!="") {
		let res=await apiFinder.info({
			finderItemId:id
		})
		if(res?.code==0) {
			pathList.value=[
				...res.data.parentFolderList,
				{
					name:res.data.name,
					id:res.data.id
				}
			]
		}
	} else {
		pathList.value=[
			{
				name:"Desktop",
				id:""
			}
		]
	}
}

const onClickFolder=(item)=>{
	let index=pathList.value.findIndex(value => {
		if(value.id===item.id) {
			return true
		}
	})
	if(index>-1) {
		pathList.value.splice(index+1)
	}
}

const onParentFolder=()=>{
	pathList.value.pop()
}

const onSelectItem=(item:DCSType<ICommon_Model_Finder_Item>)=>{
	if(item) {
		selectedItem.value=item
	} else {
		selectedItem.value={
			id:pathList.value[pathList.value.length-1].id,
			type:ECommon_Model_Finder_Item_Type.FOLDER
		} as any
	}

}

const onSearch=(value:string)=>{
	if(value) {
		mode.value=EClient_Finder_Mode.SEARCH
		keyword.value=value
	} else {
		mode.value=EClient_Finder_Mode.NORMAL
		keyword.value=""
	}
}

const handleDelete=async (finderItemIds:string[])=>{
	finderItemIds.forEach(id=>{
		for(let i=0;i<pathList.value.length;i++) {
			let item=pathList.value[i]
			if(item.id===id) {
				pathList.value.splice(i)
				break
			}
		}
	})
}

onBeforeMount(()=>{
	eventBus.on(EClient_EVENTBUS_TYPE.FINDER_DELETE,handleDelete)
	if(props.folderId!=null && props.folderId!=="") {
		apiFinder.info({
			finderItemId:props.folderId
		}).then(res=>{
			if(res?.code==0) {
				pathList.value=res.data.parentFolderList.concat([
					{
						id:props.folderId,
						name:res.data.name
					}
				])
			}
		})
	}
})

onBeforeUnmount(()=>{
	eventBus.off(EClient_EVENTBUS_TYPE.FINDER_DELETE,handleDelete)
})

</script>

<style scoped>
:deep .arco-tree-node .arco-input-wrapper {
	padding: 0;
}
:deep .arco-breadcrumb-item-separator {
	margin: 0;
}
:deep .arco-breadcrumb-item {
	padding: 0;
}
:deep .arco-breadcrumb-item .arco-btn-size-small {
	padding: 0 10px;
}
</style>