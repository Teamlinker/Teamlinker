<template>
  <a-form ref="eleForm" style="width: 80%" :model="form">
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name" v-if="type=='add'"></a-input>
      <template v-else>{{form.name}}</template>
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
    <a-form-item :label="$t('util.logo')">
      <Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="type=='edit'?item.photo:''" @upload="onUpload"></Upload>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import Upload from "../../../../common/component/upload.vue";
import {getCurrentInstance, reactive, ref} from "vue";
import {onDialogOk} from "../../../../common/component/dialog/dialog";
import {apiWiki} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {ICommon_Model_Wiki} from "../../../../../../../common/model/wiki";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../../common/types";

const props=defineProps<{
  type:"edit"|"add",
  item?:DCSType<ICommon_Model_Wiki>
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
  let res=await (props.type=="edit"?apiWiki.editWiki({
    wikiId:props.item.id,
    ...form,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  }):apiWiki.addWiki({
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