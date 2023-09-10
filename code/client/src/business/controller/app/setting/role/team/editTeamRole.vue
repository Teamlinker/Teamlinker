<template>
  <div>
    <a-form :model="form" style="width: 80%" ref="eleForm">
      <a-form-item field="name" :label="$t('util.name')" required>
        <a-input v-model="form.name"></a-input>
      </a-form-item>
      <a-form-item field="description" :label="$t('util.description')">
        <a-textarea v-model="form.description" allow-clear></a-textarea>
      </a-form-item>
      <a-form-item field="permissions" :label="$t('util.permissions')">
        <a-space :wrap="true">
          <a-tag v-for="(item,index) in form.permissions" bordered color="arcoblue" checkable :checked="item.checked" @check="item.checked=!item.checked">{{item.name}}</a-tag>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">

import {onDialogOk} from "../../../../../common/component/dialog/dialog";
import {
	getAllPermissions,
	Permission_Base,
	Permission_Types
} from "../../../../../../../../common/permission/permission";
import {reactive, ref} from "vue";
import {apiTeam} from "../../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";

const eleForm=ref(null)
const props=defineProps<{
  teamId?:string
  type:"edit"|"add"
  item?:{
    id:string
    name:string,
    description:string,
    permissions:Permission_Base[]
  }
}>()
const {t}=useI18n()
const form=reactive(props.type=="edit"?{
  name:props.item.name,
  description:props.item.description,
  permissions:getAllPermissions(Permission_Types.Team).filter(item=>{
    if(item.name!=="ADMIN") {
      return true;
    }
  }).map(item=>{
    return {
      ...item,
      checked:props.item.permissions.map(item=>item.name).includes(item.name)
    }
  })
}:{
  name:"",
  description:"",
  permissions:getAllPermissions(Permission_Types.Team).filter(item=>{
    if(item.name!=="ADMIN") {
      return true;
    }
  }).map(item=>{
    return {
      ...item,
      checked:false
    }
  })
});
onDialogOk(async ()=>{
  let ret=await eleForm.value.validate()
  if(ret) {
    return false;
  }
  let value=form.permissions.filter(item=>{
    if(item.checked) {
      return true
    }
  }).reduce((previousValue, currentValue, currentIndex, array)=>{
    return previousValue | currentValue.value
  },0)
  let res=await (props.type=="edit"?apiTeam.editRole({
    roleId:props.item.id,
    name:form.name,
    description:form.description,
    value:value
  }):apiTeam.addRole({
    ...(props.teamId && {
      teamId:props.teamId
    }),
    name:form.name,
    description:form.description,
    value:value
  }))
  if(res?.code==0) {
    Message.success(t("tip.updateSuccess"))
    return true
  } else {
    Message.error(res.msg);
    return false
  }
})
</script>

<style scoped>

</style>