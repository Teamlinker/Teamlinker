<template>
	<a-spin style="width: 100%;min-height: 100px;border: 1px solid lightgray" :loading="loading" v-drop.file.shortcut.disk="onDrop">
		<RichEditor v-model="content" style="width: 100%" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" ref="objEditorUser"></RichEditor>
	</a-spin>
</template>

<script setup lang="ts">
import {getCurrentInstance, inject, Ref, ref} from "vue";
import RichEditor from "@/business/common/component/richEditor/richEditor.vue";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config
} from "../../../../../../common/model/content";
import {RichEditorEventHandle} from "@/business/common/component/richEditorEventHandle";
import {DropParam, vDrop} from "@/teamOS/common/directive/drop";
import {apiFile} from "@/business/common/request/request";
import {onDialogOk} from "@/business/common/component/dialog/dialog";

const loading=ref(false)
const root =inject("dialogRootRef") as Ref<HTMLElement>
const appContext=getCurrentInstance().appContext
const content = ref<ICommon_Content_Line[]>([])
const popMenuList=ref(RichEditorEventHandle.popMenuList)
const objEditorUser=ref<InstanceType<typeof RichEditor>>()
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
	RichEditorEventHandle.onPopMenuClick(type,root,appContext,loading,handleFunc)
}

onDialogOk(async ()=>{
	return content.value
})
</script>

<style scoped>

</style>