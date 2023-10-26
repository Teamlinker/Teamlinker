<template>
  <a-form ref="eleForm" style="width: 80%" :model="form" @submitSuccess="onSubmit">
    <a-form-item field="name" :label="$t('util.name')" required>
      <a-input v-model="form.name"></a-input>
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
import {apiWiki} from "../../../../common/request/request";
import {Message} from "@arco-design/web-vue";
import {useI18n} from "vue-i18n";
import {Dialog} from "@/business/common/component/dialog/dialog";
import {getCurrentNavigator, getRootNavigatorRef} from "@/teamOS/common/component/navigator/navigator";
import UserAvatar from "@/business/common/component/userAvatar.vue";

const props=defineProps<{
  wikiId:string
}>()
const photo=ref("")
const form = reactive({
  name: "",
  keyword: "",
  description: "",
})
const {t}=useI18n()
const createdBy=ref()
const uploadUriId=ref("")
const onUpload=(id:string)=> {
  uploadUriId.value=id
}
const navigator=getCurrentNavigator()
const eleForm=ref(null);
const root=getRootNavigatorRef()
const appContext=getCurrentInstance().appContext;
const getWikiInfo=async ()=>{
  let res=await apiWiki.wikiInfo({
    wikiId:props.wikiId
  })
  if(res?.code==0) {
    form.name=res.data.name
    form.description=res.data.description
    photo.value=res.data.photo
	  createdBy.value=res.data.created_by.organizationUserId
  }
}

const onSubmit=async ()=>{
  let res=await apiWiki.editWiki({
    wikiId:props.wikiId,
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
	let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteWikiSpace"))
	if(ret) {
		let res=await apiWiki.deleteWiki({
			wikiId:props.wikiId
		})
		if(res?.code==0) {
			navigator.replace("wiki")
		} else {
			Message.error(res.msg)
		}
	}
}

onBeforeMount(async ()=>{
	getWikiInfo()
})
</script>
<style scoped>

</style>