<template>
  <a-form :model="data.form" style="width: 80%;margin-top: 20px" @submitSuccess="onSubmit">
    <a-form-item field="name" label="name" required>
      <a-input v-model="data.form.name"></a-input>
    </a-form-item>
    <a-form-item field="description" label="description">
      <a-textarea v-model="data.form.description" allow-clear></a-textarea>
    </a-form-item>
    <a-form-item field="photo" label="logo">
      <Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="data.form.photo" @upload="onUpload"></Upload>
    </a-form-item>
    <a-form-item>
      <a-button html-type="submit" :loading="loading">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {apiOrganization} from "../../../../common/request/request";
import {onBeforeMount, reactive, ref} from "vue";
import Upload from "../../../../common/component/upload.vue";
import {Message} from "@arco-design/web-vue";
import {useDesktopStore} from "../../../desktop/store/desktop";

const storeDesktop=useDesktopStore()
const data=reactive({
  form:{
    name:"",
    description:"",
    photo:""
  }
})
const uploadUriId=ref("")
const onUpload=(id:string)=> {
  uploadUriId.value=id
}
const loading=ref(false)

const onSubmit=async ()=>{
  let body={
    organizationId:sessionStorage.getItem("organizationId"),
    name:data.form.name,
    description: data.form.description,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  }
  let ret=await apiOrganization.update(body,loading)
  if(ret?.code==0) {
    Message.success("update success")
    storeDesktop.$update();
  } else {
    Message.error(ret?.msg??"unknown error")
  }

}

onBeforeMount(async ()=>{
  let ret=await apiOrganization.info({
    organizationId:sessionStorage.getItem("organizationId")
  })
  if(ret?.code==0) {
    data.form=ret.data
  }
})
</script>

<style scoped>

</style>