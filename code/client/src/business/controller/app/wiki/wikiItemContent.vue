<template>
  <div style="width: 100%;height: 100%">
    <a-row style="height: 45px;border-bottom: 1px lightgray solid;justify-content: space-between;align-items: center">
      <a-row style="height: 100%">
        <a-row style="width: 100%">
          <a-space size="mini" v-drag.shortcut="()=>({
            shortcutType:ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM,
						shortcutRefId:wikiItemId,
						shortcutName:name
          })">
            <template #split>
              /
            </template>
            <span v-for="item in path">{{item}}</span>
          </a-space>
        </a-row>
        <a-row style="color: gray;font-size: smaller;align-items: center">
          last modified:{{moment(info?.modified_time).format('YYYY-MM-DD HH:mm:ss')}}&nbsp;&nbsp;&nbsp;
          <UserAvatar :organization-user-id="info.modified_by.organizationUserId" :name="info.modified_by.nickname" :photo="info.modified_by.photo" v-if="info"></UserAvatar>
        </a-row>
      </a-row>
      <a-switch v-model="isWrite" v-if="checkPermission(permission,Permission_Types.Wiki.EDIT)">
        <template #checked>
          Edit
        </template>
        <template #unchecked>
          Preview
        </template>
      </a-switch>
    </a-row>
    <a-row style="width: 100%;height: calc(100% - 45px)">
	    <a-spin :loading="loading" style="width: 100%;height: 100%">
		    <a-row style="width: 100%;height: 50px;justify-content: center">
			    <a-input style="width: 80%;margin-top: 10px;border: 0px;background-color: transparent" autofocus placeholder="type you title" :input-attrs="{style:{fontSize:'20px'}}" v-model="title" :readonly="!isWrite"></a-input>
		    </a-row>
		    <a-row style="width: 100%;height: calc(100% - 60px);margin-top: 10px;justify-content: center;overflow-y: auto" v-drop.file.shortcut.disk="onDrop">
			    <RichEditor v-model="content" :readonly="!isWrite" style="width: 80%" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" @quote-list="onQuoteList" ref="objEditor"></RichEditor>
		    </a-row>
	    </a-spin>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref, watch} from "vue";
import {
	apiCalendar,
	apiFile,
	apiFinder,
	apiIssue,
	apiMeeting,
	apiOrganization,
	apiProject,
	apiRelease,
	apiWiki,
	DCSType
} from "../../../common/request/request";
import {
	ECommon_Wiki_Content_Line_Config_Type,
	ICommon_Model_Wiki_Item_Content,
	ICommon_Wiki_Content_Line,
	ICommon_Wiki_Content_Line_Config
} from "../../../../../../common/model/wiki_item_content";
import UserAvatar from "../../../common/component/userAvatar.vue";
import RichEditor from "../../../common/component/richEditor/richEditor.vue";
import {checkPermission} from "../../../common/util/helper";
import {Permission_Types} from "../../../../../../common/permission/permission";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";
import {EClient_Drag_Type, IClient_Drag_Element, vDrag} from "../../../../teamOS/common/directive/drag";
import {Dialog} from "../../../common/component/dialog/dialog";
import {getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import ProjectFilter from "./popMenu/projectFilter.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import ProjectIssueFilter from "./popMenu/projectIssueFilter.vue";
import ProjectReleaseFilter from "./popMenu/projectReleaseFilter.vue";
import WikiFilter from "./popMenu/wikiFilter.vue";
import WikiItemFilter from "./popMenu/wikiItemFilter.vue";
import CalendarEventFilter from "./popMenu/calendarEventFilter.vue";
import MeetingRoomFilter from "./popMenu/meetingRoomFilter.vue";
import {SessionStorage} from "../../../common/storage/session";
import {DropParam, vDrop} from "../../../../teamOS/common/directive/drop";
import moment from "moment";

const props=defineProps<{
  wikiItemId:string,
  path:string[],
  name:string,
  func:(id:string,value:string)=>void,
  permission:number
}>()
const emit=defineEmits<{
  (e:"updateName",id:string,value:string):void
}>()
const objEditor=ref<InstanceType<typeof RichEditor>>()
let titleTimer=null;
let titleTimerStamps=0;
let contentTimer=null;
let contentTimerStamps=0;
const loading=ref(false)
const title=ref(props.name)
const path=ref(props.path)
const isWrite=ref(false)
const info=ref<DCSType<ICommon_Model_Wiki_Item_Content>>()
const content=ref<ICommon_Wiki_Content_Line[]>([])
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const organizationId=SessionStorage.get("organizationId")
const popMenuList=ref([
	{
		type: ECommon_Wiki_Content_Line_Config_Type.IMAGE,
		title: "Image"
	},
	{
		type: ECommon_Wiki_Content_Line_Config_Type.FILE,
		title: "File"
	},
	{
		type: ECommon_Wiki_Content_Line_Config_Type.PROJECT,
		title: "Project"
	},
	{
		type: ECommon_Wiki_Content_Line_Config_Type.PROJECT_ISSUE,
		title: "Project Issue"
	},
	{
		type: ECommon_Wiki_Content_Line_Config_Type.PROJECT_RELEASE,
		title: "Project Release"
	},
	{
		type: ECommon_Wiki_Content_Line_Config_Type.WIKI,
		title: "Wiki Space"
	},
	{
		type: ECommon_Wiki_Content_Line_Config_Type.WIKI_ITEM,
		title: "Wiki Item"
	},
	{
		type: ECommon_Wiki_Content_Line_Config_Type.CALENDAR_EVENT,
		title: "Calendar Event"
	},
	{
		type: ECommon_Wiki_Content_Line_Config_Type.MEETING_ROOM,
		title: "Meeting Room"
	},
])
let loadDate:number
watch(()=>props.name,()=>{
  title.value=props.name
})
watch(title,()=>{
  let now=Date.now()
  if(titleTimerStamps==0 || now-titleTimerStamps<500) {
    if(titleTimer) {
      clearInterval(titleTimer)
      titleTimer=null;
    }
  }
  titleTimerStamps=now
  titleTimer=setTimeout(async ()=>{
    let res=await apiWiki.editWikiItem({
      wikiItemId:props.wikiItemId,
      name:title.value?title.value:"Untitled"
    })
    if(res?.code==0) {
      path.value[path.value.length-1]=res.data.name
      props.func(props.wikiItemId,res.data.name)
    }
    titleTimer=null;
  },500)
})
watch(content,(value, oldValue, onCleanup)=>{
  let now=Date.now()
	if(!loadDate || now-loadDate<300) {
		return
	}
  if(contentTimerStamps==0 || now-contentTimerStamps<500) {
    if(contentTimer) {
      clearInterval(contentTimer)
      contentTimer=null;
    }
  }
  contentTimerStamps=now
  contentTimer=setTimeout(async ()=>{
    let res=await apiWiki.saveItemContent({
      wikiItemId:props.wikiItemId,
      content:JSON.stringify(content.value.map(item=>{
        return {
          arr:item.arr
        }
      }))
    })
    contentTimer=null;
  },500)
},{
  deep:true
})
const getContent=async ()=>{
  let res=await apiWiki.getItemContent({
    wikiItemId:props.wikiItemId
  })
  if(res?.code==0) {
    info.value=res.data
    content.value=info.value.content?JSON.parse(info.value.content):[]
	  loadDate=Date.now()
  }
}

const onUploadFile=async (file, handleFunc) => {
	let res=await apiFile.upload({
		file:file
	})
	if(res?.code==0) {
		handleFunc(res.data.id,res.data.path)
	}
}

const onPopMenuClick=async (type:ECommon_Wiki_Content_Line_Config_Type,handleFunc:(item:ICommon_Wiki_Content_Line_Config)=>void)=>{
	if(type===ECommon_Wiki_Content_Line_Config_Type.IMAGE || type===ECommon_Wiki_Content_Line_Config_Type.FILE) {
		let input = document.createElement('input');
		input.type = 'file';
		if(type===ECommon_Wiki_Content_Line_Config_Type.IMAGE) {
			input.accept=".png,.jpg,.gif,.jpeg,.bmp,.webp"
		}
		input.onchange=async (ev:InputEvent) => {
			let files=Array.from((ev.target as HTMLInputElement).files)
			if(files.length>0) {
				loading.value=true
				let res=await apiFile.upload({
					file:files[0] as any
				})
				loading.value=false
				if(res?.code==0) {
					let fileId=res.data.id
					let path=res.data.path
					let objImageItem:ICommon_Wiki_Content_Line_Config=type===ECommon_Wiki_Content_Line_Config_Type.IMAGE?{
						value:fileId,
						link:path,
						type:ECommon_Wiki_Content_Line_Config_Type.IMAGE,
						width:200
					}:{
						value:fileId,
						link:path,
						type:ECommon_Wiki_Content_Line_Config_Type.FILE,
						label:files[0].name
					}
					handleFunc(objImageItem)
				}
			}
		}
		input.click();
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.PROJECT) {
		let ret:any=await Dialog.open(root.value,appContext,"Project",markRaw(ProjectFilter))
		if(ret) {
			let item:ICommon_Wiki_Content_Line_Config={
				type:ECommon_Wiki_Content_Line_Config_Type.PROJECT,
				value:ret.id,
				label:ret.name
			}
			handleFunc(item)
		}
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.PROJECT_ISSUE) {
		let ret:any=await Dialog.open(root.value,appContext,"Project Issue",markRaw(ProjectIssueFilter))
		if(ret) {
			let item:ICommon_Wiki_Content_Line_Config={
				type:ECommon_Wiki_Content_Line_Config_Type.PROJECT_ISSUE,
				value:ret.id,
				label:ret.name,
				link:ret.project.id
			}
			handleFunc(item)
		}
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.PROJECT_RELEASE) {
		let ret:any=await Dialog.open(root.value,appContext,"Project Release",markRaw(ProjectReleaseFilter))
		if(ret) {
			let item:ICommon_Wiki_Content_Line_Config={
				type:ECommon_Wiki_Content_Line_Config_Type.PROJECT_RELEASE,
				value:ret.id,
				label:ret.name,
				link:ret.project.id
			}
			handleFunc(item)
		}
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.WIKI) {
		let ret:any=await Dialog.open(root.value,appContext,"Wiki Space",markRaw(WikiFilter))
		if(ret) {
			let item:ICommon_Wiki_Content_Line_Config={
				type:ECommon_Wiki_Content_Line_Config_Type.WIKI,
				value:ret.id,
				label:ret.name,
			}
			handleFunc(item)
		}
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.WIKI_ITEM) {
		let ret:any=await Dialog.open(root.value,appContext,"Wiki Item",markRaw(WikiItemFilter))
		if(ret) {
			let item:ICommon_Wiki_Content_Line_Config={
				type:ECommon_Wiki_Content_Line_Config_Type.WIKI_ITEM,
				value:ret.id,
				label:ret.name,
				link:ret.wiki.id
			}
			handleFunc(item)
		}
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.CALENDAR_EVENT) {
		let ret:any=await Dialog.open(root.value,appContext,"Calendar Event",markRaw(CalendarEventFilter))
		if(ret) {
			let item:ICommon_Wiki_Content_Line_Config={
				type:ECommon_Wiki_Content_Line_Config_Type.CALENDAR_EVENT,
				value:ret.id,
				label:ret.name,
			}
			handleFunc(item)
		}
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.MEETING_ROOM) {
		let ret:any=await Dialog.open(root.value,appContext,"Meeting Room",markRaw(MeetingRoomFilter))
		if(ret) {
			let item:ICommon_Wiki_Content_Line_Config={
				type:ECommon_Wiki_Content_Line_Config_Type.MEETING_ROOM,
				value:ret.id,
				label:ret.name,
				link:ret.password
			}
			handleFunc(item)
		}
	}
}

const onCustomAnchorClick=(type:ECommon_Wiki_Content_Line_Config_Type,value:string,link:string,label:string)=>{
	if(type===ECommon_Wiki_Content_Line_Config_Type.PROJECT) {
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_PROFILE,value)
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.PROJECT_ISSUE) {
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_ISSUE_PROFILE,link,value)
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.PROJECT_RELEASE) {
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PROJECT_RELEASE_PROFILE,link,value)
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.WIKI) {
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_PROFILE,value)
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.WIKI_ITEM) {
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_WIKI_ITEM,link,value)
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.CALENDAR_EVENT) {
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_CALENDAR_EVENT,value)
	} else if(type===ECommon_Wiki_Content_Line_Config_Type.MEETING_ROOM) {
		eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_MEETING,value,link)
	}
}

const onQuoteList=async (keyword:string,handleFunc:(list:{
	value:string,
	label:string,
	photo:string
}[])=>void)=>{
	let res=await apiOrganization.listUser({
		page:0,
		size:20,
		keyword:keyword,
		organizationId
	})
	if(res?.code==0) {
		handleFunc(res.data.data.map(item=>{
			return {
				value:item.organizationUser.id,
				label:item.organizationUser.nickname,
				photo:item.user.photo
			}
		}))
	}
}

const onDrop=async (data?:DropParam)=>{
	if(isWrite) {
		if(data.type==="internal") {
			loading.value=true
			let arrPromise=await Promise.allSettled((data.data as IClient_Drag_Element[]).map(obj=>{
				if(obj.type===EClient_Drag_Type.FILE) {
					return apiFinder.info({
						finderItemId:obj.value
					}).then(res=>{
						let ret:ICommon_Wiki_Content_Line_Config
						if(res?.code==0) {
							ret={
								type:ECommon_Wiki_Content_Line_Config_Type.FILE,
								value:res.data.file.id,
								link:res.data.file.path,
								label:obj.element.title
							}
						}
						return ret;
					})
				} else if(obj.type===EClient_Drag_Type.SHORTCUT) {
					switch (obj.shortcutType) {
						case ECommon_Model_Finder_Shortcut_Type.PROJECT:{
							return apiProject.basic({
								projectId:obj.shortcutRefId
							}).then(res=>{
								let ret:ICommon_Wiki_Content_Line_Config
								if(res?.code==0) {
									ret={
										type:ECommon_Wiki_Content_Line_Config_Type.PROJECT,
										value:obj.shortcutRefId,
										label:obj.element.title
									}
								}
								return ret;
							})
							break
						}
						case ECommon_Model_Finder_Shortcut_Type.PROJECT_ISSUE:{
							return apiIssue.basicInfo({
								projectIssueId:obj.shortcutRefId
							}).then(res=>{
								let ret:ICommon_Wiki_Content_Line_Config
								if(res?.code==0) {
									ret={
										type:ECommon_Wiki_Content_Line_Config_Type.PROJECT_ISSUE,
										value:obj.shortcutRefId,
										label:obj.element.title,
										link:res.data.project.id
									}
								}
								return ret;
							})
							break
						}
						case ECommon_Model_Finder_Shortcut_Type.PROJECT_RELEASE:{
							return apiRelease.info({
								projectReleaseId:obj.shortcutRefId
							}).then(res=>{
								let ret:ICommon_Wiki_Content_Line_Config
								if(res?.code==0) {
									ret={
										type:ECommon_Wiki_Content_Line_Config_Type.PROJECT_RELEASE,
										value:obj.shortcutRefId,
										label:obj.element.title,
										link:res.data.project.id
									}
								}
								return ret;
							})
							break
						}
						case ECommon_Model_Finder_Shortcut_Type.WIKI:{
							return apiWiki.wikiInfo({
								wikiId:obj.shortcutRefId
							}).then(res=>{
								let ret:ICommon_Wiki_Content_Line_Config
								if(res?.code==0) {
									ret={
										type:ECommon_Wiki_Content_Line_Config_Type.WIKI,
										value:obj.shortcutRefId,
										label:obj.element.title,
									}
								}
								return ret;
							})
							break
						}
						case ECommon_Model_Finder_Shortcut_Type.WIKI_ITEM:{
							return apiWiki.wikiItemInfo({
								wikiItemId:obj.shortcutRefId
							}).then(res=>{
								let ret:ICommon_Wiki_Content_Line_Config
								if(res?.code==0) {
									ret={
										type:ECommon_Wiki_Content_Line_Config_Type.WIKI_ITEM,
										value:obj.shortcutRefId,
										label:obj.element.title,
										link:res.data.wiki_id
									}
								}
								return ret;
							})
							break
						}
						case ECommon_Model_Finder_Shortcut_Type.CALENDAR_EVENT:{
							return apiCalendar.getCalendarEvent({
								calendarEventId:obj.shortcutRefId
							}).then(res=>{
								let ret:ICommon_Wiki_Content_Line_Config
								if(res?.code==0) {
									ret={
										type:ECommon_Wiki_Content_Line_Config_Type.CALENDAR_EVENT,
										value:obj.shortcutRefId,
										label:obj.element.title
									}
								}
								return ret;
							})
							break
						}
						case ECommon_Model_Finder_Shortcut_Type.MEETING_ROOM:{
							return apiMeeting.getRoom({
								meetingRoomId:obj.shortcutRefId
							}).then(res=>{
								let ret:ICommon_Wiki_Content_Line_Config
								if(res?.code==0) {
									ret={
										type:ECommon_Wiki_Content_Line_Config_Type.MEETING_ROOM,
										value:obj.shortcutRefId,
										label:obj.element.title
									}
								}
								return ret;
							})
							break
						}
					}
				}
			}));
			loading.value=false
			let itemList=arrPromise.filter(item=>{
				if(item.status==="fulfilled" && item.value) {
					return true
				}
			}).map(item=>{
				return (item as any).value
			})
			objEditor.value.insertConfig(itemList)
		} else if(data.type==="external") {
			loading.value=true
			let arrPromise=await Promise.allSettled((data.data as File[]).map(file=>{
				return apiFile.upload({
					file:file as any
				}).then(res=>{
					let ret:ICommon_Wiki_Content_Line_Config
					if(res?.code==0) {
						ret={
							type:ECommon_Wiki_Content_Line_Config_Type.FILE,
							value:res.data.id,
							link:res.data.path,
							label:file.name
						}
					}
					return ret;
				})
			}))
			loading.value=false
			let itemList=arrPromise.filter(item=>{
				if(item.status==="fulfilled" && item.value) {
					return true
				}
			}).map(item=>{
				return (item as any).value
			})
			objEditor.value.insertConfig(itemList)
		}
	}
}


onBeforeMount(()=>{
  getContent()
})

</script>

<style scoped>

</style>