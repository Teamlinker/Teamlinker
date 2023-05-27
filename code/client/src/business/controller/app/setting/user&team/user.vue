<template>
  <div ref="root">
    <a-space>
      <a-input-search @search="onSearch" v-model="keyword" style="width: 300px" search-button placeholder="please type username or nickname"></a-input-search>
      <a-button type="primary" @click="onInvite" v-if="$deployMode.value===ECommon_Application_Mode.ONLINE">Invite</a-button>
	    <a-button type="primary" @click="onCreate" v-else>Create</a-button>
    </a-space>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="pagination" @pageChange="onPageChange">
      <template #username="{record}">
        {{record.user.username}}
      </template>
      <template #nickname="{record}">
        {{record.organizationUser.nickname}}
      </template>
      <template #role="{record}">
        <a-tag>{{record.role.name}}</a-tag>
      </template>
      <template #enable="{record}">
        <icon-check v-if="record.organizationUser.active" style="color: green"></icon-check>
        <icon-close v-else style="color: red"></icon-close>
      </template>
      <template #joinDate="{record}">
        {{moment(record.organizationUser.created_time).format('YYYY-MM-DD HH:mm:ss')}}
      </template>
      <template #tag="{record}">
        <a-space :wrap="true">
          <a-tag v-for="item in record.tag">{{item.name}}</a-tag>
        </a-space>
      </template>
      <template #operation="{record}">
        <a-space wrap>
          <a-dropdown-button size="small">
            Edit
            <template #icon>
              <icon-down></icon-down>
            </template>
            <template #content>
              <a-doption @click="onEditProfile(record)">Profile & Role</a-doption>
              <a-doption @click="onEditTag(record)">Tag</a-doption>
	            <a-doption v-if="$deployMode.value===ECommon_Application_Mode.OFFLINE" @click="onResetPassword(record)">Reset Password</a-doption>
            </template>
          </a-dropdown-button>
          <a-button status="danger" size="small" @click="onDelete(record)">Remove</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, reactive, ref} from "vue";
import {apiOrganization, DCSType} from "../../../../common/request/request";
import {ICommon_Route_Res_Organization_User_Item} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import EditUserProfile from "./editUserProfile.vue";
import BindTag from "./bindTag.vue";
import {SessionStorage} from "../../../../common/storage/session";
import {ECommon_Application_Mode} from "../../../../../../../common/types";
import CreateUserProfileOffline from "./createUserProfileOffline.vue";
import moment from "moment";

const columns=[
  {
    title:"username",
    slotName:"username"
  },
  {
    title:"nickname",
    slotName:"nickname"
  },
  {
    title:"role",
    slotName:"role"
  },
  {
    title:"enable",
    slotName:"enable"
  },
  {
    title:"join date",
    slotName:"joinDate"
  },
  {
    title:"tag",
    slotName:"tag"
  },
  {
    title:"operation",
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const search=async (page:number)=>{
  let res=await apiOrganization.listUser({
    organizationId:SessionStorage.get("organizationId"),
    size:pagination.pageSize,
    page:page-1,
    keyword:keyword.value
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
const onInvite=async ()=>{
  let ret=await Dialog.open(root.value,appContext,"Invite",markRaw(EditUserProfile),{
    type:"add"
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditProfile=async (item:DCSType<ICommon_Route_Res_Organization_User_Item>)=>{
  let ret=await Dialog.open(root.value,appContext,"Edit",markRaw(EditUserProfile),{
    type:"edit",
    item:item.organizationUser,
    username:item.user.username,
    role:item.role
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditTag=async (item:DCSType<ICommon_Route_Res_Organization_User_Item>)=>{
  let ret=await Dialog.open(root.value,appContext,"Edit",markRaw(BindTag),{
    tags:item.tag,
    organizationUserId:item.organizationUser.id
  })
  if(ret) {
    search(pagination.current)
  }
}
const onDelete=async (item:DCSType<ICommon_Route_Res_Organization_User_Item>)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove this user from this organization?")
  if(ret) {
    let res=await (appContext.config.globalProperties.$deployMode.value===ECommon_Application_Mode.ONLINE?apiOrganization.deleteUser({
      organizationUserId:item.organizationUser.id
    }):apiOrganization.deleteUserForOffline({
	    organizationUserId:item.organizationUser.id
    }))
    if(res?.code==0) {
      Message.success("remove success")
      search(pagination.current)
    }
  }
}

const onCreate=async ()=>{
	let ret=await Dialog.open(root.value,appContext,"Create",markRaw(CreateUserProfileOffline))
	if(ret) {
		search(pagination.current)
	}
}

const onResetPassword=async (item:DCSType<ICommon_Route_Res_Organization_User_Item>)=>{
	let ret=await Dialog.input(root.value,appContext,"type new password")
	if(ret) {
		let res=await apiOrganization.resetUserPassword({
			organizationUserId:item.organizationUser.id,
			password:ret
		})
		if(res?.code==0) {
			Message.info("reset success")
		}
	}
}
</script>

<style scoped>

</style>