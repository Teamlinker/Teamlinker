<template>
  <div ref="root">
    <a-space size="medium">
      <span>name</span>
      <a-input v-model="keyword"></a-input>
      <span>member type</span>
      <a-select  v-model="memberType">
        <a-option :value="ECommon_Model_Organization_Member_Type.DEFAULT">Default</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.USER">User</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.TEAM">Team</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.MEMBERTAG">Tag</a-option>
      </a-select>
      <a-button type="primary" @click="onSearch">Search</a-button>
      <a-button type="primary" @click="onAdd">Add</a-button>
    </a-space>
    <a-table style="margin-top: 10px" :columns="columns" :data="data" :pagination="pagination" @pageChange="onPageChange">
      <template #name="{record}">
        <template v-if="record.memberType==ECommon_Model_Organization_Member_Type.DEFAULT">Default</template>
        <template v-else-if="record.memberType==ECommon_Model_Organization_Member_Type.USER">{{ record.member.nickname }}</template>
        <template v-else-if="record.memberType==ECommon_Model_Organization_Member_Type.TEAM">{{record.team.name}}</template>
        <template v-else-if="record.memberType==ECommon_Model_Organization_Member_Type.MEMBERTAG">{{record.tag.name}}</template>
      </template>
      <template #role="{record}">
        <a-tag>{{record.role.name}}</a-tag>
      </template>
      <template #operation="{record}">
        <a-space wrap>
          <a-button @click="onEditRole(record)" size="small">Role</a-button>
          <a-button status="danger" size="small" @click="onDelete(record)">Remove</a-button>
        </a-space>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {ECommon_Model_Organization_Member_Type} from "../../../../../../../common/model/organization.js";
import {getCurrentInstance, markRaw, reactive, ref} from "vue";
import {apiProject, DCSType} from "../../../../common/request/request";
import {ICommon_Route_Res_Project_Member} from "../../../../../../../common/routes/response";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../../common/component/dialog/dialog";
import EditProjectAccessRole from "./editProjectAccessRole.vue";

const props=defineProps<{
  projectId:string
}>()
const columns=[
  {
    title:"name",
    slotName:"name"
  },
  {
    title:"role",
    slotName:"role"
  },
  {
    title:"operation",
    slotName: "operation"
  }
]
let data=ref<DCSType<ICommon_Route_Res_Project_Member[]>>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const pagination=reactive({
  total:0,
  current:1,
  pageSize:10
})
const keyword=ref("");
const memberType=ref(ECommon_Model_Organization_Member_Type.DEFAULT)
const search=async (page:number)=>{
  let res=await apiProject.listMember({
    projectId:props.projectId,
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
  let ret=await Dialog.open(root.value,appContext,"Invite",markRaw(EditProjectAccessRole),{
    type:"add",
    projectId:props.projectId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onEditRole=async (item:DCSType<ICommon_Route_Res_Project_Member>)=>{
  let ret=await Dialog.open(root.value,appContext,"Edit",markRaw(EditProjectAccessRole),{
    type:"edit",
    item:item,
    projectId:props.projectId
  })
  if(ret) {
    search(pagination.current)
  }
}
const onDelete=async (item:DCSType<ICommon_Route_Res_Project_Member>)=>{
  let ret=await Dialog.confirm(root.value,appContext,"Do you want to remove this user from this organization?")
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
    let res=await apiProject.removeMember({
      type:item.memberType,
      projectId:props.projectId,
      ...(memberId && {
        memberId
      })
    })
    if(res?.code==0) {
      Message.success("remove success")
      search(pagination.current)
    }
  }
}
</script>

<style scoped>

</style>