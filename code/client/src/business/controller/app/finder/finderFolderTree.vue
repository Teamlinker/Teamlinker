<template>
	<a-tree :block-node="true" :default-expand-all="true" :data="folderTree" :load-more="loadMore" v-model:expanded-keys="expandKeys" @select="onSelect">
		<template #icon>
			<icon-folder style="color: rgb(252,217,110)"></icon-folder>
		</template>
		<template #title="nodeData">
			<a-input size="mini" v-if="nodeData.rename" v-model="rename" :autofocus="true" @blur="rename='';nodeData.rename=false">
				<template #suffix>
					<a-button size="mini" type="text" style="margin: 0" @click="onConfirmRenameFolder(nodeData)">
						<template #icon>
							<icon-check></icon-check>
						</template>
					</a-button>
				</template>
			</a-input>
			<template v-else>
				{{nodeData.title}}
			</template>
		</template>
		<template #extra="nodeData">
			<a-dropdown trigger="hover" position="bl">
				<icon-more style="color: gray"></icon-more>
				<template #content>
					<a-doption @click="onRefresh(nodeData)">{{$t("util.refresh")}}</a-doption>
					<a-doption @click="onRenameFolder(nodeData)" v-if="nodeData.key">{{$t("util.rename")}}</a-doption>
					<a-doption @click="onAddFolder(nodeData)">{{$t("controller.app.finder.finderFolderTree.addFolder")}}</a-doption>
					<a-doption v-if="nodeData.key" @click="onRemove(nodeData)">{{$t("util.remove")}}</a-doption>
				</template>
			</a-dropdown>
		</template>
	</a-tree>
</template>

<script setup lang="ts">
import {getCurrentInstance, onBeforeMount, onBeforeUnmount, ref} from "vue";
import {apiFinder} from "../../../common/request/request";
import {getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {Dialog} from "../../../common/component/dialog/dialog";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import {useI18n} from "vue-i18n";

interface FolderTree {
	title:string,
	key:string,
	rename:boolean,
	children?:FolderTree[]
}

const emit=defineEmits<{
	select:[pathList:string[]]
}>()
const rename=ref("")
const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const expandKeys=ref<string[]>([])
const {t}=useI18n()
const folderTree=ref<FolderTree[]>([
	{
		title:"Desktop",
		key:"",
		rename:false
	}
])

const loadMore=async (nodeData)=>{
	let res=await apiFinder.listChild({
		...(nodeData.key && {
			folderId:nodeData.key
		}),
		type:"folder"
	})
	if(res?.code==0) {
		nodeData.children=res.data.map(value => {
			return {
				title:value.name,
				key:value.id,
				rename:false
			}
		})
	}
}

const onRenameFolder=(nodeData)=>{
	rename.value=nodeData.title
	nodeData.rename=true
}

const onConfirmRenameFolder=async (nodeData)=>{
	let res=await apiFinder.rename({
		finderItemId:nodeData.key,
		name:rename.value
	})
	if(res?.code===0) {
		nodeData.rename=false
		eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_RENAME,nodeData.key,rename.value)
		rename.value=""
	}
}

const onAddFolder=async (nodeData)=>{
	let ret=await Dialog.input(root.value,appContext,t("tip.typeFolderName"))
	if(ret) {
		let res=await apiFinder.createFolder({
			name:ret,
			...(nodeData.key && {
				parentFolderId:nodeData.key
			})
		})
		if(res?.code==0) {
			eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_NEW_FOLDER,nodeData.key,res.data.id)
		}
	}
}

const findNodeData=(key:string,children?)=>{
	if(children) {
		for(let obj of children) {
			if(obj.key===key) {
				return obj
			}
			if(obj.children?.length>0) {
				return findNodeData(key,obj.children)
			}
		}
	} else {
		if(folderTree.value[0].key===key) {
			return folderTree.value[0]
		} else if(folderTree.value[0].children?.length>0) {
			return findNodeData(key,folderTree.value[0].children)
		}
	}
}

const findParentNodeData=(key:string,node?)=>{
	if(node?.children?.length>0) {
		for(let obj of node.children) {
			if(obj.key===key) {
				return node
			}
			if(obj.children?.length>0) {
				return findParentNodeData(key,obj)
			}
		}
	} else if(!node) {
		return findParentNodeData(key,folderTree.value[0])
	}
}

const onRemove=async (nodeData)=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteFolder"))
	if(ret) {
		let res=await apiFinder.delete({
			finderItemId:nodeData.key
		})
		if(res?.code==0) {
			eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_DELETE,[nodeData.key])
		}
	}
}

const onRefresh=async (nodeData)=>{
	if(expandKeys.value.includes(nodeData.key)) {
		expandKeys.value.splice(expandKeys.value.indexOf(nodeData.key)+1)
	}
	loadMore(nodeData)
}

const onSelect=async (path:string[])=>{
	emit("select",path)
}

const handleNewFolder=async (needRefreshFolderId, newFolderId) => {
	if(expandKeys.value.includes(needRefreshFolderId)) {
		expandKeys.value.splice(expandKeys.value.indexOf(needRefreshFolderId)+1)
		let node=findNodeData(needRefreshFolderId)
		if(node) {
			loadMore(node)
		}
	}
}

const handleRename=async (folderItemId, name) => {
	let node=findNodeData(folderItemId)
	if(node) {
		node.title=name
	}
}

const handleDelete=async (finderItemIds:string[])=> {
	for(let finderItemId of finderItemIds) {
		if(expandKeys.value.includes(finderItemId)) {
			expandKeys.value.splice(expandKeys.value.indexOf(finderItemId)+1)
		}
		let node=findParentNodeData(finderItemId)
		if(node) {
			await loadMore(node)
			if(node.children.length==0 && expandKeys.value.includes(node.key)) {
				expandKeys.value.splice(expandKeys.value.indexOf(node.key))
			}
		}
	}
}

onBeforeMount(()=>{
	eventBus.on(EClient_EVENTBUS_TYPE.FINDER_NEW_FOLDER,handleNewFolder)
	eventBus.on(EClient_EVENTBUS_TYPE.FINDER_RENAME, handleRename)
	eventBus.on(EClient_EVENTBUS_TYPE.FINDER_DELETE,handleDelete)
	loadMore(folderTree.value[0]).then(()=>{
		expandKeys.value=[""]
	})
})

onBeforeUnmount(()=>{
	eventBus.off(EClient_EVENTBUS_TYPE.FINDER_NEW_FOLDER,handleNewFolder)
	eventBus.off(EClient_EVENTBUS_TYPE.FINDER_RENAME, handleRename)
	eventBus.off(EClient_EVENTBUS_TYPE.FINDER_DELETE,handleDelete)
})
</script>

<style scoped>

</style>