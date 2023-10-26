<template>
  <div>
    <a-space size="medium">
      <span>{{$t("controller.app.setting.project.editProjectAccess.name")}}</span>
      <a-input v-model="keyword"></a-input>
      <span>{{$t("controller.app.setting.project.editProjectAccess.memberType")}}</span>
      <a-select  v-model="memberType" style="width: 100px">
        <a-option :value="ECommon_Model_Organization_Member_Type.DEFAULT">{{$t("util.default")}}</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.USER">{{$t("util.user")}}</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.TEAM">{{$t("util.team")}}</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.MEMBERTAG">{{$t("util.tag")}}</a-option>
      </a-select>
      <a-button type="primary" @click="onSearch">{{$t("util.search")}}</a-button>
      <a-button type="primary" @click="onAdd">{{$t("util.add")}}</a-button>
    </a-space>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="pagination" @pageChange="onPageChange">
      <template #name="{record}">
        <template v-if="record.memberType==ECommon_Model_Organization_Member_Type.DEFAULT">{{$t("util.default")}}</template>
        <template v-else-if="record.memberType==ECommon_Model_Organization_Member_Type.USER">{{ record.member.nickname }}</template>
        <template v-else-if="record.memberType==ECommon_Model_Organization_Member_Type.TEAM">{{record.team.name}}</template>
        <template v-else-if="record.memberType==ECommon_Model_Organization_Member_Type.MEMBERTAG">{{record.tag.name}}</template>
      </template>
      <template #role="{record}">
        <a-tag>{{record.role.name}}</a-tag>
      </template>
      <template #operation="{record}">
        <a-space wrap>
          <a-button @click="onEditRole(record)" size="small">{{$t("util.role")}}</a-button>
          <a-button status="danger" size="small" @click="onDelete(record)" v-if="wikiInfo.created_by.organizationUserId!==record.member?.id">{{$t("util.remove")}}</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {ECommon_Model_Organization_Member_Type} from "../../../../../../../common/model/organization.js";
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiWiki} from "../../../../common/request/request";
import {ICommon_Route_Res_Role_Member_Item} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import EditWikiAccessRole from "./editWikiAccessRole.vue";
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import {useI18n} from "vue-i18n";
import {ICommon_Model_Wiki} from "../../../../../../../common/model/wiki";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  wikiId:string
}>()
const {t}=useI18n()
const columns=[
  {
    title:t("util.name"),
    slotName:"name"
  },
  {
    title:t("util.role"),
    slotName:"role"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
const wikiInfo=ref<DCSType<ICommon_Model_Wiki>>()
let data=ref<DCSType<ICommon_Route_Res_Role_Member_Item[]>>([])
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const memberType=ref(ECommon_Model_Organization_Member_Type.DEFAULT)
const search=async (page:number)=>{
  let res=await apiWiki.listMember({
    wikiId:props.wikiId,
    size:pagination.pageSize,
    page:page-1,
    key:keyword.value,
    memberType:memberType.value
  })
  if(res?.code==0) {
    data.value=res.data.data
    pagination.total=res.data.count;
    pagination.current=page
  } else {
    Message.error(res.msg)
  }
}
const onPageChange=(page:number)=>{
  search(page)
}
const onSearch=()=>{
  search(1)
}
const onAdd=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.invite"),markRaw(EditWikiAccessRole),{
    type:"add",
    wikiId:props.wikiId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditRole=async (item:DCSType<ICommon_Route_Res_Role_Member_Item>)=>{
  let ret=await Dialog.open(root.value,appContext,t("util.edit"),markRaw(EditWikiAccessRole),{
    type:"edit",
    item:item,
    wikiId:props.wikiId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onDelete=async (item:DCSType<ICommon_Route_Res_Role_Member_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.removeUser"))
  let memberId:string;
  if(item.memberType==ECommon_Model_Organization_Member_Type.USER)
  {
    memberId=item.member.id
  } else if(item.memberType==ECommon_Model_Organization_Member_Type.TEAM) {
    memberId=item.team.id
  } else if(item.memberType==ECommon_Model_Organization_Member_Type.MEMBERTAG) {
    memberId=item.tag.id
  }
  if(ret) {
    let res=await apiWiki.removeMember({
      type:item.memberType,
      wikiId:props.wikiId,
      ...(memberId && {
        memberId
      })
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      search(pagination.current)
    }
  }
}

const getWikiInfo=async ()=>{
	const res=await apiWiki.wikiInfo({
		wikiId:props.wikiId
	})
	if(res?.code==0) {
		wikiInfo.value=res.data
	}
}
onBeforeMount(()=>{
	getWikiInfo()
	search(pagination.current)
})
</script>

<style scoped>

</style>