<template>

</template>

<script setup lang="ts">
import {apiUser} from "@/business/common/request/request";

const request=async (code:string)=>{
	let res=await apiUser.wechatCode({
		code:code
	})
	if(res?.code==0) {
		window.opener.postMessage(res.data.openId)
		window.close()
	}
}
let query=location.hash.substring(location.hash.indexOf("?")+1)
let map:{
	[key:string]:string
}={}
for(let obj of query.split("&")) {
	let arr=obj.split("=")
	map[arr[0]]=arr[1]
}
request(map["code"])
</script>

<style scoped>

</style>