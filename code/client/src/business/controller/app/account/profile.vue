<template>
  <a-form :model="form" style="width: 80%" @submitSuccess="onSubmit">
    <a-form-item field="photo" :label="$t('util.avatar')">
      <Upload :default-uri="form.photo" types=".png,.jpg,.jpeg,.gif,.bmp,.svg" @upload="onUpload"></Upload>
    </a-form-item>
    <a-form-item :label="$t('util.username')">
      {{form.username}}
    </a-form-item>
    <a-form-item field="password" :label="$t('util.password')">
      <a-input-password v-model="form.password"></a-input-password>
    </a-form-item>
    <a-form-item field="repeatPassword" :label="$t('util.repeatPassword')" v-if="form.password">
      <a-input-password v-model="form.repeatPassword"></a-input-password>
    </a-form-item>
    <a-form-item field="sign" :label="$t('util.sign')">
      <a-input v-model="form.sign"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button html-type="submit" type="primary">{{$t("util.save")}}</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import Upload from "../../../common/component/upload.vue";
import {useDesktopStore} from "../../desktop/store/desktop";
import {reactive} from "vue";
import {apiUser} from "../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {SessionStorage} from "../../../common/storage/session";
import md5 from "blueimp-md5";
import {useI18n} from "vue-i18n";

const store=useDesktopStore()
const form=reactive({
  username:store.userInfo.username,
  photo:store.userInfo.photo,
  sign:store.userInfo.sign,
  password:"",
  repeatPassword:"",
  uploadUriId:""
})
const {t}=useI18n()
const onSubmit=async ()=>{
  if(form.password && form.password!==form.repeatPassword) {
    Message.error(t("tip.passwordNotMatch"))
    return;
  }
  let arrPromise=[]
  arrPromise.push(apiUser.update({
    userId:SessionStorage.get("userId"),
    ...(form.uploadUriId && {
      photo:form.uploadUriId
    }),
    sign:form.sign,
    ...(form.password && {

    })
  }))
  if(form.password) {
    arrPromise.push(apiUser.resetPassword({
      userId:SessionStorage.get("userId"),
      password:md5(form.password)
    }))
  }
  let [res1,res2]=await Promise.all(arrPromise)
  if(res1?.code==0) {
    Message.success(t("tip.updateSuccess"))
    store.$refreshUser();
  } else {
    Message.error(res1.msg)
  }
}
const onUpload=(id:string)=> {
  form.uploadUriId=id
}
</script>

<style scoped>

</style>