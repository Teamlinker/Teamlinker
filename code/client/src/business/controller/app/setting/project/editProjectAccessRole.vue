<template>
  <a-form :model="form" ref="eleForm" style="width: 80%">
    <a-form-item field="type" :label="$t('util.type')" required :disabled="type=='edit'" @change="onChangeType">
      <a-select  v-model="form.type">
        <a-option :value="ECommon_Model_Organization_Member_Type.DEFAULT">{{$t("util.default")}}</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.USER">{{$t("util.user")}}</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.TEAM">{{$t("util.team")}}</a-option>
        <a-option :value="ECommon_Model_Organization_Member_Type.MEMBERTAG">{{$t("util.tag")}}</a-option>
      </a-select>
    </a-form-item>
    <a-form-item field="memberId" :label="$t('util.name')" required v-if="form.type!==ECommon_Model_Organization_Member_Type.DEFAULT">
      <a-select @search="onSearch" v-model="form.memberId" allow-search v-if="type=='add'">
        <a-option v-for="item in userList" :value="item.value" :label="item.label"></a-option>
      </a-select>
      <template v-else>{{ getNameFromRoleMember(item) }}</template>
    </a-form-item>
    <a-form-item field="roleId" :label="$t('util.role')" required>
      <a-select v-model="form.roleId">
        <a-option v-for="item in roleList" :value="item.id" :label="item.name"></a-option>
      </a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {ICommon_Route_Res_Role_Member_Item} from "../../../../../../../common/routes/response";
import {onBeforeMount, reactive, ref} from "vue";
import {ICommon_Model_Role} from "../../../../../../../common/model/role";
import {apiOrganization, apiProject, apiTeam} from "../../../../common/request/request";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {Message} from "@arco-design/web-vue";
import {ECommon_Model_Organization_Member_Type} from "../../../../../../../common/model/organization";
import {getMemberIdFromRoleMember, getNameFromRoleMember} from "../../../../common/util/helper";
import {SessionStorage} from "../../../../common/storage/session";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  type:"edit"|"add"
  projectId:string,
  item?:ICommon_Route_Res_Role_Member_Item
}>()
const eleForm=ref(null)
const form=reactive({
  type:props.type=="edit"?props.item.memberType:ECommon_Model_Organization_Member_Type.DEFAULT,
  memberId:props.type=="edit"?getMemberIdFromRoleMember(props.item):"",
  roleId:props.type=="edit"?props.item.role.id:""
})
const roleList=ref<DCSType<ICommon_Model_Role[]>>([])
const userList=ref<{
  value:string,
  label:string
}[]>([])
const {t}=useI18n()
const onSearch=async (value:string)=>{
  if(form.type==ECommon_Model_Organization_Member_Type.USER) {
    let res=await apiOrganization.listUser({
      organizationId:SessionStorage.get("organizationId"),
      page:0,
      size:20,
      keyword:value
    })
    if(res?.code==0) {
      userList.value=res.data.data.map(item=>{
        return {
          value:item.organizationUser.id,
          label:item.organizationUser.nickname
        }
      })
    }
  } else if(form.type==ECommon_Model_Organization_Member_Type.TEAM) {
    let res=await apiTeam.list({
      page:0,
      size:20,
      keyword:value
    })
    if(res?.code==0) {
      userList.value=res.data.data.map(item=>{
        return {
          value:item.id,
          label:item.name
        }
      })
    }
  } else if(form.type==ECommon_Model_Organization_Member_Type.MEMBERTAG) {
    let res=await apiOrganization.listTag({})
    if(res?.code==0) {
      userList.value=res.data.map(item=>{
        return {
          value:item.id,
          label:item.name
        }
      })
    }
  }

}
const onChangeType=()=>{
  form.memberId=""
}
onBeforeMount(async ()=>{
  let res=await apiProject.listRole({
    projectId:props.projectId
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
  let res=await (props.type=="edit"?apiProject.editMember({
    projectId:props.projectId,
    ...form
  }):apiProject.addMember({
    projectId:props.projectId,
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