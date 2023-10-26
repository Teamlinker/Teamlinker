<template>
	<div>
		<a-comment :avatar="store.userInfo.photo" style="margin-right: 10px">
			<template #content>
				<a-spin :loading="loading" style="width: 100%;border: 1px solid lightgray" v-drop.file.shortcut.disk="onDropAdd">
					<RichEditor v-model="commentAdd" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" @quote-list="onQuoteList" ref="objEditor"></RichEditor>
				</a-spin>
			</template>
			<template #actions>
				<a-button type="primary" size="small" @click="onCommentAdd" style="margin-top: 10px">{{$t("util.comment")}}</a-button>
			</template>
		</a-comment>
		<a-comment v-for="(item,index) in commentList" :author="item.value.created_by.nickname" :datetime="moment(item.value.created_time).format('YYYY-MM-DD HH:mm:ss')">
			<template #avatar>
				<UserAvatar :organization-user-id="item.value.created_by.organizationUserId" :name="item.value.created_by.nickname" :photo="item.value.created_by.photo" :only-photo="true"></UserAvatar>
			</template>
			<template #content>
				<template v-if="!item.isEdit">
					<RichEditor :model-value="JSON.parse(item.value.content)" :readonly="true" @custom-anchor-click="onCustomAnchorClick"></RichEditor>
				</template>
				<template v-else>
					<a-spin :loading="loading" style="width: 100%" v-drop.file.shortcut.disk="onDrop.bind(null,index)">
						<RichEditor v-model="item.editContent" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" @quote-list="onQuoteList" ref="objEditor"></RichEditor>
					</a-spin>
				</template>
			</template>
			<template #actions v-if="checkPermission(permission,Permission_Types.Project.ADMIN) || item.value.created_by.id==store.userInfo.id">
				<template v-if="!item.isEdit">
					<a-link href="javascript:void(0)" style="color: gray;font-size: 13px;padding: 0px" @click="onEdit(item)">
						{{$t("util.edit")}}
					</a-link>
					<a-link href="javascript:void(0)" style="color: gray;font-size: 13px;padding: 0px" @click="onRemoveComment(index)">
						{{$t("util.delete")}}
					</a-link>
				</template>
				<template v-else>
					<a-button type="text" @click="onSave(item)">
						<template #icon>
							<icon-check></icon-check>
						</template>
					</a-button>
					<a-button type="text" @click="item.editContent=[],item.isEdit=false">
						<template #icon>
							<icon-close style="color: red"></icon-close>
						</template>
					</a-button>
				</template>
			</template>
		</a-comment>
	</div>
</template>

<script setup lang="ts">

import moment from "moment/moment";
import {checkPermission, Permission_Types} from "../../../../../../../common/permission/permission";
import {getCurrentInstance, inject, onBeforeMount, ref} from "vue";
import {apiFile, apiIssue} from "../../../../common/request/request";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config,
	ICommon_Model_Content
} from "../../../../../../../common/model/content";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import {useDesktopStore} from "../../../desktop/store/desktop";
import {injectProjectInfo} from "../../../../common/util/symbol";
import RichEditor from "../../../../common/component/richEditor/richEditor.vue";
import {RichEditorEventHandle} from "../../../../common/component/richEditorEventHandle";
import {DropParam, vDrop} from "../../../../../teamOS/common/directive/drop";
import UserAvatar from "../../../../common/component/userAvatar.vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
	projectIssueId:string
}>()
const commentList=ref<DCSType<{
	value:ICommon_Model_Content,
	isEdit:boolean,
	editContent:ICommon_Content_Line[]
}>[]>([])
const commentAdd=ref<ICommon_Content_Line[]>([])
const permission=inject(injectProjectInfo).permission
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const store=useDesktopStore()
const objEditor=ref<InstanceType<typeof RichEditor>>()
const objEditorAdd=ref<InstanceType<typeof RichEditor>>()
const loading=ref(false)
const popMenuList=ref(RichEditorEventHandle.popMenuList)
const {t}=useI18n()
const getCommentList=async ()=>{
	let res=await apiIssue.commentList({
		projectIssueId:props.projectIssueId
	})
	if(res?.code==0) {
		commentList.value=res.data.map(item=>{
			return {
				value:item,
				isEdit:false,
				editContent:[]
			}
		})
	}
}
const onCommentAdd=async ()=>{
	let value=JSON.stringify(commentAdd.value.map(item=>{
		return {
			arr:item.arr
		}
	}))
	let res=await apiIssue.commentCreate({
		projectIssueId:props.projectIssueId,
		content:value
	})
	if(res?.code==0) {
		commentList.value.unshift({
			value:res.data,
			isEdit:false,
			editContent:[]
		})
		commentAdd.value=[]
	}
}
const onSave=async (item:DCSType<{
	value:ICommon_Model_Content,
	isEdit:boolean,
	editContent:ICommon_Content_Line[]
}>)=>{
	let value=JSON.stringify(item.editContent.map(item=>{
		return {
			arr:item.arr
		}
	}))
	if(value.length==0) {
		Message.error(t("tip.contentNotEmpty"))
		return
	}
	let res=await apiIssue.commentEdit({
		contentId:item.value.id,
		content:value
	})
	if(res?.code==0) {
		item.value=res.data
		item.isEdit=false
	}
}
const onRemoveComment=async (index:number)=>{
	let item=commentList.value[index];
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteComment"))
	if(ret) {
		let res=await apiIssue.commentRemove({
			contentId:item.value.id
		})
		if(res?.code==0) {
			commentList.value.splice(index,1)
		}
	}
}

const onEdit=async (item:DCSType<{
	value:ICommon_Model_Content,
	isEdit:boolean,
	editContent:ICommon_Content_Line[]
}>)=>{
	item.isEdit=true
	item.editContent=JSON.parse(item.value.content)
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

const onDrop=(index:number,data?:DropParam)=>{
	RichEditorEventHandle.onDrop(objEditor.value[index],data,loading)
}

const onDropAdd=(data?:DropParam)=>{
	RichEditorEventHandle.onDrop(objEditorAdd.value,data,loading)
}

onBeforeMount(()=>{
	getCommentList()
})
</script>

<style scoped>

</style>