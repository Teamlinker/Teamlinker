<template>
  <a-form ref="eleForm" style="width: 80%" :model="form" @submitSuccess="onSubmit">
    <a-form-item field="name" label="name" required>
      <a-input v-model="form.name"></a-input>
    </a-form-item>
    <a-form-item field="description" label="description">
      <a-textarea v-model="form.description" allow-clear></a-textarea>
    </a-form-item>
    <a-form-item label="logo">
      <Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="photo" @upload="onUpload"></Upload>
    </a-form-item>
    <a-form-item>
      <a-button html-type="submit" type="primary">Save</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">

import Upload from "../../../../common/component/upload.vue";
import {getCurrentInstance, onBeforeMount, reactive, ref} from "vue";
import {apiWiki} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";

const props=defineProps<{
  wikiId:string
}>()
const photo=ref("")
const form = reactive({
  name: "",
  keyword: "",
  description: "",
})
const uploadUriId=ref("")
const onUpload=(id:string)=> {
  uploadUriId.value=id
}
const eleForm=ref(null);
const appContext=getCurrentInstance().appContext;
const getWikiInfo=async ()=>{
  let res=await apiWiki.wikiInfo({
    wikiId:props.wikiId
  })
  if(res?.code==0) {
    form.name=res.data.name
    form.description=res.data.description
    photo.value=res.data.photo
  }
}
onBeforeMount(async ()=>{
  getWikiInfo()
})
const onSubmit=async ()=>{
  let res=await apiWiki.editWiki({
    wikiId:props.wikiId,
    ...form,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  })
  if(res?.code==0) {
    Message.success("save success")
  } else {
    Message.error(res.msg)
  }
}
</script>
<style scoped>

</style>