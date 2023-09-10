<template>
	<a-form :model="form" style="width: 80%;margin-top: 20px" ref="formEle">
		<a-form-item field="name" :label="$t('util.name')" required>
			<a-input v-model="form.name"></a-input>
		</a-form-item>
		<a-form-item field="description" :label="$t('util.description')">
			<a-textarea v-model="form.description" allow-clear></a-textarea>
		</a-form-item>
		<a-form-item field="photo" :label="$t('util.logo')">
			<Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="form.photo" @upload="onUpload"></Upload>
		</a-form-item>
	</a-form>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";

import {apiOrganization} from "../../common/request/request";
import {onDialogOk} from "../../common/component/dialog/dialog";
import {dialogFuncGenerator} from "../../common/util/helper";
import Upload from "../../common/component/upload.vue";

const formEle=ref()
const form=reactive({
	name:"",
	description:"",
	photo:""
})
const uploadUriId=ref("")
const onUpload=(id:string)=> {
	uploadUriId.value=id
}

onDialogOk(dialogFuncGenerator({
	form:()=>formEle.value,
	func:()=>{
		return apiOrganization.create({
			name:form.name,
			description: form.description,
			...(uploadUriId.value && {
				photo:uploadUriId.value
			})
		})
	}
}))
</script>

<style scoped>

</style>