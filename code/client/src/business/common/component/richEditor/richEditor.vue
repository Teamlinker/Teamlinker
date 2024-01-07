<template>
	<div>
		<Editor v-bind="props" @update:modelValue="value => emit('update:modelValue',value)" @uploadFile="(file, handleFunc) => emit('uploadFile',file,handleFunc)" @popMenuClick="(type, handleFunc) => emit('popMenuClick',type,handleFunc)" @customAnchorClick="(type, value, link, label) => emit('customAnchorClick',type,value,link,label)" @[isQuote&&`quoteList`]="(keyword, handleFunc) => emit('quoteList',keyword,handleFunc)" @metaEnter="emit('metaEnter')" @linkClick="onLinkClick" :placeholder="$t('placeholder.richText')" @dragstart="onDragStart" @setLineConfigType="onSetLineConfigType" @getLineConfigType="onGetLineConfigType" :quote-type="ECommon_Content_Line_Config_Type.QUOTE_PERSON" ref="objEditor"></Editor>
		<teleport to="body" v-if="userShortViewInfo">
			<UserShortView ref="userShortViewEle" :organization-user-id="userShortViewInfo.id" style="position:absolute;z-index: 1000;box-shadow: rgba(169, 169, 169, 0.2) 0px 0px 2px 2px;border-radius: 5px;background-color: white" :style="{left:userShortViewInfo.x+'px',top:userShortViewInfo.y+'px'}" tabindex="0" @blur="onUserShotViewBlur"></UserShortView>
		</teleport>
	</div>
</template>

<script setup lang="ts">
import Editor from "@/business/common/component/richEditorCore/index.vue"
import {
	EEditor_Content_Line_Config_Type,
	IEditor_Content_Line,
	IEditor_Content_Line_Config
} from "@/business/common/component/richEditorCore/types";
import {ECommon_Content_Line_Config_Type} from "../../../../../../common/model/content";
import {getCurrentInstance, nextTick, ref} from "vue";
import UserShortView from "@/business/common/component/userShortView.vue";
import {dragElementList, EClient_Drag_Type} from "@/teamOS/common/directive/drag";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";

const emit=defineEmits<{
	(e:"update:modelValue",value:IEditor_Content_Line[]):void
	(e:"uploadFile", file:File, handleFunc:(fileId:string, path:string)=>void):void
	(e:"popMenuClick",type:any,handleFunc:(item:IEditor_Content_Line_Config)=>void):void
	(e:"customAnchorClick",type:any,value:string,link:string,label:string):void
	(e:"quoteList",keyword:string,handleFunc:(list:{
		value:string,
		label:string,
		photo:string
	}[])=>void):void
	(e:"metaEnter"):void
}>()
const props=defineProps<{
	readonly?:boolean,
	modelValue:IEditor_Content_Line[],
	border?:boolean,
	popMenuList?:{
		type: any,
		title: string
	}[]
}>()
const objEditor=ref<InstanceType<typeof Editor>>()
const userShortViewEle=ref()
const userShortViewInfo=ref<{
	x:number,
	y:number,
	id:string
}>()
const isQuote=!!getCurrentInstance().vnode.props.onQuoteList
const onLinkClick=(type:ECommon_Content_Line_Config_Type,value:string,x:number,y:number)=>{
	if(type===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
		if(value!=="0") {
			userShortViewInfo.value={
				id:value,
				x:x,
				y:y
			}
			nextTick(()=>{
				userShortViewEle.value.$el.focus()
			})
		}
	}
}

const onUserShotViewBlur=(event:FocusEvent)=>{
	userShortViewInfo.value=null
}


const onDragStart=(event:DragEvent)=>{
	let target=event.target as HTMLElement
	if(target.tagName==="A" || target.parentElement.tagName==="A" || target.tagName==="IMG") {
		let ele:HTMLElement
		if(target.tagName==="A" || target.tagName==="IMG") {
			ele=target
		} else {
			ele=target.parentElement
		}
		if(ele.getAttribute("allowDrag")==="1") {
			let type=ele.getAttribute("dragType")
			if(type===EClient_Drag_Type.FILE) {
				let value=ele.getAttribute("dragValue")
				event.dataTransfer.setData(type,value)
				dragElementList.push({
					element:target,
					value:value,
					type:type,
					from:"content"
				})
			} else {
				let value=ele.getAttribute("shortcutRefId")
				event.dataTransfer.setData(type,value)
				dragElementList.push({
					element:target,
					value:target.getAttribute("dragValue"),
					type:type as EClient_Drag_Type,
					shortcutType:target.getAttribute("shortcutType") as ECommon_Model_Finder_Shortcut_Type,
					shortcutRefId:target.getAttribute("shortcutRefId"),
					shortcutName:target.getAttribute("shortcutName"),
					from:"content"
				})
			}
			if(!ele.ondragend) {
				ele.ondragend=ev => {
					dragElementList.splice(0,dragElementList.length)
					let dragContainer=document.getElementById("dragContainer")
					if(dragContainer) {
						dragContainer.remove()
					}
				}
			}
			event.dataTransfer.setDragImage(ele,0,0)
		}
	}
}

const onSetLineConfigType=(ele:HTMLElement,obj:IEditor_Content_Line_Config)=>{
	if(obj.type==ECommon_Content_Line_Config_Type.LINK) {
		ele.setAttribute("href",obj.link)
		ele.setAttribute("target","_blank")
		ele.style.cursor="pointer"
		ele.innerText=obj.value
		if(obj.style) {
			for(let key in obj.style) {
				ele.style[key]=obj.style[key]
			}
		}
	} else if(obj.type==ECommon_Content_Line_Config_Type.IMAGE) {
		ele.setAttribute("src",obj.link)
		ele.setAttribute("width",String(obj.width??200))
		ele.setAttribute("height","auto")
		ele.setAttribute("fileId",obj.value)
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.FILE)
		ele.setAttribute("dragValue",obj.value)
	} else if(obj.type===ECommon_Content_Line_Config_Type.FILE) {
		ele.setAttribute("href",obj.link)
		ele.setAttribute("download",obj.label)
		ele.setAttribute("fileId",obj.value)
		ele.style.margin="0 2px 0 2px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.FILE)
		ele.setAttribute("dragValue",obj.value)
		let icon=document.createElement("i")
		icon.className="svg svg-file"
		icon.style.marginRight="5px"
		icon.style.color="gray"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.PROJECT) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.PROJECT))
		ele.setAttribute("value",obj.value)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.style.borderRadius="5px"
		ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
		ele.style.border="1px solid rgb(210,210,210)"
		ele.style.color="blue"
		ele.style.fontSize="medium"
		ele.style.textDecoration="none"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
		ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.PROJECT)
		ele.setAttribute("shortcutRefId",obj.value)
		ele.setAttribute("shortcutName",obj.label)
		let icon=document.createElement("i")
		icon.className="svg svg-project"
		icon.style.marginRight="5px"
		icon.style.color="green"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.PROJECT_ISSUE) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.PROJECT_ISSUE))
		ele.setAttribute("value",obj.value)
		ele.setAttribute("link",obj.link)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.style.borderRadius="5px"
		ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
		ele.style.border="1px solid rgb(210,210,210)"
		ele.style.color="blue"
		ele.style.fontSize="medium"
		ele.style.textDecoration="none"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
		ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE)
		ele.setAttribute("shortcutRefId",obj.value)
		ele.setAttribute("shortcutName",obj.label)
		let icon=document.createElement("i")
		icon.className="svg svg-project-issue"
		icon.style.marginRight="5px"
		icon.style.color="green"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.PROJECT_RELEASE) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.PROJECT_RELEASE))
		ele.setAttribute("value",obj.value)
		ele.setAttribute("link",obj.link)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.style.borderRadius="5px"
		ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
		ele.style.border="1px solid rgb(210,210,210)"
		ele.style.color="blue"
		ele.style.fontSize="medium"
		ele.style.textDecoration="none"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
		ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE)
		ele.setAttribute("shortcutRefId",obj.value)
		ele.setAttribute("shortcutName",obj.label)
		let icon=document.createElement("i")
		icon.className="svg svg-project-release"
		icon.style.marginRight="5px"
		icon.style.color="green"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.BOARD_SPRINT) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.BOARD_SPRINT))
		ele.setAttribute("value",obj.value)
		ele.setAttribute("link",obj.link)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.style.borderRadius="5px"
		ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
		ele.style.border="1px solid rgb(210,210,210)"
		ele.style.color="blue"
		ele.style.fontSize="medium"
		ele.style.textDecoration="none"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
		ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.BOARD_SPRINT)
		ele.setAttribute("shortcutRefId",obj.value)
		ele.setAttribute("shortcutName",obj.label)
		let icon=document.createElement("i")
		icon.className="svg svg-board-sprint"
		icon.style.marginRight="5px"
		icon.style.color="green"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.WIKI) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.WIKI))
		ele.setAttribute("value",obj.value)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.style.borderRadius="5px"
		ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
		ele.style.border="1px solid rgb(210,210,210)"
		ele.style.color="blue"
		ele.style.fontSize="medium"
		ele.style.textDecoration="none"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
		ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.WIKI)
		ele.setAttribute("shortcutRefId",obj.value)
		ele.setAttribute("shortcutName",obj.label)
		let icon=document.createElement("i")
		icon.className="svg svg-wiki"
		icon.style.marginRight="5px"
		icon.style.color="rgb(0,120,212)"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.WIKI_ITEM) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.WIKI_ITEM))
		ele.setAttribute("value",obj.value)
		ele.setAttribute("link",obj.link)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.style.borderRadius="5px"
		ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
		ele.style.border="1px solid rgb(210,210,210)"
		ele.style.color="blue"
		ele.style.fontSize="medium"
		ele.style.textDecoration="none"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
		ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM)
		ele.setAttribute("shortcutRefId",obj.value)
		ele.setAttribute("shortcutName",obj.label)
		let icon=document.createElement("i")
		icon.className="svg svg-wiki-item"
		icon.style.marginRight="5px"
		icon.style.color="rgb(0,120,212)"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.CALENDAR_EVENT) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.CALENDAR_EVENT))
		ele.setAttribute("value",obj.value)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.style.borderRadius="5px"
		ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
		ele.style.border="1px solid rgb(210,210,210)"
		ele.style.color="blue"
		ele.style.fontSize="medium"
		ele.style.textDecoration="none"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
		ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT)
		ele.setAttribute("shortcutRefId",obj.value)
		ele.setAttribute("shortcutName",obj.label)
		let icon=document.createElement("i")
		icon.className="svg svg-calendar-event"
		icon.style.marginRight="5px"
		icon.style.color="orange"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.MEETING_ROOM) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.MEETING_ROOM))
		ele.setAttribute("value",obj.value)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.color="black"
		ele.style.borderRadius="5px"
		ele.style.boxShadow="0px 0px 2px 2px rgba(169, 169, 169, 0.2)"
		ele.style.border="1px solid rgb(210,210,210)"
		ele.style.color="blue"
		ele.style.fontSize="medium"
		ele.style.textDecoration="none"
		ele.setAttribute("allowDrag","1")
		ele.setAttribute("dragType",EClient_Drag_Type.SHORTCUT)
		ele.setAttribute("shortcutType",ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM)
		ele.setAttribute("shortcutRefId",obj.value)
		ele.setAttribute("shortcutName",obj.label)
		let icon=document.createElement("i")
		icon.className="svg svg-meeting-room"
		icon.style.marginRight="5px"
		icon.style.color="red"
		ele.prepend(icon)
	} else if(obj.type===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
		ele.setAttribute("href","javascript:void(0)")
		ele.setAttribute("type",String(ECommon_Content_Line_Config_Type.QUOTE_PERSON))
		ele.setAttribute("value",obj.value)
		ele.style.margin="0 2px 0 2px"
		ele.style.padding="0 5px 0 5px"
		ele.style.cursor="pointer"
		ele.contentEditable="false"
		ele.innerText=obj.label
		ele.style.backgroundColor="rgba(9, 30, 66, 0.08)"
		ele.style.color="#42526E"
		ele.style.borderRadius="10px"
		ele.style.textDecoration="none"
		ele.prepend(document.createTextNode("@"))
	}
}

const onGetLineConfigType=(obj:IEditor_Content_Line_Config,ele:HTMLElement)=>{
	if(ele.tagName=="A") {
		let fileId=ele.getAttribute("fileId")
		if(fileId) {
			obj.type=ECommon_Content_Line_Config_Type.FILE
			obj.link=ele.getAttribute("href")
			obj.value=fileId
			obj.label=ele.innerText??""
		} else {
			let type=ele.getAttribute("type")
			if(type) {
				let configType=Number(type)
				if(configType===ECommon_Content_Line_Config_Type.PROJECT) {
					let projectId=ele.getAttribute("value")
					obj.type=ECommon_Content_Line_Config_Type.PROJECT
					obj.value=projectId
					obj.label=ele.innerText??""
				} else if(configType===ECommon_Content_Line_Config_Type.PROJECT_ISSUE) {
					let projectId=ele.getAttribute("link")
					let projectIssueId=ele.getAttribute("value")
					obj.type=ECommon_Content_Line_Config_Type.PROJECT_ISSUE
					obj.value=projectIssueId
					obj.link=projectId
					obj.label=ele.innerText??""
				} else if(configType===ECommon_Content_Line_Config_Type.PROJECT_RELEASE) {
					let projectId=ele.getAttribute("link")
					let projectReleaseId=ele.getAttribute("value")
					obj.type=ECommon_Content_Line_Config_Type.PROJECT_RELEASE
					obj.value=projectReleaseId
					obj.link=projectId
					obj.label=ele.innerText??""
				} else if(configType===ECommon_Content_Line_Config_Type.BOARD_SPRINT) {
					let projectAndBoardId=ele.getAttribute("link")
					let boardSprintId=ele.getAttribute("value")
					obj.type=ECommon_Content_Line_Config_Type.BOARD_SPRINT
					obj.value=boardSprintId
					obj.link=projectAndBoardId
					obj.label=ele.innerText??""
				} else if(configType===ECommon_Content_Line_Config_Type.WIKI) {
					let wikiId=ele.getAttribute("value")
					obj.type=ECommon_Content_Line_Config_Type.WIKI
					obj.value=wikiId
					obj.label=ele.innerText??""
				} else if(configType===ECommon_Content_Line_Config_Type.WIKI_ITEM) {
					let wikiItemId=ele.getAttribute("value")
					let wikiId=ele.getAttribute("link")
					obj.type=ECommon_Content_Line_Config_Type.WIKI_ITEM
					obj.value=wikiItemId
					obj.link=wikiId
					obj.label=ele.innerText??""
				} else if(configType===ECommon_Content_Line_Config_Type.CALENDAR_EVENT) {
					let calendarEventId=ele.getAttribute("value")
					obj.type=ECommon_Content_Line_Config_Type.CALENDAR_EVENT
					obj.value=calendarEventId
					obj.label=ele.innerText??""
				} else if(configType===ECommon_Content_Line_Config_Type.MEETING_ROOM) {
					let meetingRoomId=ele.getAttribute("value")
					obj.type=ECommon_Content_Line_Config_Type.MEETING_ROOM
					obj.value=meetingRoomId
					obj.label=ele.innerText??""
				} else if(configType===ECommon_Content_Line_Config_Type.QUOTE_PERSON) {
					let organizationUserId=ele.getAttribute("value")
					obj.type=ECommon_Content_Line_Config_Type.QUOTE_PERSON
					obj.value=organizationUserId
					obj.label=ele.innerText.replaceAll("@","")??""
				}
			} else {
				obj.type=ECommon_Content_Line_Config_Type.LINK
				obj.link=ele.getAttribute("href")
				obj.value=ele.innerText??""
			}
		}
	} else if(ele.tagName=="IMG") {
		obj.type=EEditor_Content_Line_Config_Type.IMAGE
		obj.link=ele.getAttribute("src")
		obj.width=parseInt(ele.getAttribute("width"))
		obj.value=ele.getAttribute("fileId")
	}
}

const insertConfig=(itemList:IEditor_Content_Line_Config[])=>{
	objEditor.value.insertConfig(itemList)
}

defineExpose({
	insertConfig
})
</script>

<style scoped>
:deep a[fileId]:hover {
	background-color: lightgray;
}
:deep .svg {
	display: inline-block;
	width: 1em;
	vertical-align: middle;
	background-position: 50% 50%;
	background-repeat: repeat;
	background-size: contain;
	height: 1em;
	transform: translateY(-1px);
}
:deep .svg-file {
	background-image: url("@/assert/custom/file.svg");
}
:deep .svg-project {
	background-image: url("@/assert/custom/project_item.svg");
}
:deep .svg-project-issue {
	background-image: url("@/assert/custom/project_issue_item.svg");
}
:deep .svg-project-release {
	background-image: url("@/assert/custom/project_release_item.svg");
}
:deep .svg-board-sprint {
	background-image: url("@/assert/custom/board_sprint_item.svg");
}
:deep .svg-wiki {
	background-image: url("@/assert/custom/wiki_space_item.svg");
}
:deep .svg-wiki-item {
	background-image: url("@/assert/custom/wiki_item.svg");
}
:deep .svg-calendar-event {
	background-image: url("@/assert/custom/calendar_event_item.svg");
}
:deep .svg-meeting-room {
	background-image: url("@/assert/custom/meeting_room_item.svg");
}
</style>