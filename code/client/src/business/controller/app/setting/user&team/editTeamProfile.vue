<template>
  <a-form :model="form" ref="eleForm" style="width: 80%">
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
    <a-form-item field="photo" :label="$t('util.photo')">
      <Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="type=='edit'?item.photo:''" @upload="onUpload"></Upload>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import Upload from "../../../../common/component/upload.vue";
import {ICommon_Model_Team} from "../../../../../../../common/model/team";
import {getCurrentInstance, reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {apiTeam} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  type:"edit"|"add"
  item?:ICommon_Model_Team
}>()
const form=reactive({
  name:props.type=="edit"?props.item.name:"",
  description:props.type=="edit"?props.item.description:"",
})
const {t}=useI18n()
const uploadUriId=ref("")
const onUpload=(id:string)=> {
  uploadUriId.value=id
}
const eleForm=ref(null);
const appContext=getCurrentInstance().appContext;
onDialogOk(async ()=>{
  let isError=await eleForm.value.validate()
  if(isError) {
    return false;
  }
  let res=await (props.type=="edit"?apiTeam.update({
    teamId:props.item.id,
    ...form,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  }):apiTeam.create({
    ...form,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  }))
  if(res?.code==0){
    Message.success(t("tip.operationSuccess"));
    return true;
  } else {
    Message.error(res.msg);
    return false
  }
})
</script>

<style scoped>

</style>