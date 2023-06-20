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
      <a-row style="width: 100%;height: 50px;justify-content: center">
        <a-input style="width: 80%;margin-top: 10px;border: 0px;background-color: transparent" autofocus placeholder="type you title" :input-attrs="{style:{fontSize:'20px'}}" v-model="title" :readonly="!isWrite"></a-input>
      </a-row>
      <a-row style="width: 100%;height: calc(100% - 60px);margin-top: 10px;justify-content: center;overflow-y: auto">
        <RichEditor v-model="content" :readonly="!isWrite" style="width: 80%"></RichEditor>
      </a-row>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {onBeforeMount, ref, watch} from "vue";
import {apiWiki, DCSType} from "../../../common/request/request";
import moment from "moment";
import {ICommon_Model_Wiki_Item_Content} from "../../../../../../common/model/wiki_item_content";
import UserAvatar from "../../../common/component/userAvatar.vue";
import RichEditor from "../../../common/component/richEditor/richEditor.vue";
import {Line} from "../../../common/component/richEditor/type";
import {checkPermission} from "../../../common/util/helper";
import {Permission_Types} from "../../../../../../common/permission/permission";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";
import {vDrag} from "../../../../teamOS/common/directive/drag";

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
let titleTimer=null;
let titleTimerStamps=0;
let contentTimer=null;
let contentTimerStamps=0;
const title=ref(props.name)
const path=ref(props.path)
const isWrite=ref(false)
const info=ref<DCSType<ICommon_Model_Wiki_Item_Content>>()
const content=ref<Line[]>([])
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
watch(content,()=>{
  let now=Date.now()
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
  }
}
onBeforeMount(()=>{
  getContent()
})
</script>

<style scoped>

</style>