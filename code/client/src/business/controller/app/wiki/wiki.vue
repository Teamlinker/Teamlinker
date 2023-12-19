<template>
  <div style="height: 100%;overflow-y: auto;padding: 0px 10px" ref="root">
    {{$t("controller.app.project.project.yourWork")}}
    <a-collapse :default-active-key="['recent','all']" style="margin-top: 10px">
      <a-collapse-item :header="$t('controller.app.wiki.wiki.recentWikiList')" key="recent">
        <a-space wrap style="margin-top: 20px" size="large" v-if="recentList.length>0">
          <CardItem v-for="item in recentList" style="background-color: white" :name="item.name" :description="item.description" :key="item.id" :photo="item.photo" @click="onClickWikiItem(item.id,item.name)" v-drag.shortcut="{
						shortcutType:ECommon_Model_Finder_Shortcut_Type.WIKI,
						shortcutRefId:item.id,
						shortcutName:item.name
          }"></CardItem>
        </a-space>
        <a-empty v-else></a-empty>
      </a-collapse-item>
      <a-collapse-item :header="$t('controller.app.wiki.wiki.allWikiList')" key="all">
        <a-row>
          <a-space>
	          {{$t("util.type")}}
            <a-select v-model="type" style="width: 100px">
              <a-option :label="$t('util.all')" value="all"></a-option>
              <a-option :label="$t('util.created')" value="created"></a-option>
              <a-option :label="$t('util.joined')" value="joined"></a-option>
            </a-select>
            <a-input-search style="width: 250px" v-model="keyword" :placeholder="$t('placeholder.typeWikiName')" @search="onSearch"></a-input-search>
            <a-button type="primary" @click="onAddWiki" v-if="checkPermission(storeOrganization.organizationPermission,Permission_Types.Organization.CREATE_WIKI)">
	            {{$t("util.create")}}
            </a-button>
          </a-space>
        </a-row>
        <a-space wrap style="margin-top: 20px" size="large" v-if="list.length>0">
          <CardItem v-for="item in list" style="background-color: white" :name="item.name" :description="item.description" :key="item.id" :photo="item.photo" @click="onClickWikiItem(item.id,item.name)" v-drag.shortcut="{
						shortcutType:ECommon_Model_Finder_Shortcut_Type.WIKI,
						shortcutRefId:item.id,
						shortcutName:item.name
          }"></CardItem>
        </a-space>
        <a-empty v-else></a-empty>
        <a-pagination :page-size="20" :total="pagination.total" style="margin-top: 10px" @change="onPageChange"></a-pagination>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiWiki} from "../../../common/request/request";
import {checkPermission, Permission_Types} from "../../../../../../common/permission/permission";
import {useDesktopStore} from "../../desktop/store/desktop";
import {Dialog} from "../../../common/component/dialog/dialog";
import {
	ETeamOS_Navigator_Action,
	getCurrentNavigator,
	onNavigatorShow
} from "../../../../teamOS/common/component/navigator/navigator";
import CardItem from "../../../common/component/cardItem.vue";
import {ICommon_Model_Wiki} from "../../../../../../common/model/wiki";
import EditWikiProfile from "../setting/wiki/editWikiProfile.vue";
import {vDrag} from "../../../../teamOS/common/directive/drag";
import {ECommon_Model_Finder_Shortcut_Type} from "../../../../../../common/model/finder_item";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";

const recentList=ref<DCSType<ICommon_Model_Wiki>[]>([])
const list=ref<DCSType<ICommon_Model_Wiki>[]>([])
const type=ref<"all"|"created"|"joined">("all")
const keyword=ref("")
const storeOrganization=useDesktopStore()
const root=ref(null);
const appContext=getCurrentInstance().appContext
const navigator=getCurrentNavigator()
const {t}=useI18n()
const pagination=reactive({
  total:0,
  current:1,
  pageSize:20
})
const listAllWiki=async (page:number)=>{
  let res=await apiWiki.userWikiList({
    keyword:keyword.value,
    type:type.value,
    size:pagination.pageSize,
    page:page-1
  })
  if(res?.code==0) {
    list.value=res.data.data
    pagination.total=res.data.count;
    pagination.current=page
  }
}
const listRecentWiki=async()=>{
  let res=await apiWiki.recentWikiList()
  if(res?.code==0) {
    recentList.value=res.data
  }
}
const onPageChange=(page:number)=>{
  listAllWiki(page)
}
onBeforeMount(async ()=>{
  listRecentWiki()
  listAllWiki(pagination.current)
})
const onSearch=async ()=>{
  listAllWiki(1)
}
const onAddWiki=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditWikiProfile),{
    type:"add"
  })
  if(ret) {
    keyword.value=""
    listAllWiki(1)
  }
}
const onClickWikiItem=(wikiId:string, name:string)=>{
  navigator.push("profile",{
    wikiId:wikiId
  },name)
}
onNavigatorShow(action => {
  if(action===ETeamOS_Navigator_Action.BACK) {
    listRecentWiki()
    listAllWiki(pagination.current)
  }
})
</script>

<style scoped>

</style>