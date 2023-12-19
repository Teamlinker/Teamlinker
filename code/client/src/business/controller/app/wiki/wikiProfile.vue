<template>
  <a-layout style="height: 100%">
    <a-layout-sider :resize-directions="['right']">
      <div style="width: 100%;height:100%;overflow: auto;padding: 5px;box-sizing: border-box">
        <a-row>
          <a-input-search :placeholder="$t('placeholder.typeWikiName')" v-model="keyword" @search="onSearch"/>
        </a-row>
        <a-row style="margin-top: 20px;color: gray;font-size: smaller;justify-content: space-between;align-items: center">
          {{$t("controller.app.wiki.wikiProfile.workspacePages")}}
          <a-space size="mini">
            <a-button size="mini" type="text" v-if="checkPermission(permission,Permission_Types.Wiki.EDIT)" @click="addWikiItem(null)">
              <template #icon>
                <icon-plus style="color: gray"></icon-plus>
              </template>
            </a-button>
            <a-button size="mini" type="text" v-if="checkPermission(permission,Permission_Types.Wiki.ADMIN)" @click="onSetting">
              <template #icon>
                <icon-settings style="color: gray"></icon-settings>
              </template>
            </a-button>
          </a-space>
        </a-row>
        <a-tree draggable v-model:selected-keys="selectedKeys" v-model:expanded-keys="expandedKeys" block-node :fieldNames="{
              key: 'id',
              title: 'name',
              children: 'data'
            }" :data="info.data" v-if="info" @drop="onDrop" @select="onSelect">
          <template #icon>
            <icon-file></icon-file>
          </template>
          <template #title="nodeData">
            <a-row style="justify-content: space-between;display: inline-block" @mouseenter="onItemMouseEnter"  @mouseleave="onItemMouseLeave">
              <a-row>
                {{nodeData.name}}
                <a-space size="mini" name="menu" v-if="checkPermission(permission,Permission_Types.Wiki.EDIT)" style="visibility: hidden">
                  <a-button size="mini" type="text" @click="addWikiItem(nodeData.id)">
                    <template #icon>
                      <icon-plus style="color: gray"></icon-plus>
                    </template>
                  </a-button>
                  <a-dropdown trigger="hover" position="bl">
                    <icon-more style="color: gray"></icon-more>
                    <template #content>
                      <a-doption @click="onDelete(nodeData.id)">{{$t("util.delete")}}</a-doption>
                      <a-doption v-if="nodeData.data && nodeData.data.length>0" @click="onDeleteAll(nodeData.id)">{{$t("controller.app.wiki.wikiProfile.deleteIncludeChildren")}}</a-doption>
                    </template>
                  </a-dropdown>
                </a-space>
              </a-row>
            </a-row>
          </template>
        </a-tree>
      </div>
    </a-layout-sider>
    <a-layout-content style="padding: 10px;overflow-y: hidden">
      <NavigatorContainer :routes="objComponent" ref="eleNavigator"></NavigatorContainer>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {apiWiki} from "../../../common/request/request";
import {ICommon_Route_Res_Wiki_Info, ICommon_Route_Res_Wiki_Info_Item} from "../../../../../../common/routes/response";
import {checkPermission, Permission_Types} from "../../../../../../common/permission/permission";
import {Dialog} from "../../../common/component/dialog/dialog";
import {
	getCurrentNavigator,
	getCurrentNavigatorMeta,
	getRootNavigatorRef
} from "../../../../teamOS/common/component/navigator/navigator";
import NavigatorContainer from "../../../../teamOS/common/component/navigator/navigatorContainer.vue";
import WikiItemContent from "./wikiItemContent.vue";
import WikiSetting from "./setting/wikiSetting.vue";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
  wikiId:string
}>()
const eleNavigator=ref<InstanceType<typeof NavigatorContainer>>(null)
const info=ref<DCSType<ICommon_Route_Res_Wiki_Info>>()
const permission=ref(0)
const selectedKeys=ref<string[]>([])
const expandedKeys=ref<string[]>([])
const root=getRootNavigatorRef()
const keyword=ref("")
let selectedIdList=[]
let objMeta=getCurrentNavigatorMeta()?.data as {
  wikiItemId:string
}
const {t}=useI18n()
const itemMap=ref<{
  [key:string]:ICommon_Route_Res_Wiki_Info_Item
}>({})
const appContext=getCurrentInstance().appContext
let objComponent={
  content:markRaw(WikiItemContent),
  setting:markRaw(WikiSetting)
}
const navigator=getCurrentNavigator()
const getInfo=async ()=>{
  let res=await apiWiki.wikiInfo({
    wikiId:props.wikiId,
    keyword:keyword.value
  })
  if(res?.code==0) {
    info.value=res.data
    navigator.setCurrentPath(res.data.name)
    itemMap.value={}
    res.data.data && onAccessId(res.data.data)
    let idList=Object.keys(itemMap)
    for(let obj of selectedKeys.value) {
      if(!idList.includes(obj)) {
        selectedKeys.value.splice(selectedKeys.value.indexOf(obj),1)
      }
    }
    for(let obj of expandedKeys.value) {
      if(!idList.includes(obj)) {
        expandedKeys.value.splice(expandedKeys.value.indexOf(obj),1)
      }
    }
  } else {
		Message.error(res.msg)
  }
}
const onAccessId=(data:ICommon_Route_Res_Wiki_Info_Item[])=>{
  for(let obj of data) {
    itemMap.value[obj.id]=obj
    if(obj.data && obj.data.length>0) {
      onAccessId(obj.data)
    }
  }
}
const getPermission=async ()=>{
  let res=await apiWiki.getPermission({
    wikiId:props.wikiId
  })
  if(res?.code==0) {
    permission.value=res.data.value;
  }
}
const addWikiItem=async (parentWikiItemId:string)=>{
  let ret=await Dialog.input(root.value,appContext,t("tip.typeNewWikiItemName"))
  if(ret) {
    let res=await apiWiki.addWikiItem({
      wikiId:props.wikiId,
      parentWikiItemId:parentWikiItemId,
      name:ret
    })
    if(res?.code==0) {
      getInfo()
    }
  }
}
const onItemMouseEnter=(event:MouseEvent)=>{
  let ele=event.target as HTMLElement
  let menu=ele.querySelector("[name='menu']") as HTMLElement
  if(menu) {
    menu.style.visibility='visible'
  }
}
const onItemMouseLeave=(event:MouseEvent)=>{
  let ele=event.target as HTMLElement
  let menu=ele.querySelector("[name='menu']") as HTMLElement
  if(menu) {
    menu.style.visibility='hidden'
  }
}

const onDelete=async (id:string)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteWikiItem"))
  if(ret) {
    let res=await apiWiki.deleteWikiItem({
      wikiItemId:id,
      isChildren:false
    })
    if(res?.code==0) {
      if(selectedIdList.includes(id)) {
        eleNavigator.value.navigator.pop(true)
        selectedIdList=[]
      }
      getInfo()
    }
  }
}
const onDeleteAll=async (id:string)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteAllWikiItem"))
  if(ret) {
    let res=await apiWiki.deleteWikiItem({
      wikiItemId:id,
      isChildren:true
    })
    if(res?.code==0) {
      if(selectedIdList.includes(id)) {
        eleNavigator.value.navigator.pop(true)
        selectedIdList=[]
      }
      getInfo()
    }
  }
}

const onDrop=async ({ dragNode, dropNode, dropPosition })=>{
  let res=await apiWiki.moveWikiItem({
    wikiItemId:dragNode.id,
    newWikiItemId:dropNode.id,
    action:dropPosition==0?"child":dropPosition==-1?"up":"down"
  })
  if(res?.code==0) {
    getInfo()
  }
}
const onSetting=()=>{
  selectedIdList=[]
  eleNavigator.value.navigator.replaceRoot("setting",{
    wikiId:props.wikiId
  })
}
const onSelect=(keys)=>{
  selectedIdList=expandedKeys.value.concat(keys)
  let arr=expandedKeys.value.concat(keys).map(item=>{
    return itemMap.value[item].name
  })
  eleNavigator.value.navigator.replaceRoot("content",{
    wikiItemId:keys[0],
    path:arr,
    name:itemMap.value[keys[0]].name,
    func:(id:string,value:string)=>{
      itemMap.value[id].name=value
    },
    permission:permission.value
  },info.value.name)
}
const onSearch=()=>{
  getInfo()
}
onBeforeMount(()=>{
  getInfo().then(()=>{
		if(!info.value) {
			return
		}
    if(objMeta?.wikiItemId) {
      selectedKeys.value=[objMeta.wikiItemId]
      expandedKeys.value=[]
      function _find(data:ICommon_Route_Res_Wiki_Info_Item[]) {
        for (let obj of data) {
          expandedKeys.value.push(obj.id)
          if(obj.id==objMeta.wikiItemId) {
            return true
          } else if(obj.data && obj.data.length>0) {
            let ret=_find(obj.data)
            if(ret) {
              return true
            } else {
              expandedKeys.value.pop()
            }
          } else {
            expandedKeys.value.pop()
          }
        }
        return false
      }
      _find(info.value.data)
      expandedKeys.value.splice(expandedKeys.value.length-1,1)
      onSelect(selectedKeys.value)
      delete objMeta.wikiItemId
    }
  })
  getPermission()
})
</script>

<style scoped>

</style>