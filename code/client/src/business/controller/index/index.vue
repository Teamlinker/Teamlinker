<template>
	<div style="width: 100%;height: 100%;overflow-x: hidden;overflow-y:auto;" v-if="$deployMode.value!==ECommon_Application_Mode.OFFLINE" ref="root" @scroll="onScroll">
		<Header ref="header" @change="onChange"></Header>
		<div style="min-height: calc(100vh - 140px);width: 100%">
			<transition>
				<component :is="comp"></component>
			</transition>
		</div>
		<Footer @change="onChange"></Footer>
	</div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {ECommon_Application_Mode} from "../../../../../common/types";
import Header from "@/business/controller/index/header.vue";
import Footer from "@/business/controller/index/footer.vue";
import {markRaw, ref} from "vue";
import IndexHome from "@/business/controller/index/indexHome.vue";
import Price from "@/business/controller/index/price.vue";

const comp=ref(markRaw(IndexHome))

const router=useRouter()
const root=ref<HTMLElement>()
const header=ref()
const onChange=(name:string)=>{
	if(name==="product") {
		comp.value=markRaw(IndexHome)
	} else if(name==="price") {
		comp.value=markRaw(Price)
	}
}

const onScroll=()=>{
	if(root.value.scrollTop>10) {
		header.value.$el.style.borderBottom="1px solid lightgray"
	} else {
		header.value.$el.style.borderBottom=""
	}
}
</script>

<style scoped>
.title {
	text-decoration:none;
	color: white;
	font-weight: bold;
	font-size: 16px
}
.title:hover {
	color: #9373ee;
}
.li li:not(:first-child) {
	margin-top: 50px;
}
.li li:first-child {
	margin-top: 50px;
}
.li {
	font-weight: bold;
}
.v-enter-active,
.v-leave-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>