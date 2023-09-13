<template>
	<div style="height: 80px;border-top: 1px lightgrey solid;box-sizing: border-box;display: flex;flex-direction: column;align-items: center;justify-content: space-around">
		<a-space size="large">
			<a-select size="mini" style="width: 100px" v-model="language">
				<a-option value="zh">简体中文</a-option>
				<a-option value="en">English</a-option>
			</a-select>
			<span style="font-size: medium">
				{{$t("controller.index.footer.contactUs")}}:teamlinkeronline@gmail.com
			</span>
		</a-space>
		<a-space>
			© 2022-2023 {{$t("controller.index.footer.company")}}&nbsp;
			<a href="https://beian.miit.gov.cn/" target="_blank" v-if="language==='zh'">皖ICP备2023006742号</a>
		</a-space>
	</div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

const getLang=()=>{
	let lang=localStorage.getItem("lang")
	if(lang) {
		if(lang==="zh") {
			return "zh"
		} else {
			return "en"
		}
	} else {
		let lang=(navigator.language || "en").toLowerCase().split("-")[0]
		if(lang==="zh") {
			return "zh"
		} else {
			return "en"
		}
	}
}
const language=ref(getLang())
watch(language,()=>{
	localStorage.setItem("lang",language.value)
	location.reload()
})
</script>

<style scoped>

</style>