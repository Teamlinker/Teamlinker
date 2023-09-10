<template>
  <a-form ref="eleForm" style="width: 80%" :model="form" @submitSuccess="onSubmit">
    <a-form-item field="name" :label="$t('util.name')" required>
      {{form.name}}
    </a-form-item>
    <a-form-item field="keyword" :label="$t('util.keyword')" required>
      {{form.keyword}}
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
    <a-form-item :label="$t('util.logo')">
      <Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="photo" @upload="onUpload"></Upload>
    </a-form-item>
    <a-form-item>
      <a-button html-type="submit" type="primary">{{$t("util.save")}}</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">

import Upload from "../../../../common/component/upload.vue";
import {getCurrentInstance, onBeforeMount, reactive, ref} from "vue";
import {apiProject} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";

const props=defineProps<{
  projectId:string
}>()
const photo=ref("")
const form = reactive({
  name: "",
  keyword: "",
  description: "",
})
const uploadUriId=ref("")
const {t}=useI18n()
const onUpload=(id:string)=> {
  uploadUriId.value=id
}
const eleForm=ref(null);
const appContext=getCurrentInstance().appContext;
const getProjectInfo=async ()=>{
  let res=await apiProject.basic({
    projectId:props.projectId
  })
  if(res?.code==0) {
    form.name=res.data.name
    form.description=res.data.description
    form.keyword=res.data.keyword
    photo.value=res.data.photo
  }
}
onBeforeMount(async ()=>{
  getProjectInfo()
})
const onSubmit=async ()=>{
  let res=await apiProject.edit({
    projectId:props.projectId,
    ...form,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  })
  if(res?.code==0) {
    Message.success(t("tip.saveSuccess"))
  } else {
    Message.error(res.msg)
  }
}
</script>
<style scoped>

</style>