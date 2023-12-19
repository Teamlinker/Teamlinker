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
          {{$t("controller.app.wiki.wikiItemContent.lastModified")}}:{{moment(info?.modified_time).format('YYYY-MM-DD HH:mm:ss')}}&nbsp;&nbsp;&nbsp;
          <UserAvatar :organization-user-id="info.modified_by.organizationUserId" :name="info.modified_by.nickname" :photo="info.modified_by.photo" v-if="info"></UserAvatar>
        </a-row>
      </a-row>
	    <a-space>
		    <span style="color: green">{{$t("util.preview")}}</span>
		    <a-switch type="line" v-model="isWrite" v-if="checkPermission(permission,Permission_Types.Wiki.EDIT)" unchecked-color="green" checked-color="dodgerblue"></a-switch>
		    <span style="color: dodgerblue">{{$t("util.edit")}}</span>
	    </a-space>
    </a-row>
    <a-row style="width: 100%;height: calc(100% - 45px)">
	    <a-spin :loading="loading" style="width: 100%;height: 100%">
		    <a-row style="width: 100%;height: 50px;justify-content: center">
			    <a-input style="width: 80%;margin-top: 10px;border: 0px;background-color: transparent" autofocus :placeholder="$t('placeholder.typeTitle')" :input-attrs="{style:{fontSize:'20px'}}" v-model="title" :readonly="!isWrite"></a-input>
		    </a-row>
		    <a-row style="width: 100%;height: calc(100% - 60px);margin-top: 10px;justify-content: center;overflow-y: auto" v-drop.file.shortcut.disk="onDrop">
			    <RichEditor v-model="content" :readonly="!isWrite" style="width: 80%" @upload-file="onUploadFile" :pop-menu-list="popMenuList" @pop-menu-click="onPopMenuClick" @custom-anchor-click="onCustomAnchorClick" @quote-list="onQuoteList" ref="objEditor"></RichEditor>
		    </a-row>
	    </a-spin>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, onBeforeMount, ref, watch} from "vue";
import {apiFile, apiWiki} from "../../../common/request/request";
import {
	ECommon_Content_Line_Config_Type,
	ICommon_Content_Line,
	ICommon_Content_Line_Config,
	ICommon_Model_Content
} from "../../../../../../common/model/content";
import UserAvatar from "../../../common/component/userAvatar.vue";
import RichEditor from "../../../common/component/richEditor/richEditor.vue";
import {checkPermission, Permission_Types} from "../../../../../../common/permission/permission";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";
import {vDrag} from "../../../../teamOS/common/directive/drag";
import {getRootNavigatorRef} from "../../../../teamOS/common/component/navigator/navigator";
import {DropParam, vDrop} from "../../../../teamOS/common/directive/drop";
import {RichEditorEventHandle} from "../../../common/component/richEditorEventHandle";
import {DCSType} from "../../../../../../common/types";
import moment from "moment";

moment;
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
const info=ref<DCSType<ICommon_Model_Content>>()
const content=ref<ICommon_Content_Line[]>([])
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const popMenuList=ref(RichEditorEventHandle.popMenuList)
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
	if(isWrite.value) {
		RichEditorEventHandle.onDrop(objEditor,data,loading)
	}
}


onBeforeMount(()=>{
  getContent()
})

</script>

<style scoped>

</style>