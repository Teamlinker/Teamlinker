<template>
  <a-form ref="eleForm" style="width: 80%" :model="form" @submitSuccess="onSubmit">
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
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
	  <a-form-item :label="$t('util.createdBy')">
		  <UserAvatar :organization-user-id="createdBy" v-if="createdBy"></UserAvatar>
	  </a-form-item>
    <a-form-item>
	    <a-space>
		    <a-button html-type="submit" type="primary">{{$t("util.save")}}</a-button>
		    <a-button html-type="button" type="primary" status="danger" @click="onDelete">{{$t("util.delete")}}</a-button>
	    </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">

import Upload from "../../../../common/component/upload.vue";
import {getCurrentInstance, onBeforeMount, reactive, ref} from "vue";
import {apiProject} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {Dialog} from "@/business/common/component/dialog/dialog";
import {getCurrentNavigator, getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";
import UserAvatar from "@/business/common/component/userAvatar.vue";

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
const createdBy=ref()
const eleForm=ref(null);
const navigator=getCurrentNavigator()
const root=getRootNavigatorRef()
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
	  createdBy.value=res.data.created_by.organizationUserId
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

const onDelete=async ()=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteProject"))
	if(ret) {
		let res=await apiProject.remove({
			projectId:props.projectId
		})
		if(res?.code==0) {
			navigator.replace("project")
		} else {
			Message.error(res.msg)
		}
	}
}
</script>
<style scoped>

</style>