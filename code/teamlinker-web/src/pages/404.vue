<template>
    <div class="flex flex-col justify-center items-center h-screen w-screen" style="height:100%;">
        <img src='../assets/404.svg' style="flex:1 1 1" />

        <div class="ml-12" style="flex: 1 1 1">
            <p class="mb-6 text-gray-700 text-4xl">抱歉 , 页面丢失了 .</p>
            <a-button class="px-12" @click="back">返回</a-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getCurrentInstance } from 'vue'
let { proxy } = getCurrentInstance()
const back = function() {
    proxy.$router.back()
}
</script>
<route lang="yaml">
    meta:
        layout: layouts
</route>