<template>
	<div style="position: absolute;z-index: 10001;top: 0px;left: 0px;width: 100%;height: 100%;backdrop-filter: blur(15px);background-color: rgba(0,0,0,0.6);display: flex;justify-content: space-evenly;flex-wrap: wrap" @click="emit('close')" id="application">
		<IconItem v-for="(item,index) in iconList" :index="index" :item="item" :key="item.id" :id="item.meta+'Icon'" style="width: 20%;display: flex;justify-content: center;align-items: center;" :scale="2"></IconItem>
	</div>
</template>

<script setup lang="ts">
import IconItem from "@/teamOS/icon/iconItem.vue";
import {iconManager} from "@/teamOS/icon/iconManager";

const emit=defineEmits<{
	close:[]
}>()
let iconList=iconManager.getList();
</script>

<style scoped>

</style>