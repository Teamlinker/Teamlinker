<template>
  <div>
    <a-button @click="onAddRole" type="primary" style="margin-bottom: 10px">{{$t("util.add")}}</a-button>
    <a-table :columns="columns" :data="roleList" :pagination="false">
      <template #description="{record}">
        {{record.description}}
      </template>
      <template #permission="{record}">
        <a-space wrap>
          <a-tag v-for="item in record.permissions.map(item=>item.name)">{{item}}</a-tag>
        </a-space>
      </template>
      <template #global="{record}">
        <icon-check v-if="record.global" style="color: green"></icon-check>
        <icon-close v-else style="color: red"></icon-close>
      </template>
      <template #operation="{record}">
        <template v-if="!record.global">
          <a-space wrap>
            <a-button type="primary" size="small" @click="onEditRole(record)">{{$t("util.manage")}}</a-button>
            <a-button status="danger" size="small" @click="onDeleteRole(record)">{{$t("util.delete")}}</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {Permission_Base, Permission_Types} from "../../../../../../../common/permission/permission";
import {Dialog} from "../../../../common/component/dialog/dialog";
import {apiProject} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {getRootNavigatorRef} from "../../../../../teamOS/common/component/navigator/navigator";
import EditProjectRole from "../../setting/role/project/editProjectRole.vue";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  projectId:string
}>()
const appContext=getCurrentInstance().appContext
const root=getRootNavigatorRef()
const roleId=ref("all")
type RoleItem={
  id:string,
  name:string,
  reserved:number,
  description:string,
  global:boolean,
  permissions:Permission_Base[]
}
const {t}=useI18n()
const columns=[
  {
    title:t("util.name"),
    dataIndex:"name"
  },
  {
    title:t("util.description"),
    slotName:"description"
  },
  {
    title:t("util.permission"),
    slotName:"permission"
  },
  {
    title:t("util.global"),
    slotName: "global"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
const pagination=reactive({
  total:0,
  current:1,
  pageSize:20
})
const roleList=ref<RoleItem[]>([])
const onAddRole=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingRole.addRole"),markRaw(EditProjectRole),{
    type:"add",
    ...(props.projectId && {
      projectId:props.projectId
    })
  })
  if(ret) {
    listRole();
  }
}
const onEditRole=async (item:RoleItem) =>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingRole.editRole"),markRaw(EditProjectRole),{
    type:"edit",
    item:{
      name:item.name,
      id:item.id,
      description:item.description,
      permissions:item.permissions
    }
  })
  if(ret) {
    listRole()
  }
}
const onDeleteRole=async (item:RoleItem)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteRole"))
  if(ret) {
    let res=await apiProject.removeRole({
      roleId:item.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      listRole()
    } else {
      Message.error(res.msg);
    }
  }
}
const listRole=async ()=>{
  let ret=await apiProject.listRole({
    ...(props.projectId && {
      projectId:props.projectId
    })
  })
  if(ret?.code==0) {
    let value=ret.data;
    let arr:RoleItem[]=[]
    arr.push({
      name:value.admin.name,
      id:value.admin.id,
      reserved:value.admin.reserved,
      description:value.admin.description,
      permissions:[{
        name:Permission_Types.Team.ADMIN.name,
        description:Permission_Types.Team.ADMIN.description,
        value:Permission_Types.Team.ADMIN.value
      }],
      global:true
    })
    for(let obj of value.users) {
      arr.push({
        name:obj.name,
        id:obj.id,
        reserved:obj.reserved,
        description:obj.description,
        permissions:obj.permissions as Permission_Base[],
        global:!!obj.global
      })
    }
    roleList.value=arr;
  }
}
onBeforeMount(async ()=>{
  listRole()
})
</script>

<style scoped>

</style>