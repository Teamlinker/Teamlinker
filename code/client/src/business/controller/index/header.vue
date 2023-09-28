<template>
	<a-row style="height: 60px;width: 100%;position: sticky;top:0;background-color: white;z-index: 1">
			<a-col :span="3" style="align-items: center;justify-content: center;display: flex;height: 100%">
				<span style="font-size: 24px;color: rgb(35,110,184);font-weight: bolder">
					Teamlinker
				</span>
			</a-col>
		<a-col :span="6" style="align-items: center;justify-content: left;display: flex;height: 100%">
			<a-space>
				<a-button type="text" style="color: #050505;font-size: medium" @click="emit('change','product')">
					{{$t("controller.index.home.product")}}
				</a-button>
				<a-dropdown type="text" trigger="hover">
					<a-button type="text" style="color: #050505;font-size: medium">
						{{$t("controller.index.home.resource")}}
					</a-button>
					<template #content>
						<a-doption @click="onManual">{{$t("controller.index.home.doc")}}</a-doption>
						<a-doption @click="onDocker">Docker</a-doption>
						<a-doption @click="onGithub">Github</a-doption>
					</template>
				</a-dropdown>
				<a-button type="text" style="color: #050505;font-size: medium" @click="emit('change','price')">
					{{$t("controller.index.home.price")}}
				</a-button>
			</a-space>
		</a-col>
		<a-col :span="11">

		</a-col>
		<a-col :span="4" style="align-items: center;justify-content: center;display: flex;height: 100%">
			<a-space>
				<a-button type="text" style="color: #050505;font-size: medium" @click="onLogin">
					{{$t("controller.index.home.login")}}
				</a-button>
				<a-button style="color: white;font-size: medium;background-color: #859ACC" shape="round" @click="onRegister">
					{{$t("controller.index.home.getFree")}}
				</a-button>
			</a-space>
		</a-col>
	</a-row>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const emit=defineEmits<{
	change:[name:string]
}>()
const {t}=useI18n()
const router=useRouter()
const onLogin=async () =>{
	await router.push("login")
}

const onRegister=async()=>{
	await router.push("register")
}

const onDocker=()=>{
	window.open('https://hub.docker.com/r/teamlinkeroffical/teamlinker','_blank')
}

const onGithub=()=>{
	window.open('https://github.com/teamlinker','_blank')
}

const onManual=()=>{
	window.open(t("controller.index.home.docLink"),"_blank")
}
</script>

<style scoped>

</style>