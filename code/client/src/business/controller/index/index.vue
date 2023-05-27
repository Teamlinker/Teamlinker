<template>
	<div style="width: 100%;height: 100%;overflow-x: hidden;overflow-y:auto;background-color: rgb(25,27,31)">
		<div style="height: 70px;width: 100%;display: flex;justify-content: space-between;align-items: center;padding: 0 10px;box-sizing: border-box">
			<a-space size="large">
				<h2 style="color: white;">
					Teamlinker
				</h2>
				<a-space size="large" style="padding-left: 10px">
					<a href="/"  class="title">
						Home
					</a>
					<a href="javascript:void(0)"  class="title">
						Doc
					</a>
					<a href="javascript:void(0)"  class="title">
						Resource
					</a>
					<a href="javascript:void(0)"  class="title">
						Contact
					</a>
				</a-space>
			</a-space>
			<a-space>
				<a-button size="large" type="primary" shape="round" status="success" @click="onLogin">
					Sign In
				</a-button>
				<a-button size="large" type="primary" shape="round" status="warning">
					Sign Up
				</a-button>
			</a-space>
		</div>
		<div style="color: white;text-align: center;margin-top: 100px;font-size: 50px;font-weight: bolder">
			Teamlinker : Link Every Team Easier And Faster
		</div>
		<div style="text-align: center;font-size: 30px;margin-top: 20px;color: #9373ee;font-weight: bold">
			Free , Strong , Efficient , Simple
		</div>
<!--		<div style="color: rgba(255,255,255,0.8);text-align: center;font-size: 20px;margin-top: 30px">-->
<!--			It is not only a collaboration platform,-->
<!--		</div>-->
<!--		<div style="color: rgba(255,255,255,0.8);text-align: center;font-size: 20px;margin-top: 10px">-->
<!--			but also your virtual workstation, enjoy it just like using your desktop-->
<!--		</div>-->
		<div style="display: flex;justify-content: center;margin-top: 50px">
			<a-button type="primary" size="large" status="success" shape="round" style="width: 100px;font-weight: bold">
				Try It
			</a-button>
		</div>
		<div style="display: flex;justify-content: center;margin-top: 50px;">
			<img :src="img1" style="width: 70%;border-radius: 5px">
		</div>
		<div style="text-align: center;margin-top: 150px;font-size: 20px;color:  #9373ee;font-weight: bold">
			HOW IT WORKS
		</div>
		<div style="color: white;font-weight: bold;text-align: center;font-size: 30px;margin-top: 80px">
			One Platform,One Piece Of Data,Resolve Basic Online Work Flow
		</div>
		<div style="color: rgba(255,255,255,0.8);text-align: center;font-size: 20px;margin-top: 30px">
			Teamlinker is a team collaboration solution for enterprise users,
		</div>
		<div style="color: rgba(255,255,255,0.8);text-align: center;font-size: 20px;margin-top: 10px">
			which allows team members to achieve remote office and collaboration
		</div>
		<div style="display: flex;margin-top: 80px;padding:0 100px">
			<div style="flex: 1 1 30%;padding-left: 130px">
				<h1 style="color: orangered;margin-left: 25px">Project</h1>
				<div style="color: rgba(255,255,255,0.8);font-size: 20px">
					<ul class="li">
						<li>
							Any workflow can be edited in a graphic way
						</li>
						<li>
							Users can create their own issue types
						</li>
						<li>
							Users can get started without any configuration
						</li>
					</ul>
				</div>
			</div>
			<div style="flex: 1 1 70%;padding-left: 100px">
				<img :src="img1" style="width: 80%;border-radius: 5px">
			</div>
		</div>
		<div style="display: flex;margin-top: 100px;border-top: 1px solid rgba(255,255,255,0.3);padding:100px 100px 0 100px">
			<div style="flex: 1 1 70%;display: flex;justify-content: center">
				<img :src="img1" style="width: 80%;border-radius: 5px">
			</div>
			<div style="flex: 1 1 30%;padding-right: 130px">
				<h1 style="color: orange;margin-left: 25px">Wiki</h1>
				<div style="color: rgba(255,255,255,0.8);font-size: 20px">
					<ul class="li">
						<li>
							Can record daily work
						</li>
						<li>
							It can deeply integrate modules such as issue and calendar
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div style="display: flex;margin-top: 100px;border-top: 1px solid rgba(255,255,255,0.3);;padding:100px 100px 0 100px">
			<div style="flex: 1 1 30%;padding-left: 130px">
				<h1 style="color: deepskyblue;margin-left: 25px">Calendar</h1>
				<div style="color: rgba(255,255,255,0.8);font-size: 20px">
					<ul class="li">
						<li>
							You can freely switch between different calendar types
						</li>
						<li>
							One-button meeting
						</li>
						<li>
							Create conference room management for real conference rooms
						</li>
					</ul>
				</div>
			</div>
			<div style="flex: 1 1 70%;;padding-left: 100px">
				<img :src="img1" style="width: 80%;border-radius: 5px">
			</div>
		</div>
		<div style="display: flex;margin-top: 100px;border-top: 1px solid rgba(255,255,255,0.3);;padding:100px 100px 0 100px">
			<div style="flex: 1 1 70%;display: flex;justify-content: center">
				<img :src="img1" style="width: 80%;border-radius: 5px">
			</div>
			<div style="flex: 1 1 30%;padding-right: 130px">
				<h1 style="color: lightseagreen;margin-left: 25px">IM</h1>
				<div style="color: rgba(255,255,255,0.8);font-size: 20px">
					<ul class="li">
						<li>
							All members in the company can be directly contacted
						</li>
						<li>
							Member status is online, meeting, offline, do not disturb
						</li>
					</ul>
				</div>
			</div>
		</div>
		<div style="display: flex;margin-top: 100px;border-top: 1px solid rgba(255,255,255,0.3);;padding:100px 100px 0 100px">
			<div style="flex: 1 1 30%;padding-left: 130px">
				<h1 style="color: mediumpurple;margin-left: 25px">Meeting</h1>
				<div style="color: rgba(255,255,255,0.8);font-size: 20px">
					<ul class="li">
						<li>
							Voice, video, desktop share. Everything is on the web
						</li>
						<li>
							Meeting can be recorded as a video and saved
						</li>
					</ul>
				</div>
			</div>
			<div style="flex: 1 1 70%;padding-left: 100px">
				<img :src="img1" style="width: 80%;border-radius: 5px">
			</div>
		</div>
		<div style="text-align: center;margin-top: 150px;font-size: 40px;color:  #9373ee;font-weight: bold">
			You Are In Good Company
		</div>
		<div style="text-align: center;color: gray;margin-top: 30px;font-size: 20px">
			A wide variety of institutions and organizations across the world have adopted Teamlinker as their virtual workstation.
		</div>
		<div style="display: flex;justify-content: center;margin-top: 50px;border-bottom: 1px solid rgba(255,255,255,0.3);padding-bottom: 150px">
			<Company></Company>
		</div>
		<p style="color: white;text-align: center">©           2016-2023 合肥阿尔方斯科技有限公司 <a href="https://beian.miit.gov.cn/" style="color: white" target="_blank">皖ICP备2023006742号</a></p>
	</div>
</template>

<script setup lang="ts">
import img1 from "../../../assert/index_sample.png"
import Company from "./company.vue";
import {useRouter} from "vue-router";

const router=useRouter()
const onLogin=async () =>{
	await router.push("login")
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
</style>