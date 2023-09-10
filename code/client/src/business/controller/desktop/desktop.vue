<template>
  <TeamOS ref="root">
    <template #barLeft>
      <a-dropdown trigger="hover">
        <a-avatar :size="32" :image-url="avatar" :trigger-icon-style="{height:'12px',width:'12px',lineHeight:'12px',right:'-2px',bottom:'-2px',...(store.status===ECommon_User_Online_Status.MEETING && {backgroundColor:'transparent'})}">
          T
          <template #trigger-icon>
            <div style="height: 100%;width: 100%;background-color: #03ad03;border-radius: 6px" v-if="store.status===ECommon_User_Online_Status.ONLINE"></div>
            <icon-stop :stroke-width="5" style="color: darkred" v-else-if="store.status===ECommon_User_Online_Status.BUSY"></icon-stop>
            <icon-video-camera :stroke-width="5" style="color: red" v-else-if="store.status===ECommon_User_Online_Status.MEETING"></icon-video-camera>
            <div style="height: 100%;width: 100%;background-color: grey;border-radius: 6px" v-else-if="store.status===ECommon_User_Online_Status.OFFLINE"></div>
          </template>
        </a-avatar>
        <template #content>
          <a-dsubmenu trigger="hover" :disabled="store.status===ECommon_User_Online_Status.MEETING">
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
			  <a-col :flex="menuValue?'60px':'70'" style="align-items: center;display: flex">
				  <img :src="store.organizationInfo.photo" style="height: 36px;width:80px;object-fit: cover;object-position: 50% 50%;" v-if="store.organizationInfo?.photo"/>
			  </a-col>
			  <a-col :flex="menuValue?'100px':'120px'">
				  <a-select style="max-width: 170px;color: white" :placeholder="$t('placeholder.organization')" :bordered="false" @change="onMenuClick" v-model:model-value="menuValue" v-if="menu.length>0">
					  <a-optgroup v-for="(item,index) in menu" :label="item.group">
						  <a-option v-for="(item1,index1) in item.data" :label="item1.name" :value="item1.value"></a-option>
					  </a-optgroup>
					  <template #footer v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
						  <a-row style="width: 100%;height: 30px;display: flex;justify-content: center;align-items: center">
							  <a-button type="text" style="width: 100%;color: black" @click="onCreate">
								  {{$t("util.create")}}
							  </a-button>
						  </a-row>
					  </template>
				  </a-select>
				  <a-button type="primary" status="success" style="float: right;margin-right: 5px" @click="onCreate" v-else>
					  {{$t("controller.desktop.desktop.createOrganization")}}
				  </a-button>
			  </a-col>
			  <a-col :flex="menuValue?'30px':'45px'" style="justify-content: center;display: flex">
				  <sicon size="18" color="rgb(241,241,241)" name="Ant" type="search" style="cursor: pointer" @click="isSearch=true"></sicon>
			  </a-col>
			  <a-col :flex="menuValue?'30px':'45px'" style="justify-content: center;display: flex">
					<NotificationShow></NotificationShow>
			  </a-col>
			  <a-col flex="30px" v-if="menuValue" style="justify-content: center;display: flex">
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
	</teleport>
</template>

<script setup lang="ts">

import TeamOS from "../../../teamOS/index.vue";
import img from "../../../assert/back2.jpg"
import {getDesktopInstance} from "../../../teamOS/teamOS";
import {getCurrentInstance, markRaw, nextTick, onBeforeMount, onBeforeUnmount, ref, watchEffect} from "vue";
import {useDesktopStore} from "./store/desktop";
import {useRouter} from "vue-router";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../common/component/dialog/dialog";
import {ETeamOS_Window_Type, Window} from "../../../teamOS/window/window";
import {v4} from "uuid";
import Account from "../app/account/account.vue";
import {SessionStorage} from "../../common/storage/session";
import {ECommon_Application_Mode, ECommon_User_Online_Status} from "../../../../../common/types";
import {apiFile, apiOrganization, apiTool, apiUser, DCSType} from "../../common/request/request";
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

interface ITeamOS_Desktop_Menu {
	group:string,
	data:{
		name:string,
		value:string
	}[]
}
const {t}=useI18n()
const isSearch=ref(false)
const imgUri=ref("")
const imgVisible=ref(false)
let desktop=getDesktopInstance().desktop;
const root=ref()
const menu=ref<ITeamOS_Desktop_Menu[]>([])
const menuValue=ref("")
const store=useDesktopStore()
const router=useRouter();
let iconManager=getDesktopInstance().iconManager
let windowManager=getDesktopInstance().windowManager
const appContext=getCurrentInstance().appContext
const loading=ref(true)
let avatar=ref("")
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
const watchStop=watchEffect(()=>{
  if(store.organizationList) {
    let arr=[]
    if(store.organizationList.create.length>0) {
      arr.push({
        group:"Create",
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
        group:"Join",
        data:store.organizationList.join.map(item=>{
          return {
            name:item.name,
            value:item.id
          }
        })
      })
    }
    if(store.userInfo?.photo) {
      avatar.value=store.userInfo?.photo
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
  const win=new Window("account",ETeamOS_Window_Type.SIMPLE, "account",true,[
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
  ],"account");
  windowManager.open(win);
}

const onLogout=async (isDirect?:boolean)=>{
  let ret=isDirect?isDirect:await Dialog.confirm(document.body,appContext,t("tip.logout"))
  if(ret) {
    let res=await store.logout(isDirect);
    if(res) {
      Message.success(t("tip.logoutSuccess"))
      watchStop();
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
	let ret=await Dialog.open(document.body,appContext,"Create Organization",markRaw(CreateOrganization))
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

onBeforeMount(async ()=>{
	objFinderHandle.registerEvents()
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
  eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS,onHandleStatus)
	eventBus.on(EClient_EVENTBUS_TYPE.REFRESH_ORGANIZATION_LIST,store.getOrganizationList)
	eventBus.on(EClient_EVENTBUS_TYPE.USER_LOGIN_EXPIRED,onLogout.bind(null,true))
	loading.value=false
})

onBeforeUnmount(()=>{
	objFinderHandle.unRegisterEvents()
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS,onHandleStatus)
	eventBus.off(EClient_EVENTBUS_TYPE.REFRESH_ORGANIZATION_LIST,store.getOrganizationList)
	eventBus.off(EClient_EVENTBUS_TYPE.USER_LOGIN_EXPIRED,onLogout.bind(null,true))
})


</script>

<style scoped>

</style>