<template>
  <div ref="root">
    <a-button @click="onAdd" type="primary" style="margin-bottom: 10px">{{$t("util.add")}}</a-button>
    <a-table :columns="columns" :data="data" :pagination="false">
      <template #description="{record}">
        {{record.description}}
      </template>
      <template #permission="{record}">
        <a-space wrap>
          <a-tag v-for="item in record.permissions.map(item=>item.name)">{{item}}</a-tag>
        </a-space>
      </template>
      <template #reserved="{record}">
        <icon-check v-if="record.reserved" style="color: green"></icon-check>
        <icon-close v-else style="color: red"></icon-close>
      </template>
      <template #operation="{record}">
        <template v-if="!record.reserved">
          <a-space wrap>
            <a-button type="primary" size="small" @click="onEdit(record)">{{$t("util.manage")}}</a-button>
            <a-button status="danger" size="small" @click="onDelete(record)">{{$t("util.delete")}}</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, ref} from "vue";
import {apiTeam} from "../../../../../common/request/request";
import {Dialog} from "../../../../../common/component/dialog/dialog";
import {Permission_Base, Permission_Types} from "../../../../../../../../common/permission/permission";
import {Message} from "@arco-design/web-vue";
import EditTeamRole from "./editTeamRole.vue";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  teamId?:string
}>()
type Item={
  id:string,
  name:string,
  reserved:number,
  description:string,
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
    title:t("util.reserved"),
    slotName: "reserved"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
const data=ref<Item[]>([])
const root=ref(null)
const appContext=getCurrentInstance().appContext
const onAdd=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingRole.addRole"),markRaw(EditTeamRole),{
    type:"add",
    ...(props.teamId && {
      teamId:props.teamId
    })
  })
  if(ret) {
    init()
  }
}
const onEdit=async (item:Item) =>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingRole.editRole"),markRaw(EditTeamRole),{
    type:"edit",
    item:{
      name:item.name,
      id:item.id,
      description:item.description,
      permissions:item.permissions
    }
  })
  if(ret) {
    init()
  }
}
const onDelete=async (item:Item)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteRole"))
  if(ret) {
    let res=await apiTeam.removeRole({
      roleId:item.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      init()
    } else {
      Message.error(res.msg);
    }
  }
}
const init=async ()=>{
  let ret=await apiTeam.roles({
    ...(props.teamId && {
      teamId:props.teamId
    })
  })
  if(ret?.code==0) {
    let value=ret.data;
    let arr:Item[]=[]
    arr.push({
      name:value.admin.name,
      id:value.admin.id,
      reserved:value.admin.reserved,
      description:value.admin.description,
      permissions:[{
        name:Permission_Types.Team.ADMIN.name,
        description:Permission_Types.Team.ADMIN.description,
        value:Permission_Types.Team.ADMIN.value
      }]
    })
    if(props.teamId) {
      value.users=value.users.filter(item=>{
        if(!item.global) {
          return true
        }
      })
    }
    for(let obj of value.users) {
      arr.push({
        name:obj.name,
        id:obj.id,
        reserved:obj.reserved,
        description:obj.description,
        permissions:obj.permissions as Permission_Base[]
      })
    }
    data.value=arr
  }
}
onBeforeMount(init)
</script>

<style scoped>

</style>