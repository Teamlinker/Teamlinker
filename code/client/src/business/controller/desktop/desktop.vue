<template>
  <TeamOS ref="root">
    <template #topLeft>
      <a-dropdown trigger="hover">
        <a-avatar :size="36" :image-url="avatar" :trigger-icon-style="{height:'12px',width:'12px',lineHeight:'12px',right:'-2px',bottom:'-2px',...(store.status===ECommon_User_Online_Status.MEETING && {backgroundColor:'transparent'})}">
          T
          <template #trigger-icon>
            <div style="height: 100%;width: 100%;background-color: #03ad03;border-radius: 6px" v-if="store.status===ECommon_User_Online_Status.ONLINE"></div>
            <icon-stop :stroke-width="5" style="color: darkred" v-else-if="store.status===ECommon_User_Online_Status.BUSY"></icon-stop>
            <icon-video-camera :stroke-width="5" style="color: red" v-else-if="store.status===ECommon_User_Online_Status.MEETING"></icon-video-camera>
            <div style="height: 100%;width: 100%;background-color: gray;border-radius: 6px" v-else-if="store.status===ECommon_User_Online_Status.OFFLINE"></div>
          </template>
        </a-avatar>
        <template #content>
          <a-dsubmenu trigger="hover" :disabled="store.status===ECommon_User_Online_Status.MEETING">
            Status
            <template #content>
              <a-doption @click="onChangeStatus(ECommon_User_Online_Status.ONLINE)">
                <template #icon v-if="store.status===ECommon_User_Online_Status.ONLINE">
                  <icon-check></icon-check>
                </template>
                online
              </a-doption>
              <a-doption @click="onChangeStatus(ECommon_User_Online_Status.BUSY)">
                <template #icon v-if="store.status===ECommon_User_Online_Status.BUSY">
                  <icon-check></icon-check>
                </template>
                busy
              </a-doption>
            </template>
          </a-dsubmenu>
          <a-doption @click="onAccount">Account</a-doption>
          <a-doption @click="onLogout">Logout</a-doption>
        </template>
      </a-dropdown>
    </template>
	  <template #topRight>
		  <a-row style="height: 100%;" align="center">
			  <a-col flex="80px" style="align-items: center;display: flex">
				  <img :src="store.organizationInfo.photo" style="height: 36px;width:80px;object-fit: cover;object-position: 50% 50%;" v-if="store.organizationInfo?.photo"/>
			  </a-col>
			  <a-col flex="170px">
				  <a-select style="max-width: 170px;color: white" placeholder="organization" :bordered="false" @change="onMenuClick" v-model:model-value="menuValue" v-if="menu.length>0">
					  <a-optgroup v-for="(item,index) in menu" :label="item.group">
						  <a-option v-for="(item1,index1) in item.data" :label="item1.name" :value="item1.value"></a-option>
					  </a-optgroup>
					  <template #footer v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">
						  <a-row style="width: 100%;height: 30px;display: flex;justify-content: center;align-items: center">
							  <a-button type="text" style="width: 100%;color: black" @click="onCreate">
								  Create
							  </a-button>
						  </a-row>
					  </template>
				  </a-select>
				  <a-button type="primary" status="success" style="float: right;margin-right: 5px" @click="onCreate" v-else>
					  Create Organization
				  </a-button>
			  </a-col>
		  </a-row>
	  </template>
	  <template #finderItemList>
		  <template v-for="(item,index) in finderItemIconList" :key="item.meta.id">
			  <IconItem :item="item" :index="index" v-if="item.meta.type===ECommon_Model_Finder_Item_Type.FILE" v-selectable.file="item.meta.id" >
			  </IconItem>
			  <IconItem :item="item" :index="index" v-else-if="item.meta.type===ECommon_Model_Finder_Item_Type.FOLDER" v-selectable.folder="item.meta.id" v-drop.file.shortcut.folder.disk="objFinderHandle.onDrop.bind(objFinderHandle,item.meta.id)">
			  </IconItem>
			  <IconItem :item="item" :index="index" v-else-if="item.meta.type===ECommon_Model_Finder_Item_Type.SHORTCUT" v-selectable.shortcut="{
				shortcutType:(item.meta as ICommon_Route_Res_Finder_Info).shortcut_type,
				value:item.meta.id,
				shortcutRefId:item.meta.ref_id
			} as IClient_Drag_Shortcut_Value">
			  </IconItem>
		  </template>
	  </template>
  </TeamOS>
	<a-skeleton :animation="true" v-if="loading" style="position: absolute;left: 0;top: 0;height: 100%;width: 100%;background-color: white;z-index: 10000">
		<a-space direction="vertical" :style="{width:'100%'}" size="large">
			<a-skeleton-line :rows="3" />
			<a-skeleton-shape />
			<a-skeleton-shape />
		</a-space>
	</a-skeleton>
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
import {apiOrganization} from "../../common/request/request";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../common/event/event";
import CreateOrganization from "./createOrganization.vue";
import {ECommon_Model_Finder_Item_Type} from "../../../../../common/model/finder_item";
import {vSelectable} from "../../../teamOS/common/directive/selectable";
import {ICommon_Route_Res_Finder_Info} from "../../../../../common/routes/response";
import {IClient_Drag_Shortcut_Value} from "../../../teamOS/common/directive/drag";
import IconItem from "../../../teamOS/icon/iconItem.vue";
import {FinderHandle} from "../app/finder/finderHandle";
import {vDrop} from "../../../teamOS/common/directive/drop";

interface ITeamOS_Desktop_Menu {
	group:string,
	data:{
		name:string,
		value:string
	}[]
}
let desktop=getDesktopInstance().desktop;
const root=ref()
const menu=ref<ITeamOS_Desktop_Menu[]>([])
const menuValue=ref("")
desktop.setBackgroundImage(img)
const store=useDesktopStore()
const router=useRouter();
let iconManager=getDesktopInstance().iconManager
let windowManager=getDesktopInstance().windowManager
const appContext=getCurrentInstance().appContext
const loading=ref(true)
let avatar=ref("")
const objFinderHandle=new FinderHandle(root,appContext,"")
objFinderHandle.setNameColor("white")
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

const onLogout=async ()=>{
  let ret=await Dialog.confirm(document.body,appContext,"Do you want to log out?")
  if(ret) {
    let res=await store.logout();
    if(res) {
      Message.success("logout success")
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
	windowManager.clear()
	await store.enterOrganization(value);
}

const onCreate=async ()=>{
	let ret=await Dialog.open(document.body,appContext,"Create Organization",markRaw(CreateOrganization))
	if(ret) {
		store.$update()
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
		store.getOrganizationList(),
	  objFinderHandle.refresh()
  ])
  if(SessionStorage.get("organizationId")) {
    await store.initOrganization(SessionStorage.get("organizationId"))
  }
  eventBus.on(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS,onHandleStatus)
	loading.value=false
})

onBeforeUnmount(()=>{
	objFinderHandle.unRegisterEvents()
  eventBus.off(EClient_EVENTBUS_TYPE.UPDATE_ORGANIZATION_USER_STATUS,onHandleStatus)
})

</script>

<style scoped>

</style>