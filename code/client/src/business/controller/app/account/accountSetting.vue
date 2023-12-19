<template>
	<a-collapse :default-active-key="['wallpaper']">
		<a-collapse-item key="wallpaper" :header="$t('util.wallpaper')">
			<a-form :model="formWallPaper" style="width: 80%" @submitSuccess="onSubmitWallpaper">
				<a-form-item field="photo" :label="$t('util.wallpaper')">
					<Upload :default-uri="formWallPaper.photo" types=".png,.jpg,.jpeg,.gif,.bmp,.svg,.webp" @upload="onUploadWallpaper"></Upload>
				</a-form-item>
				<a-form-item>
					<a-space size="large">
						<a-button html-type="submit" type="primary">{{$t("util.ok")}}</a-button>
						<a-button html-type="button" status="danger" v-if="formWallPaper.photo" @click="onClearWallpaper">{{$t("util.clear")}}</a-button>
					</a-space>
				</a-form-item>
			</a-form>
		</a-collapse-item>
	</a-collapse>
</template>

<script setup lang="ts">
import Upload from "@/business/common/component/upload.vue";
import {onBeforeMount, reactive} from "vue";
import {apiUser} from "@/business/common/request/request";
import {desktop} from "@/teamOS/desktop/desktop";

const formWallPaper=reactive({
	photo:"",
	uploadUriId:""
})
const getSetting=async ()=>{
	let res=await apiUser.setting()
	if(res?.code==0) {
		formWallPaper.photo=res.data.wallpaper
	}
}

const onSubmitWallpaper=async ()=>{
	let res=await apiUser.setWallpaper({
		photo:formWallPaper.uploadUriId
	})
	if(res?.code==0) {
		formWallPaper.photo=res.data.path
		desktop.setBackgroundImage(res.data.path)
	}
}
const onUploadWallpaper=(id:string)=> {
	formWallPaper.uploadUriId=id
}

const onClearWallpaper=async ()=>{
	formWallPaper.photo=""
	formWallPaper.uploadUriId=""
	let res=await apiUser.setWallpaper({})
	if(res?.code==0) {
		desktop.setBackgroundImage(res.data.path)
	}
}

onBeforeMount(()=>{
	getSetting()
})
</script>

<style scoped>

</style>