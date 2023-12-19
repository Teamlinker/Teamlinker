<template>
  <a-form :model="form" ref="eleForm" style="width: 80%">
    <a-form-item field="organizationUserId" :label="$t('util.username')" required>
      <a-select @search="onSearch" v-model="form.organizationUserId" allow-search v-if="type=='add'">
        <a-option v-for="item in userList" :value="item.value" :label="item.label"></a-option>
      </a-select>
      <template v-else>{{item.organizationUser?.nickname}}</template>
    </a-form-item>
    <a-form-item field="roleId" :label="$t('util.role')" required>
      <a-select v-model="form.roleId">
        <a-option v-for="item in roleList" :value="item.id" :label="item.name"></a-option>
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {Message} from "@arco-design/web-vue";
import {onBeforeMount, reactive, ref} from "vue";
import {ICommon_Model_Role} from "../../../../../../../common/model/role";
import {ICommon_Route_Res_Organization_User_Item} from "../../../../../../../common/routes/response";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {apiOrganization, apiTeam} from "../../../../common/request/request";
import {SessionStorage} from "../../../../common/storage/session";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  type:"edit"|"add"
  teamId:string,
  item?:ICommon_Route_Res_Organization_User_Item
}>()
const eleForm=ref(null)
const form=reactive({
  organizationUserId:props.type=="edit"?props.item.organizationUser?.id:"",
  roleId:props.type=="edit"?props.item.role.id:""
})
const {t}=useI18n()
const roleList=ref<DCSType<ICommon_Model_Role[]>>([])
const userList=ref<{
  value:string,
  label:string
}[]>([])
const onSearch=async (value:string)=>{
  let res=await apiOrganization.listUser({
    organizationId:SessionStorage.get("organizationId"),
    page:0,
    size:20,
    keyword:value
  })
  if(res?.code==0) {
    userList.value=res.data.data.map(item=>{
      return {
        value:item.organizationUser?.id,
        label:item.organizationUser?.nickname
      }
    })
  }
}
onBeforeMount(async ()=>{
  let res=await apiTeam.roles({
    teamId:props.teamId
  })
  if(res?.code==0) {
    roleList.value=[res.data.admin,...res.data.users]
  }
})
onDialogOk(async ()=>{
  let isError=await eleForm.value.validate()
  if(isError) {
    return false
  }
  let res=await (props.type=="edit"?apiTeam.changeRole({
    teamId:props.teamId,
    ...form
  }):apiTeam.addMember({
    teamId:props.teamId,
    ...form
  }))
  if(res?.code==0) {
    Message.success(t("tip.operationSuccess"))
    return true
  } else {
    Message.error(res.msg)
    return false;
  }
})
</script>

<style scoped>

</style>