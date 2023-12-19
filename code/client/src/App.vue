<template>
  <a-config-provider :locale="lang">
    <router-view></router-view>
  </a-config-provider>
</template>

<script setup lang="ts">
import enUS from '@arco-design/web-vue/es/locale/lang/en-us'
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
import {computed} from "vue";

const lang=computed(()=>{
	let lang=localStorage.getItem("lang")
	if(lang) {
		if(lang==="zh") {
			return zhCN
		} else {
			return enUS
		}
	} else {
		let lang=(navigator.language || "en").toLowerCase().split("-")[0]
		if(lang==="zh") {
			return zhCN
		} else {
			return enUS
		}
	}
})
</script>

<style scoped>

</style>
