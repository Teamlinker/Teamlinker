<template>
  <TeamOS ref="root">
    <template #barLeft>
      <a-dropdown trigger="hover" id="dropdownEle">
        <a-avatar id="myProfile" :size="32" :image-url="avatar" :trigger-icon-style="{height:'12px',width:'12px',lineHeight:'12px',right:'-2px',bottom:'-2px',...(store.status===ECommon_User_Online_Status.MEETING && {backgroundColor:'transparent'})}">
          {{imgName}}
          <template #trigger-icon>
            <div style="height: 100%;width: 100%;background-color: #03ad03;border-radius: 6px" v-if="store.status===ECommon_User_Online_Status.ONLINE"></div>
            <icon-stop :stroke-width="5" style="color: darkred" v-else-if="store.status===ECommon_User_Online_Status.BUSY"></icon-stop>
            <icon-video-camera :stroke-width="5" style="color: red" v-else-if="store.status===ECommon_User_Online_Status.MEETING"></icon-video-camera>
            <div style="height: 100%;width: 100%;background-color: grey;border-radius: 6px" v-else-if="store.status===ECommon_User_Online_Status.OFFLINE"></div>
          </template>
        </a-avatar>
        <template #content>
	        <a-doption @click="onEditOrganizationProfile" v-if="store.organizationUserInfo">{{store.organizationUserInfo?.nickname}}</a-doption>
	        <a-doption @click="onApp">{{$t("util.application")}}</a-doption>
          <a-dsubmenu trigger="hover" v-if="store.organizationInfo && store.status!==ECommon_User_Online_Status.MEETING">
            {{$t("util.status")}}
            <template #content>
              <a-doption @click="onChangeStatus(ECommon_User_Online_Status.ONLINE)">
                <template #icon v-if="store.status===ECommon_User_Online_Status.ONLINE">
                  <icon-check></icon-check>
                </template>
	              {{$t("util.online")}}
              </a-doption>
              <a-doption @click="onChangeStatus(ECommon_User_Online_Status.BUSY)">
                <template #icon v-if="store.status===ECommon_User_Online_Status.BUSY">
                  <icon-check></icon-check>
                </template>
	              {{$t("util.busy")}}
              </a-doption>
            </template>
          </a-dsubmenu>
	        <a-dsubmenu trigger="hover">
		        {{$t("util.tool")}}
		        <template #content>
			        <a-doption @click="onAddNote">
				        {{$t("util.stickyNote")}}
			        </a-doption>
			        <a-doption @click="onAddPhoto">
				        {{$t("util.album")}}
			        </a-doption>
		        </template>
	        </a-dsubmenu>
          <a-doption @click="onAccount">{{$t("util.account")}}</a-doption>
          <a-doption @click="onLogout(false)">{{$t("util.logout")}}</a-doption>
        </template>
      </a-dropdown>
    </template>
	  <template #barRight>
		  <a-row style="height: 100%;" align="center">
			  <a-col :flex="menuValue?'60px':'0px'" style="align-items: center;display: flex">
				  <img :src="store.organizationInfo.photo" style="height: 30px;width:60px;object-fit: cover;object-position: 50% 50%;" v-if="store.organizationInfo?.photo"/>
			  </a-col>
			  <a-col :flex="menuValue?'130px':'200px'" id="createOrganization" style="align-items: center;display: flex">
				  <a-select style="max-width: 130px;color: white" :placeholder="$t('placeholder.organization')" :bordered="false" @change="onMenuClick" v-model="menuValue" v-if="menu.length>0">
					  <a-optgroup v-for="(item,index) in menu" :label="item.group">
						  <a-option v-for="(item1,index1) in item.data" :label="item1.name" :value="item1.value"></a-option>
					  </a-optgroup>
				  </a-select>
				  <a-button type="primary" status="success" @click="onCreate" v-else>
					  {{$t("controller.desktop.desktop.createOrganization")}}
				  </a-button>
			  </a-col>
			  <a-col :flex="menuValue?'30px':'40px'" style="justify-content: center;display: flex;align-items: center;height: 100%" id="search">
				  <sicon size="18" color="rgb(241,241,241)" name="Ant" type="search" style="cursor: pointer" @click="isSearch=true"></sicon>
			  </a-col>
			  <a-col :flex="menuValue?'30px':'40px'" style="justify-content: center;display: flex;align-items: center;height: 100%" id="notification">
					<NotificationShow></NotificationShow>
			  </a-col>
			  <a-col flex="30px" v-if="menuValue" style="justify-content: center;display: flex;align-items: center;height: 100%">
					<MissCallShow></MissCallShow>
			  </a-col>
		  </a-row>
	  </template>
	  <template #finderItemList>
		  <template v-for="(item,index) in finderItemIconList" :key="item.meta.id">
			  <IconItem :item="item" :index="index" v-if="item.meta.type===ECommon_Model_Finder_Item_Type.FILE" v-selectable.file="item.meta.id" @dblclick="onFileDbClick(item.meta)">
			  </IconItem>
			  <IconItem :item="item" :index="index" v-else-if="item.meta.type===ECommon_Model_Finder_Item_Type.FOLDER" v-selectable.folder="item.meta.id" v-drop.file.shortcut.folder.disk="objFinderHandle.onDrop.bind(objFinderHandle,item.meta.id)">
			  </IconItem>
			  <IconItem :item="item" :index="index" v-else-if="item.meta.type===ECommon_Model_Finder_Item_Type.SHORTCUT" v-selectable.shortcut="{
				shortcutType:(item.meta as ICommon_Route_Res_Finder_Info).shortcut_type,
				value:item.meta.id,
				shortcutRefId:item.meta.ref_id,
				shortcutName:item.name
			} as IClient_Drag_Shortcut_Value">
			  </IconItem>
		  </template>
		  <a-image-preview :src="imgUri"
		                   v-model:visible="imgVisible"
		  />
		  <Photo v-for="item in photoList" :item="item" :key="item.id" @update="onUpdatePhoto" @delete="onDeletePhoto"></Photo>
		  <StickyNote v-for="item in noteList" :item="item" :key="item.id" @update="onUpdateStickyNote" @delete="onDeleteStickyNote"></StickyNote>
		  <DesktopComp style="position: absolute;width:25%;top:50px;right: 30px" v-if="store.organizationInfo" :background-image="backgroundImage" :key="store.organizationInfo.id"></DesktopComp>
		  <a-popover trigger="click">
			  <a-button style="position: absolute;right: 20px;bottom: 50px;" shape="round">
				  <template #icon>
					  <icon-message style="font-size: x-large;color: dodgerblue"></icon-message>
				  </template>
			  </a-button>
			  <template #content>
				  <img :src="qq" style="width: 250px;height: auto"/>
			  </template>
		  </a-popover>
	  </template>
  </TeamOS>
	<a-skeleton :animation="true" v-if="loading" style="position: absolute;left: 0;top: 0;height: 100%;width: 100%;background-color: white;z-index: 10000">
		<a-space direction="vertical" :style="{width:'100%'}" size="large">
			<a-skeleton-line :rows="3" />
			<a-skeleton-shape />
			<a-skeleton-shape />
		</a-space>
	</a-skeleton>
	<teleport to="body">
		<Search @close="isSearch=false" v-show="isSearch"></Search>
		<transition>
			<Application @close="isApplication=false" v-if="isApplication"></Application>
		</transition>
	</teleport>
</template>

<script setup lang="ts">

import TeamOS from "../../../teamOS/index.vue";
import {getDesktopInstance} from "../../../teamOS/teamOS";
import {computed, getCurrentInstance, markRaw, nextTick, onBeforeMount, onBeforeUnmount, ref, watch} from "vue";
import {useDesktopStore} from "./store/desktop";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../common/component/dialog/dialog";
import {ETeamOS_Window_Type, Window} from "../../../teamOS/window/window";
import {v4} from "uuid";
import Account from "../app/account/account.vue";
import {SessionStorage} from "../../common/storage/session";
import {DCSType, ECommon_User_Online_Status} from "../../../../../common/types";
import {apiFile, apiOrganization, apiTool, apiUser} from "../../common/request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../common/event/event";
import CreateOrganization from "./createOrganization.vue";
import {ECommon_Model_Finder_Item_Type, ICommon_Model_Finder_Item} from "../../../../../common/model/finder_item";
import {vSelectable} from "../../../teamOS/common/directive/selectable";
import {
	ICommon_Route_Res_Finder_Info,
	ICommon_Route_Res_Photo_item,
	ICommon_Route_Res_Sticky_Note_Item
} from "../../../../../common/routes/response";
import {IClient_Drag_Shortcut_Value} from "../../../teamOS/common/directive/drag";
import IconItem from "../../../teamOS/icon/iconItem.vue";
import {FinderHandle} from "../app/finder/finderHandle";
import {vDrop} from "../../../teamOS/common/directive/drop";
import NotificationShow from "./notificationShow.vue";
import MissCallShow from "./missCallShow.vue";
import Search from "@/business/controller/desktop/search/search.vue";
import StickyNote from "@/business/controller/desktop/tool/stickyNote/stickyNote.vue";
import Photo from "@/business/controller/desktop/tool/photo/photo.vue";
import {useI18n} from "vue-i18n";
import {Driver, driver} from "driver.js";
import "driver.js/dist/driver.css"
import guide from "@/assert/guide.png"
import EditOrganizationUserProfile from "@/business/controller/desktop/editOrganizationUserProfile.vue";
import DesktopComp from "@/business/controller/desktop/desktopComp.vue";
import Application from "@/business/controller/desktop/application.vue";
import qq from "@/assert/qq.jpg";

interface ITeamOS_Desktop_Menu {
	group:string,
	data:{
		name:string,
		value:string
	}[]
}
const {t}=useI18n()
const isApplication=ref(false)
const isSearch=ref(false)
const imgUri=ref("")
const imgVisible=ref(false)
let desktop=getDesktopInstance().desktop;
const backgroundImage=desktop.getBackgroundImage()
const root=ref()
const menu=ref<ITeamOS_Desktop_Menu[]>([])
const menuValue=ref("")
const store=useDesktopStore()
const router=useRouter();
let iconManager=getDesktopInstance().iconManager
let windowManager=getDesktopInstance().windowManager
const appContext=getCurrentInstance().appContext
store.appContext=appContext
const loading=ref(true)
let objDriver:Driver
let avatar=computed(()=>{
	return store.userInfo?.photo
})
const imgName=computed(()=>{
	if(store.userInfo?.username?.includes(" ")) {
		let arr=store.userInfo.username.split(" ")
		return arr[0][0].toUpperCase()+arr[1][0].toUpperCase()
	} else {
		return store.userInfo?.username?store.userInfo?.username[0].toUpperCase():""
	}
})
const objFinderHandle=new FinderHandle(root,appContext,"")
const noteList=ref<DCSType<ICommon_Route_Res_Sticky_Note_Item & {
	isReadOnly:boolean
}>[]>([])
const photoList=ref<DCSType<ICommon_Route_Res_Photo_item & {
	isReadOnly:boolean
}>[]>([])
objFinderHandle.onEnterFolderFunc=folderId => {
	eventBus.emit(EClient_EVENTBUS_TYPE.FINDER_OPEN_WINDOW,folderId)
}
const finderItemIconList=objFinderHandle.getItemList()
desktop.onDropFunc=objFinderHandle.onDrop.bind(objFinderHandle,"")
desktop.contextMenu=objFinderHandle.contextMenuFunc.bind(objFinderHandle)
watch(()=>store.organizationList,()=>{
  if(store.organizationList) {
    let arr=[]
    if(store.organizationList.create.length>0) {
      arr.push({
        group:t("util.created"),
        data:store.organizationList.create.map(item=>{
          return {
            name:item.name,
            value:item.id
          }
        })
      })
    }
    if(store.organizationList.join.length>0) {
      arr.push({
        group:t("util.joined"),
        data:store.organizationList.join.map(item=>{
          return {
            name:item.name,
            value:item.id
          }
        })
      })
    }
    if(SessionStorage.get("organizationId")) {
      setMenu(arr,SessionStorage.get("organizationId"))
    } else {
      setMenu(arr)
    }
  }
  iconManager.setList(store.appList)
  nextTick(()=>{
    iconManager.sort()
  })
})

watch(()=>store.appList,()=>{
	iconManager.setList(store.appList)
	nextTick(()=>{
		iconManager.sort()
	})
})

const setMenu=(menu1:ITeamOS_Desktop_Menu[],defaultValue?:string) => {
	if(menu.value.length>0) {
		menu.value.splice(0)
	}
	menu.value.push(...menu1);
	if(defaultValue) {
		menuValue.value=defaultValue
	}
}

const onAccount=()=>{
  const win=new Window(t("util.account"),ETeamOS_Window_Type.SIMPLE, "account",true,[
    {
      id:v4(),
      meta:{
        title:"account"
      },
      components:{
        account:markRaw(Account)
      },
      default:{
        name:"account"
      }
    }
  ],t("util.account"));
  windowManager.open(win);
}

const onLogout=async (isDirect?:boolean)=>{
  let ret=isDirect?isDirect:await Dialog.confirm(document.body,appContext,t("tip.logout"))
  if(ret) {
    let res=await store.logout(isDirect);
    if(res) {
      Message.success(t("tip.logoutSuccess"))
      desktop.clear()
      iconManager.clear()
      windowManager.clear();
      await router.replace("login");
    }
  }
}

const onChangeStatus=(status:ECommon_User_Online_Status.BUSY|ECommon_User_Online_Status.ONLINE)=> {
  apiOrganization.changeUserStatus({
    status:status
  })
}

const onHandleStatus=(organizationUserId:string,status:ECommon_User_Online_Status)=> {
  if(organizationUserId===SessionStorage.get("organizationUserId")) {
    store.status=status
  }
}

const onMenuClick=async (value)=>{
	windowManager.clear(["finder"])
	await store.enterOrganization(value);
}

const onCreate=async ()=>{
	let ret=await Dialog.open(document.body,appContext,t("controller.desktop.desktop.createOrganization"),markRaw(CreateOrganization))
	if(ret) {
		store.$update()
	}
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

const onAddNote=async ()=>{
	let res=await apiTool.addNote({
		height:"30%",
		width:"20%",
		x:60+Math.floor(Math.random() * (-5 - 5)) + 5+"%",
		y:50+Math.floor(Math.random() * (-5 - 5)) + 5+"%"
	})
	if(res?.code==0) {
		listNote(res.data.id)
	}
}

const onUpdateStickyNote=item => {
	let obj=noteList.value.find(obj=>obj.id===item.id)
	Object.assign(obj,item)
}

const onDeleteStickyNote=id => {
	let index=noteList.value.findIndex(item=>item.id===id)
	noteList.value.splice(index,1)
}

const onAddPhoto=async ()=>{
	let res=await apiTool.addPhoto({
		height:"40%",
		width:"30%",
		x:60+Math.floor(Math.random() * (-5 - 5)) + 5+"%",
		y:50+Math.floor(Math.random() * (-5 - 5)) + 5+"%"
	})
	if(res?.code==0) {
		listPhoto(res.data.id)
	}
}

const onUpdatePhoto=item => {
	let obj=photoList.value.find(obj=>obj.id===item.id)
	Object.assign(obj,item)
}

const onDeletePhoto=id => {
	let index=photoList.value.findIndex(item=>item.id===id)
	photoList.value.splice(index,1)
}
type A=InstanceType<typeof EditOrganizationUserProfile>["$props"]
const onEditOrganizationProfile=()=>{
	Dialog.open(document.body,appContext,t("controller.desktop.desktop.editOrganizationUserProfile"),markRaw(EditOrganizationUserProfile))
}

const listNote=async (newNoteId?:string)=>{
	let res=await apiTool.listNote()
	if(res?.code==0) {
		noteList.value=res.data.map(item=>{
			return {
				...item,
				isReadOnly:newNoteId?item.id!==newNoteId:true
			}
		})
	}
}

const listPhoto=async (newPhotoId?:string)=>{
	let res=await apiTool.listPhoto()
	if(res?.code==0) {
		photoList.value=res.data.map(item=>{
			return {
				...item,
				isReadOnly:newPhotoId?item.id!==newPhotoId:true
			}
		})
	}
}

const getWallpaper=async ()=>{
	let res=await apiUser.setting()
	if(res?.code==0) {
		desktop.setBackgroundImage(res.data.wallpaper)
	}
}

const onGuide=()=>{
	if(SessionStorage.get("firstShow")) {
		return
	}
	objDriver=driver({
		showProgress:true,
		nextBtnText:t("util.next"),
		prevBtnText:t("util.previous"),
		doneBtnText:t("util.done"),
		progressText:"{{current}} / {{total}}",
		steps:[
			{
				element:"#createOrganization",
				popover:{
					title:t("controller.desktop.guide.createOrganization"),
					description:t("controller.desktop.guide.organizationDescription")
				}
			},
			{
				element:"#finderIcon",
				popover:{
					title:t("util.finder"),
					description:t("controller.desktop.guide.finderDescription")
				}
			},
			{
				element:"#myProfile",
				popover:{
					title:t("util.profile"),
					description:t("controller.desktop.guide.profileDescription")
				}
			},
			{
				element:"#search",
				popover:{
					title:t("util.search"),
					description:t("controller.desktop.guide.searchDescription")
				}
			},
			{
				element:"#notification",
				popover:{
					title:t("util.notification"),
					description:t("controller.desktop.guide.notificationDescription")
				}
			},
			{
				popover:{
					description: `<img src="${guide}" style="width: 100%;aspect-ratio: auto"/><div style="text-align: center">${t("controller.desktop.guide.doneDescription")}</div>`,
					align:"center"
				}
			}
		]
	})
	objDriver.drive()
	SessionStorage.set("firstShow","1")
}

const onRemoveOrganization=async (organizationId:string)=>{
	if(organizationId!==store.organizationInfo?.id) {
		return
	}
	windowManager.clear(["finder"])
	store.leaveOrganization()
	menuValue.value=""
	store.getOrganizationList()
}

const onApp=()=>{
	isApplication.value=true
}

onBeforeMount(async ()=>{
	objFinderHandle.registerEvents()
	eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS,onHandleStatus)
	eventBus.on(EClient_EVENTBUS_TYPE.REFRESH_ORGANIZATION_LIST,store.getOrganizationList)
	eventBus.on(EClient_EVENTBUS_TYPE.USER_LOGIN_EXPIRED,onLogout.bind(null,true))
	eventBus.on(EClient_EVENTBUS_TYPE.GUIDE,onGuide)
	eventBus.on(EClient_EVENTBUS_TYPE.ORGANIZATION_REMOVE, onRemoveOrganization)
  let isAuth=await store.isAuth();
  if(!isAuth) {
    await router.replace("login");
    return
  }
  await Promise.allSettled([
		getWallpaper(),
		listNote(),
		listPhoto(),
		store.getOrganizationList(),
	  objFinderHandle.refresh(),
	  store.initNotificationSocket()
  ])
  if(SessionStorage.get("organizationId")) {
    await store.initOrganization(SessionStorage.get("organizationId"))
  }
	loading.value=false;
	window.onbeforeunload = function(event){
		event.preventDefault()
		event.returnValue=t("tip.leavePage");
	};
})

onBeforeUnmount(()=>{
	objFinderHandle.unRegisterEvents()
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS,onHandleStatus)
	eventBus.off(EClient_EVENTBUS_TYPE.REFRESH_ORGANIZATION_LIST,store.getOrganizationList)
	eventBus.off(EClient_EVENTBUS_TYPE.USER_LOGIN_EXPIRED,onLogout.bind(null,true))
	eventBus.off(EClient_EVENTBUS_TYPE.GUIDE,onGuide)
	eventBus.off(EClient_EVENTBUS_TYPE.ORGANIZATION_REMOVE, onRemoveOrganization)
	window.onbeforeunload=null;
})


</script>

<style scoped>
:global(#dropdownEle .arco-dropdown-list-wrapper) {
	max-height: 300px!important;
}

.v-enter-active,
.v-leave-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>