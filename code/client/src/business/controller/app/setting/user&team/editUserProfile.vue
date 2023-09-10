<template>
  <div>
    <a-form :model="form" ref="eleForm" style="width: 80%">
      <a-form-item field="username" :label="$t('util.username')" :required="type=='add'">
        <a-input v-model="form.username" v-if="type=='add'"></a-input>
        <template v-else>{{username}}</template>
      </a-form-item>
      <a-form-item field="nickname" :label="$t('util.nickname')" required>
        <a-input v-model="form.nickname"></a-input>
      </a-form-item>
      <a-form-item field="job" :label="$t('util.job')">
        <a-input v-model="form.job"></a-input>
      </a-form-item>
      <a-form-item field="email" :label="$t('util.email')">
        <a-input v-model="form.email"></a-input>
      </a-form-item>
      <a-form-item field="location" :label="$t('util.location')">
        <a-input v-model="form.location"></a-input>
      </a-form-item>
      <a-form-item field="phone" :label="$t('util.phone')">
        <a-input v-model="form.phone"></a-input>
      </a-form-item>
      <a-form-item field="department" :label="$t('util.department')">
        <a-input v-model="form.department"></a-input>
      </a-form-item>
      <a-form-item field="active" :label="$t('util.active')">
        <a-switch v-model="form.active" :checked-value="1" :unchecked-value="0"></a-switch>
      </a-form-item>
      <a-form-item field="remark" :label="$t('util.remark')">
        <a-textarea v-model="form.remark" allow-clear></a-textarea>
      </a-form-item>
      <a-form-item field="roleId" :label="$t('util.role')" required>
        <a-select :placeholder="$t('placeholder.pleaseSelect')" v-model="form.roleId">
          <a-option v-for="item in roles" :value="item.id" :label="item.name"></a-option>
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {ICommon_Model_Organization_User} from "../../../../../../../common/model/organization_user";
import {onBeforeMount, reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {apiOrganization} from "../../../../common/request/request";
import {ICommon_Model_Role} from "../../../../../../../common/model/role";
import {Message} from "@arco-design/web-vue";
import {SessionStorage} from "../../../../common/storage/session";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  type:"edit"|"add",
  item?:ICommon_Model_Organization_User,
  username?:string,
  role?:ICommon_Model_Role
}>()
const eleForm=ref(null)
const form=reactive({
  nickname:props.type=="edit"?props.item.nickname:"",
  job:props.type=="edit"?props.item.job:"",
  email:props.type=="edit"?props.item.email:"",
  location:props.type=="edit"?props.item.location:"",
  phone:props.type=="edit"?props.item.phone:"",
  department:props.type=="edit"?props.item.department:"",
  remark:props.type=="edit"?props.item.remark:"",
  active:props.type=="edit"?props.item.active:1,
  roleId:props.type=='edit'?props.role.id:"",
  username:props.type=='edit'?props.username:""
})
const roles=ref<{
  id:string,
  name:string
}[]>([])
const {t}=useI18n()
onBeforeMount(async ()=>{
  let res=await apiOrganization.listRole({
    organizationId:SessionStorage.get("organizationId")
  })
  if(res?.code==0) {
    roles.value=[res.data.admin,...res.data.users].map(item=>{
      return {
        id:item.id,
        name:item.name
      }
    })
  }
})
onDialogOk(async ()=>{
  let ret=await eleForm.value.validate()
  if(ret) {
    return false;
  }
  let res=await (props.type=="add"?apiOrganization.addUser({
    organizationId:SessionStorage.get("organizationId"),
    ...form,
  }):apiOrganization.updateUser({
    organizationUserId:props.item.id,
    ...form
  }))
  if(res?.code==0) {
    Message.success(t("tip.operationSuccess"))
    return true
  } else {
    Message.error(res.msg)
    return false
  }
})
</script>

<style scoped>

</style>