<template>
  <a-form :model="data.form" style="width: 80%;margin-top: 20px" @submitSuccess="onSubmit">
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="data.form.name"></a-input>
    </a-form-item>
    <a-form-item field="description" :label="$t('util.description')">
      <a-textarea v-model="data.form.description" allow-clear></a-textarea>
    </a-form-item>
    <a-form-item field="photo" :label="$t('util.logo')">
      <Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="data.form.photo" @upload="onUpload"></Upload>
    </a-form-item>
    <a-form-item>
	    <a-space>
		    <a-button html-type="submit" type="primary" :loading="loading">{{$t("util.submit")}}</a-button>
	    </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import {apiOrganization} from "../../../../common/request/request";
import {getCurrentInstance, onBeforeMount, reactive, ref} from "vue";
import Upload from "../../../../common/component/upload.vue";
import {Message} from "@arco-design/web-vue";
import {useDesktopStore} from "../../../desktop/store/desktop";
import {SessionStorage} from "../../../../common/storage/session";
import {useI18n} from "vue-i18n";
import {Dialog} from "@/business/common/component/dialog/dialog";
import {getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";

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
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext
const loading=ref(false)
const {t}=useI18n()
const onSubmit=async ()=>{
  let body={
    organizationId:SessionStorage.get("organizationId"),
    name:data.form.name,
    description: data.form.description,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  }
  let ret=await apiOrganization.update(body,loading)
  if(ret?.code==0) {
    Message.success(t("tip.updateSuccess"))
    storeDesktop.$update();
  } else {
    Message.error(ret?.msg??"unknown error")
  }

}

const onDelete=async ()=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteOrganization"))
	if(ret) {
		let ret=await Dialog.input(root.value,appContext,t("placeholder.typeOrganizationName"))
		if(ret===storeDesktop.organizationInfo?.name) {
			let res=await apiOrganization.remove({
				organizationId:storeDesktop.organizationInfo.id
			})
			if(res?.code==0) {
				Message.success(t("tip.operationSuccess"))
				location.reload()
			}
		} else {
			Message.error(t("tip.notMatch"))
		}
	}
}

onBeforeMount(async ()=>{
  let ret=await apiOrganization.info({
    organizationId:SessionStorage.get("organizationId")
  })
  if(ret?.code==0) {
    data.form=ret.data
  }
})
</script>

<style scoped>

</style>