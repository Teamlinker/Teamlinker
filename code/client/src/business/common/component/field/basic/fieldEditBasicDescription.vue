<template>
	<div>
		<RichEditor v-if="!isEdit" :model-value="showValue?JSON.parse(showValue):[]" :readonly="true" @custom-anchor-click="onCustomAnchorClick"></RichEditor>
		<template v-else>
			<div style="width: 100%">
				<div>
					<a-spin :loading="loading" v-drop.file.shortcut.disk="onDrop" style="width: 100%">
						<RichEditor v-model="editValue" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" @quote-list="onQuoteList" ref="objEditor"></RichEditor>
					</a-spin>
				</div>
				<a-button type="text" @click="onClick">
					<template #icon>
						<icon-check></icon-check>
					</template>
				</a-button>
				<a-button type="text" @click="onBlur">
					<template #icon>
						<icon-close style="color: red"></icon-close>
					</template>
				</a-button>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import {apiFile, apiIssue} from "../../../request/request";
import {getCurrentInstance, ref, watch} from "vue";
import RichEditor from "../../richEditor/richEditor.vue";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config
} from "../../../../../../../common/model/content";
import {RichEditorEventHandle} from "../../richEditorEventHandle";
import {DropParam, vDrop} from "../../../../../teamOS/common/directive/drop";
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";

const props=defineProps<{
	isEdit:boolean,
	showValue?:string,
	projectIssueId:string
}>()
const emit=defineEmits<{
	cancel:[],
	update:[value:string]
}>()

const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const editValue=ref<ICommon_Content_Line[]>([])
const objEditor=ref<InstanceType<typeof RichEditor>>()
const loading=ref(false)
const popMenuList=ref(RichEditorEventHandle.popMenuList)
const assignValue=()=>{
	editValue.value=props.showValue?JSON.parse(props.showValue):[]
}
watch(()=>props.showValue,()=>{
	assignValue()
},{
	immediate:true,
	deep:true
})
const onClick=async()=>{
	let value=JSON.stringify(editValue.value.map(item=>{
		return {
			arr:item.arr
		}
	}))
	let res=await apiIssue.editDescription({
		projectIssueId:props.projectIssueId,
		description:JSON.stringify(editValue.value.map(item=>{
			return {
				arr:item.arr
			}
		}))
	})
	if(res?.code==0) {
		emit("update",value)
	}
}

const onBlur=()=>{
	emit('cancel')
	assignValue()
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

const onCustomAnchorClick=(type:ECommon_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	RichEditorEventHandle.onCustomAnchorClick(type,value,link,label)
}

const onQuoteList=(keyword:string,handleFunc:(list:{
	value:string,
	label:string,
	photo:string
}[])=>void)=>{
	RichEditorEventHandle.onQuoteList(keyword,handleFunc)
}

const onDrop=(data?:DropParam)=>{
	RichEditorEventHandle.onDrop(objEditor,data,loading)
}

</script>

<style scoped>

</style>