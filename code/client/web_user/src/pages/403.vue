<template>
    <div class="flex flex-col justify-center items-center" style="height:100%;">
        <img src="../assets/403.svg" />
        <div class="ml-12">
            <p class="mb-6 text-gray-700 text-4xl">抱歉 , 你没有权限 !</p>
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
    name: '403'
    meta:
        name: '403'
        level: 99
        layout: auth
</route>