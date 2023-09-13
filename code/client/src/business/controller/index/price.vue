<template>
	<div style="display: flex;align-items: center;flex-direction: column">
		<a-row style="width: 100%;margin-top: 100px;font-weight: bold;font-size: 3rem" justify="center">
			{{$t("controller.index.home.price")}}
		</a-row>
		<div style="margin-top: 100px;display: flex;justify-content: space-evenly;gap: 150px">
			<div style="width: 20vw;height: 400px;overflow: hidden;border-radius: 10px;border: 1px solid lightgrey;box-shadow: rgba(22, 14, 46, 0.02) 0px 0px 40px, rgba(22, 14, 35, 0.06) 0px 0px 100px">
				<div style="height: 200px;background: linear-gradient(90deg,#4776e6,#8e54e9),linear-gradient(90deg,#ff6b6b 66.15%,#fd71af);display: flex;flex-direction: column;align-items: center">
					<h1 style="color: white">{{$t("util.free")}}</h1>
					<h2 style="color: white">{{$t("controller.index.price.onlineEdition")}}</h2>
					<a-button style="background-color: white;color: rgb(94, 121, 190);margin-top: 20px;font-weight: bold" @click="onRegister">
						{{$t("controller.index.home.section5.3")}}
					</a-button>
				</div>
				<div style="height: 200px;color: dimgrey">
					<a-list :bordered="false" size="medium">
						<a-list-item>
							{{$t("controller.index.price.1")}}
							<template #actions>
								<icon-check style="color: green"></icon-check>
							</template>
						</a-list-item>
						<a-list-item>
							{{$t("controller.index.price.2")}}
							<template #actions>
								<icon-check style="color: green"></icon-check>
							</template>
						</a-list-item>
						<a-list-item>
							{{$t("controller.index.price.3")}}
							<template #actions>
								<icon-check style="color: green"></icon-check>
							</template>
						</a-list-item>
						<a-list-item>
							{{$t("controller.index.price.4")}}
							<template #actions>
								5 MB
							</template>
						</a-list-item>
					</a-list>
				</div>
			</div>
			<div style="width: 20vw;height: 400px;overflow: hidden;border-radius: 10px;border: 1px solid lightgrey;box-shadow: rgba(22, 14, 45, 0.02) 0px 0px 40px, rgba(22, 14, 45, 0.06) 0px 0px 104px">
				<div style="height: 200px;background: linear-gradient(90deg,#e0eafd,#cfdef2);display: flex;flex-direction: column;align-items: center">
					<h1 style="color: #333333">{{$t("util.free")}}</h1>
					<h2 style="color: #333333">{{$t("controller.index.price.offlineEdition")}}</h2>
					<a-button style="background-color: white;color: #333333;margin-top: 20px;font-weight: bold">
						{{$t("controller.index.home.section5.4")}}
					</a-button>
				</div>
				<div style="height: 200px;color: dimgrey">
					<a-list :bordered="false" size="medium">
						<a-list-item>
							{{$t("controller.index.price.1")}}
							<template #actions>
								<icon-check style="color: green"></icon-check>
							</template>
						</a-list-item>
						<a-list-item>
							{{$t("controller.index.price.2")}}
							<template #actions>
								<icon-check style="color: green"></icon-check>
							</template>
						</a-list-item>
						<a-list-item>
							{{$t("controller.index.price.3")}}
							<template #actions>
								<icon-check style="color: green"></icon-check>
							</template>
						</a-list-item>
						<a-list-item>
							{{$t("controller.index.price.5")}}
							<template #actions>
								<icon-check style="color: green"></icon-check>
							</template>
						</a-list-item>
					</a-list>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";

const router=useRouter()
const onRegister=async()=>{
	await router.push("register")
}
</script>

<style scoped>

</style>