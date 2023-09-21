<template>
	<div style="padding: 0 15vw;box-sizing: border-box">
		<a-row style="width: 100%">
			<a-col :span="12" style="display: flex;align-items: center;flex-direction: column;box-sizing: border-box;padding-top: 10%;line-height: 1.1">
				<span style="font-size: 4.5rem;font-weight: bold;" class="animation1">{{$t("controller.index.home.section1.1")}}</span>
				<span style="font-size: 4.5rem;font-weight: bold" class="animation2">
					<span style="color: #54A2C0">{{$t("controller.index.home.section1.2")}}</span>&nbsp;&nbsp;
					<span style="color: #54C0AD">{{$t("controller.index.home.section1.3")}}</span>
				</span>
				<span style="font-size: 4.5rem;font-weight: bold" class="animation3">
					{{$t("controller.index.home.section1.4")}}&nbsp;&nbsp;
					<span style="color: #8088CE">{{$t("controller.index.home.section1.5")}}</span>
				</span>
				<span style="font-size: 2rem;margin-top:40px">
					{{$t("controller.index.home.section1.6")}}
				</span>
				<span style="color: #666666;margin-top: 20px;padding: 0 10%;font-size: 1.2rem;text-align: center">
					{{$t("controller.index.home.section1.7")}}
				</span>
				<a-button style="color: white;font-size: medium;background-color:rgb(50,164,196);font-weight: bold;margin-top: 20px" shape="round" @click="onRegister">
					{{$t("controller.index.home.getFree")}}&nbsp;
					<icon-arrow-right style="margin-top: 1px;"></icon-arrow-right>
				</a-button>
			</a-col>
			<a-col :span="12">
				<img :src="indexFirst" style="width: 100%;aspect-ratio: auto">
			</a-col>
		</a-row>
		<a-row style="width: 100%">
			<a-col :span="12">
				<img :src="index1" style="width: 90%;aspect-ratio: auto">
			</a-col>
			<a-col :span="12" style="display: flex;align-items: center;flex-direction: column;box-sizing: border-box;padding-top: 8%;line-height: 1.2">
				<span style="font-size: 3rem;font-weight: bold;color: #5E79BE">{{$t("controller.index.home.section2.1")}}</span>
				<span style="font-size: 2rem;color: #333333;margin-top:40px">{{$t("controller.index.home.section2.2")}}</span>
				<span style="font-size: 2rem;color: #333333;margin-top: 5px">{{$t("controller.index.home.section2.3")}}</span>
				<span style="font-size: 1.2rem;color: #455e83;margin-top: 40px;padding: 0px 20%;text-align: center">
					{{$t("controller.index.home.section2.4")}}
				</span>
				<a-space wrap size="large" style="margin-top: 50px">
					<img :src="projectLogo"/>
					<img :src="wikiLogo"/>
					<img :src="calendarLogo"/>
					<img :src="IMLogo"/>
					<img :src="fileLogo"/>
					<img :src="meetingLogo"/>
				</a-space>
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-col :span="8" style="display: flex;flex-direction: column;box-sizing: border-box;padding-left: 8%">
				<span style="color: #434A88;font-weight: bold;font-size: 1.2rem">
					{{$t("util.project")}}
				</span>
				<ul style="color: #333333;font-size: 1.2rem;line-height: 2">
					<li>{{$t("controller.index.home.project.1")}}</li>
					<li>{{$t("controller.index.home.project.2")}}</li>
					<li>{{$t("controller.index.home.project.3")}}</li>
					<li>{{$t("controller.index.home.project.4")}}</li>
				</ul>
				<a href="javascript:void(0)" style="color: #434A88;font-size: 1rem;padding-left: 25px;text-decoration:none;" @click="onLogin">{{$t("util.explore")}} -></a>
				<img :src="exampleProjectRemark" style="width: 60%;aspect-ratio: auto;margin-top: 20px">
			</a-col>
			<a-col :span="16">
				<a-carousel style="width: 100%;aspect-ratio: 1/0.61;z-index: -1;overflow: hidden" :auto-play="true" indicator-type="line" show-arrow="hover" class="img">
					<a-carousel-item>
						<img :src="exampleProject1" style="width: 100%;aspect-ratio: auto;border-radius: 10px">
					</a-carousel-item>
					<a-carousel-item>
						<img :src="exampleProject2" style="width: 100%;aspect-ratio: auto;border-radius: 10px">
					</a-carousel-item>
					<a-carousel-item>
						<img :src="exampleProject3" style="width: 100%;aspect-ratio: auto;border-radius: 10px">
					</a-carousel-item>
				</a-carousel>
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-col :span="8" style="display: flex;flex-direction: column;box-sizing: border-box;padding-left: 8%">
				<span style="color: #815477;font-weight: bold;font-size: 1.2rem">
					{{$t("util.wiki")}}
				</span>
				<ul style="color: #333333;font-size: 1.2rem;line-height: 2">
					<li>{{$t("controller.index.home.wiki.1")}}</li>
					<li>{{$t("controller.index.home.wiki.2")}}</li>
					<li>{{$t("controller.index.home.wiki.3")}}</li>
					<li>{{$t("controller.index.home.wiki.4")}}</li>
				</ul>
				<a href="javascript:void(0)" style="color: #815477;font-size: 1rem;padding-left: 25px;text-decoration: none" @click="onLogin">{{$t("util.explore")}} -></a>
				<img :src="exampleWikiRemark" style="width: 60%;aspect-ratio: auto;margin-top: 20px">
			</a-col>
			<a-col :span="16">
				<img :src="exampleWiki1" style="width: 100%;aspect-ratio: auto;" class="img">
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-col :span="8" style="display: flex;flex-direction: column;box-sizing: border-box;padding-left: 8%">
				<span style="color: #455e83;font-weight: bold;font-size: 1.2rem">
					{{$t("util.calendar")}}
				</span>
				<ul style="color: #333333;font-size: 1.2rem;line-height: 2">
					<li>{{$t("controller.index.home.calendar.1")}}</li>
					<li>{{$t("controller.index.home.calendar.2")}}</li>
					<li>{{$t("controller.index.home.calendar.3")}}</li>
					<li>{{$t("controller.index.home.calendar.4")}}</li>
				</ul>
				<a href="javascript:void(0)" style="color: #455e83;font-size: 1rem;padding-left: 25px;text-decoration: none" @click="onLogin">{{$t("util.explore")}} -></a>
				<img :src="exampleCalendarRemark" style="width: 60%;aspect-ratio: auto;margin-top: 20px">
			</a-col>
			<a-col :span="16">
				<a-carousel style="width: 100%;aspect-ratio: 1/0.61;z-index: -1" :auto-play="true" indicator-type="line" show-arrow="hover" class="img">
					<a-carousel-item>
						<img :src="exampleCalendar1" style="width: 100%;aspect-ratio: auto;border-radius: 10px">
					</a-carousel-item>
					<a-carousel-item>
						<img :src="exampleCalendar2" style="width: 100%;aspect-ratio: auto;border-radius: 10px">
					</a-carousel-item>
				</a-carousel>
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-col :span="8" style="display: flex;flex-direction: column;box-sizing: border-box;padding-left: 8%">
				<span style="color: #815477;font-weight: bold;font-size: 1.2rem">
					{{$t("util.meeting")}}
				</span>
				<ul style="color: #333333;font-size: 1.2rem;line-height: 2">
					<li>{{$t("controller.index.home.meeting.1")}}</li>
					<li>{{$t("controller.index.home.meeting.2")}}</li>
					<li>{{$t("controller.index.home.meeting.3")}}</li>
					<li>{{$t("controller.index.home.meeting.4")}}</li>
				</ul>
				<a href="javascript:void(0)" style="color: #815477;font-size: 1rem;padding-left: 25px;text-decoration: none" @click="onLogin">{{$t("util.explore")}} -></a>
				<img :src="exampleMeetingRemark" style="width: 60%;aspect-ratio: auto;margin-top: 20px">
			</a-col>
			<a-col :span="16">
				<img :src="exampleMeeting1" style="width: 100%;aspect-ratio: auto;" class="img">
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-col :span="12" style="display: flex;align-items: center;flex-direction: column;box-sizing: border-box;padding-top: 10%;line-height: 1.2;padding-left: 8%">
				<span style="font-size: 3rem;font-weight: bold;color: #5E79BE">
					{{$t("controller.index.home.section3.1")}}
				</span>
				<span style="font-size: 2rem;color: #455e83;margin-top: 40px;text-align: center">
					{{$t("controller.index.home.section3.2")}}
				</span>
				<span style="font-size: 2rem;color: #455e83;margin-top: 20px;text-align: center">
					{{$t("controller.index.home.section3.3")}}
				</span>
				<span style="font-size: 1.2rem;color: #455e83;margin-top: 40px;text-align: center">
					{{$t("controller.index.home.section3.4")}}
				</span>
				<a-button style="color: white;font-size: medium;background-color:rgb(50,164,196);margin-top: 30px;font-weight: bold" shape="round" @click="onRegister">
					{{$t("controller.index.home.getDockerEdition")}}
				</a-button>
			</a-col>
			<a-col :span="12">
				<img :src="index2" style="width: 90%;aspect-ratio: auto">
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-col :span="18" style="padding-left: 8%;box-sizing: border-box">
				<a-carousel style="width: 100%;aspect-ratio: 1/0.61;z-index: -1" :auto-play="true" indicator-type="line" show-arrow="hover" class="img">
					<a-carousel-item>
						<img :src="exampleIM1" style="width: 100%;aspect-ratio: auto;border-radius: 10px">
					</a-carousel-item>
					<a-carousel-item>
						<img :src="exampleIM2" style="width: 100%;aspect-ratio: auto;border-radius: 10px">
					</a-carousel-item>
				</a-carousel>
			</a-col>
			<a-col :span="6" style="display: flex;flex-direction: column;box-sizing: border-box;padding-left: 3%">
				<span style="color: #e1111f;font-weight: bold;font-size: 1.2rem">
					{{$t("util.im")}}
				</span>
				<ul style="color: #333333;font-size: 1.2rem;line-height: 2">
					<li>{{$t("controller.index.home.im.1")}}</li>
					<li>{{$t("controller.index.home.im.2")}}</li>
					<li>{{$t("controller.index.home.im.3")}}</li>
					<li>{{$t("controller.index.home.im.4")}}</li>
				</ul>
				<a href="javascript:void(0)" style="color: #e1111f;font-size: 1rem;padding-left: 25px;text-decoration: none" @click="onLogin">{{$t("util.explore")}} -></a>
				<img :src="exampleIMRemark" style="width: 60%;aspect-ratio: auto;margin-top: 20px">
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-col :span="18" style="padding-left: 8%;box-sizing: border-box">
				<img :src="exampleFinder1" style="width: 100%;aspect-ratio: auto;" class="img">
			</a-col>
			<a-col :span="6" style="display: flex;flex-direction: column;box-sizing: border-box;padding-left: 3%">
				<span style="color: #5561e3;font-weight: bold;font-size: 1.2rem">
					{{$t("util.finder")}}
				</span>
				<ul style="color: #333333;font-size: 1.2rem;line-height: 2">
					<li>{{$t("controller.index.home.finder.1")}}</li>
					<li>{{$t("controller.index.home.finder.2")}}</li>
					<li>{{$t("controller.index.home.finder.3")}}</li>
					<li>{{$t("controller.index.home.finder.4")}}</li>
				</ul>
				<a href="javascript:void(0)" style="color: #5561e3;font-size: 1rem;padding-left: 25px;text-decoration: none" @click="onLogin">{{$t("util.explore")}} -></a>
				<img :src="exampleFinderRemark" style="width: 60%;aspect-ratio: auto;margin-top: 20px">
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-col :span="18" style="padding-left: 8%;box-sizing: border-box">
				<img :src="exampleSystem1" style="width: 100%;aspect-ratio: auto;" class="img">
			</a-col>
			<a-col :span="6" style="display: flex;flex-direction: column;box-sizing: border-box;padding-left: 3%">
				<span style="color: #326f53;font-weight: bold;font-size: 1.2rem">
					{{$t("util.system")}}
				</span>
				<ul style="color: #333333;font-size: 1.2rem;line-height: 2">
					<li>{{$t("controller.index.home.system.1")}}</li>
					<li>{{$t("controller.index.home.system.2")}}</li>
					<li>{{$t("controller.index.home.system.3")}}</li>
					<li>{{$t("controller.index.home.system.4")}}</li>
				</ul>
				<a href="javascript:void(0)" style="color: #326f53;font-size: 1rem;padding-left: 25px;text-decoration: none" @click="onLogin">{{$t("util.explore")}} -></a>
				<img :src="exampleSystemRemark" style="width: 60%;aspect-ratio: auto;margin-top: 20px">
			</a-col>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-row style="width: 100%;justify-content: center;font-size: 2rem;font-weight: bold;color: rgb(0, 5, 61)">
				{{$t("controller.index.home.section4.1")}}
			</a-row>
			<a-row style="width: 100%;margin-top: 40px;justify-content: space-evenly;gap: 20px;">
				<div style="aspect-ratio: 1/1;background-color: rgb(247,247,247);flex: 1 1 0px;border-radius: 10px;display: flex;align-items: center;flex-direction: column">
					<a-avatar :image-url="avatar1" :size="64" style="margin-top: 25%"></a-avatar>
					<span style="font-weight: bold;font-size: large;margin-top: 20px">Leo Zheng</span>
					<span style="color:dimgrey;font-size: medium;margin-top: 20px;text-align: center;padding: 0 20px">
						{{$t("controller.index.home.section4.2")}}
					</span>
				</div>
				<div style="aspect-ratio: 1/1;background-color: rgb(247,247,247);flex: 1 1 0px;border-radius: 10px;display: flex;align-items: center;flex-direction: column">
					<a-avatar :image-url="avatar2" :size="64" style="margin-top: 25%"></a-avatar>
					<span style="font-weight: bold;font-size: large;margin-top: 20px">Sandra Ryan</span>
					<span style="color:dimgrey;font-size: medium;margin-top: 20px;text-align: center;padding: 0 20px">
						{{$t("controller.index.home.section4.3")}}
					</span>
				</div>
				<div style="aspect-ratio: 1/1;background-color: rgb(247,247,247);flex: 1 1 0px;border-radius: 10px;display: flex;align-items: center;flex-direction: column">
					<a-avatar :image-url="avatar3" :size="64" style="margin-top: 25%"></a-avatar>
					<span style="font-weight: bold;font-size: large;margin-top: 20px">Simon Wilson</span>
					<span style="color:dimgrey;font-size: medium;margin-top: 20px;text-align: center;padding: 0 20px">
						{{$t("controller.index.home.section4.4")}}
					</span>
				</div>
			</a-row>
		</a-row>
		<a-row style="width: 100%;margin-top: 100px">
			<a-row style="width: 100%;justify-content: center;font-size: 2.5rem;font-weight: bold;color: rgb(0, 5, 61)">
				{{$t("controller.index.home.section5.1")}}
			</a-row>
			<a-row style="width: 100%;justify-content: center;margin-top: 20px;font-size: 1rem">
				{{$t("controller.index.home.section5.2")}}
			</a-row>
			<a-row style="width: 100%;justify-content: center;margin-top: 20px;">
				<a-space size="large">
					<a-button style="background-color: rgb(94, 121, 190);color: white" @click="onRegister">
						{{$t("controller.index.home.section5.3")}}
					</a-button>
					<a-button style="color :rgb(94, 121, 190)">
						{{$t("controller.index.home.section5.4")}}
					</a-button>
				</a-space>
			</a-row>
			<a-row style="width: 100%;justify-content: center;margin-top: 50px;">
				<img :src="indexLast" style="width: 35%;aspect-ratio: auto;">
			</a-row>
		</a-row>
	</div>
</template>

<script setup lang="ts">
import indexFirst from "@/assert/indexFirst.png"
import index1 from "@/assert/index1.png"
import exampleProject1 from "@/assert/exampleProject1.png"
import exampleProject2 from "@/assert/exampleProject2.png"
import exampleProject3 from "@/assert/exampleProject3.png"
import exampleWiki1 from "@/assert/exampleWiki1.png"
import exampleCalendar1 from "@/assert/exampleCalendar1.png"
import exampleCalendar2 from "@/assert/exampleCalendar2.png"
import exampleIM1 from "@/assert/exampleIM1.png"
import exampleIM2 from "@/assert/exampleIM2.png"
import index2 from "@/assert/index2.png"
import exampleProjectRemark from "@/assert/exampleProjectRemark.png"
import exampleWikiRemark from "@/assert/exampleWikiRemark.png"
import exampleCalendarRemark from "@/assert/exampleCalendarRemark.png"
import exampleMeetingRemark from "@/assert/exampleMeetingRemark.png"
import exampleIMRemark from "@/assert/exampleIMRemark.png"
import exampleMeeting1 from "@/assert/exampleMeeting1.png"
import exampleFinderRemark from "@/assert/exampleFinderRemark.png"
import exampleFinder1 from "@/assert/exampleFinder1.png"
import exampleSystemRemark from "@/assert/exampleSystemRemark.png"
import exampleSystem1 from "@/assert/exampleSystem1.png"
import avatar1 from "@/assert/avatar1.png"
import avatar2 from "@/assert/avatar2.jpg"
import avatar3 from "@/assert/avatar3.jpg"
import indexLast from "@/assert/indexLast.png"
import {useRouter} from "vue-router";
import projectLogo from "@/assert/custom/project.svg"
import wikiLogo from "@/assert/custom/wiki_space_item.svg"
import IMLogo from "@/assert/custom/message.svg"
import meetingLogo from "@/assert/custom/video.svg"
import calendarLogo from "@/assert/custom/calendar.svg"
import fileLogo from "@/assert/custom/file.svg"

const router=useRouter()

const onLogin=async () =>{
	await router.push("login")
}

const onRegister=async()=>{
	await router.push("register")
}
</script>

<style scoped>
.img {
	box-shadow: 0px 36px 89px rgb(0 0 0/4%),0px 23.3333px 52.1227px rgba(0,0,0,.03),0px 13.8667px 28.3481px rgba(0,0,0,.024),0px 7.2px 14.4625px rgb(0 0 0/2%),0px 2.93333px 7.25185px rgba(0,0,0,.016),0px 0.666667px 3.50231px rgba(0,0,0,.01);
	border-radius: 10px;
	border:solid 1px rgba(0,0,0,0.1)
}
:deep .arco-carousel-indicator-wrapper-bottom,.arco-carousel-horizontal {
	border-radius: 10px;
}
.animation1 {
	animation: fadeInAnimation ease 3s;
	animation-iteration-count: 1;
	animation-fill-mode: forwards;
	opacity: 0;
	z-index: -1;
}
.animation2 {
	animation: fadeInAnimation ease 3s;
	animation-delay: 1s;
	animation-iteration-count: 1;
	animation-fill-mode: forwards;
	opacity: 0;
	z-index: -1;
}
.animation3 {
	animation: fadeInAnimation ease 3s;
	animation-delay: 2s;
	animation-iteration-count: 1;
	animation-fill-mode: forwards;
	opacity: 0;
	z-index: -1;
}
@keyframes fadeInAnimation {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
</style>