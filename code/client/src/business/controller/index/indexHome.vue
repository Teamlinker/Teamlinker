<template>
  <!--banner-->
  <div style="box-sizing: border-box">
    <div style="width: 80%;margin: 0px 12%;margin-bottom: 4.5rem;margin-top:2rem;display: flex;">
          <div v-if="language==='zh'" style="margin-top: 39px;width: 50%">
            <div  style="font-size: 5rem;font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;font-weight: 400;color: #000000;line-height: 7.75rem;">
              {{$t("controller.index.home.banner1")}}
            </div>
            <div>
              <div style="font-size: 5rem;font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;font-weight: bold;color: #000000;line-height: 7.75rem;">{{$t("controller.index.home.banner2")}}</div>
            </div>
            <div class="aiIntro">{{$t("controller.index.home.aiIntro")}}</div>
            <a-button style="width:15rem;height:3.75rem;font-size: 1.375rem;font-family: PingFangSC, PingFang SC;font-weight: 500;color: #FFFFFF;line-height: 1.875rem;background: #2864FF;margin-top: 3.125rem" @click="onRegister">{{$t("controller.index.home.started")}} →</a-button>
          </div>
          <div v-else="language==='en'" style="width: 50%">
            <div>
              <img :src="allInOne" style="width:95%;aspect-ratio: auto;margin-bottom: 20px"/>
            </div>
            <div class="aiIntro2">{{$t("controller.index.home.aiIntro")}}</div>
            <a-button style="width:15rem;height:3.75rem;font-size: 1.375rem;font-family: PingFangSC, PingFang SC;font-weight: 500;color: #FFFFFF;line-height: 1.875rem;background: #2864FF;margin-top: 3.125rem" @click="onRegister">{{$t("controller.index.home.started")}} →</a-button>
          </div>
          <div style="width: 50%;">
            <img :src="indexFirst2" style="width:90%;aspect-ratio: auto">
          </div>
    </div>
  </div>

  <!--项目-->
  <div style="box-sizing: border-box;height: 830px;">
    <div class="projectBox">
      <div style="margin: 0px auto; text-align: center;position: relative">
        <div v-if="language==='zh'">
          <div class="projectT1" style="position: relative;z-index: 2;">{{$t("controller.index.home.projectList.10")}}</div>
          <div class="projectLine">&nbsp;</div>
        </div>
        <div v-else="language==='en'">
          <img :src="platform"/>
          <!--<div class="projectT12">{{$t("controller.index.home.projectList.10")}}</div>
          <div class="projectT12">
            {{$t("controller.index.home.projectList.11")}}{{$t("controller.index.home.projectList.12")}}
          </div>-->
          <!--<div class="projectLine" style="top: 134px;left: 62.3%">&nbsp;</div>-->
        </div>
        <div class="projectT2">{{$t("controller.index.home.projectList.1")}}</div>
      </div>
      <div class="systemBox">
        <ul class="systemList">
          <li style="margin-bottom: 65px">
            <div><img :src="projectLogo2"/></div>
            <div class="systemT1" v-if="language==='zh'">
              {{$t("controller.index.home.projectList.2")}}
            </div>
            <div class="systemT1" style="height: 5rem" v-else="language==='en'">
              {{$t("controller.index.home.projectList.2")}}<br/>
              {{$t("controller.index.home.projectList.13")}}
            </div>
          </li>
          <li style="margin-bottom: 65px">
            <div><img :src="meetingLogo2"/></div>
            <div class="systemT1" style="height: 5rem">{{$t("controller.index.home.projectList.3")}}</div>
          </li>
          <li style="margin-bottom: 65px">
            <div><img :src="IMLogo2"/></div>
            <div class="systemT1" style="height: 5rem">{{$t("controller.index.home.projectList.4")}}</div>
          </li>
          <li style="margin-bottom: 65px">
            <div><img :src="calendarLogo2"/></div>
            <div class="systemT1" style="height: 5rem">{{$t("controller.index.home.projectList.5")}}</div>
          </li>
          <li>
            <div><img :src="fileLogo2"/></div>
            <div class="systemT1" style="height: 5rem">{{$t("controller.index.home.projectList.6")}}</div>
          </li>
          <li>
            <div><img :src="tableLogo"/></div>
            <div class="systemT1" style="height: 5rem">{{$t("controller.index.home.projectList.7")}}</div>
          </li>
          <li>
            <div><img :src="wikiLogo2"/></div>
            <div class="systemT1" style="height: 5rem">{{$t("controller.index.home.projectList.8")}}</div>
          </li>
          <li>
            <div><img :src="whiteBoardLogo"/></div>
            <div class="systemT1" style="height: 5rem">{{$t("controller.index.home.projectList.9")}}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!--AI-->
  <div style="box-sizing: border-box;padding-top: 6.6rem;margin-bottom: 64px;overflow: hidden;margin-top: 100px">
    <div style="height: 3rem;" v-if="language==='en'"></div>
    <a-row style="width: 100%;margin: 0px auto;">
      <a-col :span="12">
        <div class="aiL" style="margin-right:5%;margin-left: 15%;width: 80%;" v-if="language==='zh'">
          <div class="aiTitle">
            <span>{{$t("controller.index.home.aiList.1")}}</span>
            <div style="position: relative">
              <span>{{$t("controller.index.home.aiList.2")}}</span>
              <div class="aiLine"></div>
            </div>
          </div>
          <div class="aiSubTitle">
            <div>{{$t("controller.index.home.aiList.3")}}</div>
            <div>{{$t("controller.index.home.aiList.4")}}</div>
          </div>
          <div class="aiList">
            <ul>
              <li v-for="(i,index) in aiList" :key="index">
                <a-button type="outline" class="btn"  @click="changeImage(index)" :class="{'btnActive' : index == aiIndex}">
                  {{i.title}}
                </a-button>
              </li>
            </ul>
          </div>
      </div>
        <div class="aiL" style="margin-right:5%;margin-left: 15%;margin-top:4rem;width: 80%;" v-else="language==='en'">
          <div class="aiTitle">
            <img :src="smarter" style="width: 100%; aspect-ratio: auto;"/>
          </div>
          <div class="aiSubTitle">
            <div>{{$t("controller.index.home.aiList.3")}}</div>
            <div>{{$t("controller.index.home.aiList.4")}}</div>
          </div>
          <div class="aiList">
            <ul>
              <li v-for="(i,index) in aiList" :key="index">
                <a-button type="outline" class="btn"  @click="changeImage(index)" :class="{'btnActive' : index == aiIndex}">
                  {{i.title}}
                </a-button>
              </li>
            </ul>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <img :src="currentImg" style="width: 100%;height: 41.75rem" class="aiImage"/>
      </a-col>
    </a-row>
  </div>

  <!--虚拟工位-->
  <div class="officeBox" style="margin-top: 200px">
    <div class="officeSlogan" style="margin-top: 99px" v-if="language==='zh'">
      <div class="officeTitle" style="position: relative">{{$t("controller.index.home.virtualWorkstation.1")}}<span class="officeDecoration"></span></div>
      <div class="officeTitle">{{$t("controller.index.home.virtualWorkstation.2")}}</div>
      <div class="officeSubTitle" style="margin:0px auto;margin-top: 1.375rem;margin-bottom: 5.187rem;">{{$t("controller.index.home.virtualWorkstation.3")}}</div>
    </div>
    <div class="officeSlogan" style="margin-top: 99px" v-else="language==='en'">
      <img :src="virtualWork" style="width: 60%; aspect-ratio: auto;"/>
      <div class="officeSubTitle" style="margin:0px auto;margin-top: 1.375rem;margin-bottom: 5.187rem;">
        <div>{{$t("controller.index.home.virtualWorkstation.3")}}</div>
        <div>{{$t("controller.index.home.virtualWorkstation.12")}}</div>
      </div>
    </div>

    <div style="margin: 0px 15%;margin-bottom: 7.3125rem">
      <div class="officeIntro">
        <div class="officeIcon">
          <img :src="office1" style="width: 100%; aspect-ratio: auto;"/>
          <div>{{$t("controller.index.home.virtualWorkstation.4")}}</div>
          <span>{{$t("controller.index.home.virtualWorkstation.5")}}</span>
        </div>
        <div class="officeLine"></div>
        <div style="margin-left: 20px" class="officeIcon">
          <img :src="office2" style="width: 100%; aspect-ratio: auto;"/>
          <div>{{$t("controller.index.home.virtualWorkstation.6")}}</div>
          <span>{{$t("controller.index.home.virtualWorkstation.7")}}</span>
        </div>
        <div class="officeLine"></div>
        <div style="margin-left: 20px" class="officeIcon">
          <img :src="office3" style="width: 100%; aspect-ratio: auto;"/>
          <div>{{$t("controller.index.home.virtualWorkstation.8")}}</div>
          <span>{{$t("controller.index.home.virtualWorkstation.9")}}</span>
        </div>
        <div class="officeLine"></div>
        <div style="margin-left: 20px" class="officeIcon">
          <img :src="office4" style="width: 100%; aspect-ratio: auto;"/>
          <div>{{$t("controller.index.home.virtualWorkstation.10")}}</div>
          <span>{{$t("controller.index.home.virtualWorkstation.11")}}</span>
        </div>
      </div>
    </div>
  </div>

  <!--统计数据-->
  <div style="height: 500px;background: #F2F6FA;">
    <div class="statisticsBox">
      <div style="width: 33.33%">
        <div style="height: 274px">
          <img :src="statistics1" style="aspect-ratio: auto;"/>
        </div>
        <div class="statisticsIntr">{{$t("controller.index.home.statistics.1")}}</div>
      </div>
      <div style="width: 33%">
        <div style="height: 274px">
          <img :src="statistics2" style="margin-top: 60px; aspect-ratio: auto;"/>
        </div>
        <div class="statisticsIntr">{{$t("controller.index.home.statistics.2")}}</div>
      </div>
      <div style="width: 33.33%">
        <div style="height: 274px">
          <img :src="statistics3" style="margin-top: 60px; aspect-ratio: auto;"/>
        </div>
        <div class="statisticsIntr">{{$t("controller.index.home.statistics.3")}}</div>
      </div>
    </div>
  </div>

  <!--价值和理念-->
  <div class="ideaBox" style="margin-top: 100px">
    <div class="ideaTitle" style="position: relative" v-if="language==='zh'">
      {{$t("controller.index.home.idea.1")}}
      <span class="ideaLine"></span>
    </div>
    <div class="ideaTitle" v-else="language==='en'">
      <img :src="culture" style="aspect-ratio: auto;"/>
    </div>
    <div class="ideaList">
      <div style="width: auto;">
        <img :src="idea1"/>
        <div>{{$t("controller.index.home.idea.2")}}</div>
        <div>{{$t("controller.index.home.idea.3")}}</div>
        <div v-if="language==='en'">
          {{$t("controller.index.home.idea.8")}}
        </div>
      </div>
      <div style="width: auto">
        <img :src="idea2"/>
        <div>{{$t("controller.index.home.idea.4")}}</div>
        <div>{{$t("controller.index.home.idea.5")}}</div>
        <div v-if="language==='en'">
          {{$t("controller.index.home.idea.9")}}
        </div>
      </div>
      <div style="width: auto;">
        <img :src="idea3"/>
        <div>{{$t("controller.index.home.idea.6")}}</div>
        <div>{{$t("controller.index.home.idea.7")}}</div>
        <div v-if="language==='en'">
          {{$t("controller.index.home.idea.10")}}
        </div>
      </div>
    </div>
  </div>

  <!--用户心声-->
  <div class="voiceBox" style="margin-top: 100px">
    <div style="text-align: center"><img :src="love"></div>
    <div class="voiceTitle" style="position: relative" v-if="language==='zh'">
      {{$t("controller.index.home.voice.title")}}
      <span class="voiceLine"></span>
    </div>
    <div class="voiceTitle" v-else="language==='en'">
      <img :src="loveThem" style="aspect-ratio: auto;"/>
    </div>
    <div class="voiceBody">
      <div>
        <div class="voiceContent">
          <img :src="quotation"/>
          {{voiceItems[voiceIndex]['content']}}
        </div>
        <div class="voiceAuthor" style="margin-top: 40px">
          <img :src="voiceItems[voiceIndex]['img']" />
          <div class="voiceName">{{voiceItems[voiceIndex]['author']}}</div>
        </div>
      </div>
      <div class="voiceDot" style="">
        <img :src="voiceDotLeft" class="voiceDotLeft" @click="voiceLast"/>
        <img :src="voiceDotRight" class="voiceDotRight" @click="voiceNext"/>
      </div>
    </div>
  </div>

  <!--新闻-->
<!--  <div class="newsBox">-->
<!--    <div class="newsTitle">{{$t("controller.index.home.news.1")}}</div>-->
<!--    <div style="width: 100%;">-->
<!--      <ul style="margin: 0px;padding: 0px">-->
<!--        <li>-->
<!--          <img :src="news1" style="width: 100%; aspect-ratio: auto;"/>-->
<!--          <div class="newsT1">{{$t("controller.index.home.news.3")}}</div>-->
<!--          <div class="newsT2" style="margin-top:1.2rem;margin-bottom:1.2rem;">{{$t("controller.index.home.news.4")}}</div>-->
<!--          <div class="newsT3">{{$t("controller.index.home.news.2")}} →</div>-->
<!--        </li>-->
<!--        <li>-->
<!--          <img :src="news2" style="width: 100%; aspect-ratio: auto;"/>-->
<!--          <div class="newsT1">{{$t("controller.index.home.news.5")}}</div>-->
<!--          <div class="newsT2" style="margin-top:1.2rem;margin-bottom:1.2rem;">{{$t("controller.index.home.news.6")}}</div>-->
<!--          <div class="newsT3">{{$t("controller.index.home.news.2")}} →</div>-->
<!--        </li>-->
<!--        <li>-->
<!--          <img :src="news3" style="width: 100%; aspect-ratio: auto;"/>-->
<!--          <div class="newsT1">{{$t("controller.index.home.news.7")}}</div>-->
<!--          <div class="newsT2" style="margin-top:1.2rem;margin-bottom:1.2rem;">{{$t("controller.index.home.news.8")}}</div>-->
<!--          <div class="newsT3">{{$t("controller.index.home.news.2")}} →</div>-->
<!--        </li>-->
<!--      </ul>-->
<!--    </div>-->
<!--  </div>-->

  <!--faq-->
  <div class="faqBox" style="overflow: hidden;margin-top: 100px">
    <a-row>
      <a-col :span="12">
        <div class="faqL">
          <div class="faqLTitle" style="position: relative;padding-left: 100px">
            {{$t("controller.index.home.faq.1")}}
          </div>
          <img :src="faq" style="width: 100%; aspect-ratio: auto;"/>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="faqR">
          <ul>
            <li v-for="(i,index) in faqList" :key="index">
                <div class="faqRTitle" @click="faqToggle(index)">
                  {{i.title}}
                  <span v-if="index==faqIndex">-</span>
                  <span v-else>+</span>
                </div>
                <div class="faqRContent visible" v-if="index==faqIndex">{{i.content}}</div>
            </li>
          </ul>
        </div>
      </a-col>
    </a-row>
  </div>

  <!--部署-->
  <div class="deploymentBox">
    <div>
      <div v-if="language==='en'">
        <img :src="tryNow" style="width: 100%; aspect-ratio: auto;"/>
      </div>

      <div v-else="language==='zh'">
        <div class="deploymentT1" style="text-align: center">
          已有超过5000用户用过<span style="font-family: DingTalk-JinBuTi;">Teamlinker</span>
        </div>
        <div class="deploymentT1" style="text-align: center">现在就开始使用吧！</div>
      </div>

      <div style="margin-top: 60px;text-align: center">
        <a-button style="width: 30%;height: 60px;background: #00A0FF;font-size: 1.375rem;font-family: PingFangSC, PingFang SC;font-weight: 500;color: #FFFFFF;line-height: 30px;" @click="onRegister">{{$t("controller.index.home.deployment.1")}}</a-button>
        <a-button style="width: 30%;height: 60px;margin-left:60px;background: #2864FF;font-size: 1.375rem;
font-family: PingFangSC, PingFang SC;
font-weight: 500;
color: #FFFFFF;
line-height: 30px;" @click="onDocker">{{$t("controller.index.home.deployment.2")}}</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import indexFirst2 from "@/assert/indexFirst2.png"
import projectLogo2 from "@/assert/project2.png"
import meetingLogo2 from "@/assert/meeting2.png"
import IMLogo2 from "@/assert/im2.png"
import calendarLogo2 from "@/assert/calendar2.png"
import fileLogo2 from "@/assert/file2.png"
import tableLogo from "@/assert/table.png"
import wikiLogo2 from "@/assert/wiki2.png"
import whiteBoardLogo from "@/assert/whiteBoard.png"
import ai1 from "@/assert/ai1.png"
import ai2 from "@/assert/ai2.png"
import ai3 from "@/assert/ai3.png"
import ai4 from "@/assert/ai4.png"
import ai5 from "@/assert/ai5.png"
import ai6 from "@/assert/ai6.png"
import office1 from "@/assert/office1.png"
import office2 from "@/assert/office2.png"
import office3 from "@/assert/office3.png"
import office4 from "@/assert/office4.png"
import statistics1 from "@/assert/statistics1.png"
import statistics2 from "@/assert/statistics2.png"
import statistics3 from "@/assert/statistics3.png"
import idea1 from "@/assert/idea1.png"
import idea2 from "@/assert/idea2.png"
import idea3 from "@/assert/idea3.png"
import love from "@/assert/love.png"
import quotation from "@/assert/quotation.png"
import voiceAvatar from "@/assert/voiceAvatar.png"
import voiceDotLeft from "@/assert/voiceDotLeft.png"
import voiceDotRight from "@/assert/voiceDotRight.png"
import faq from "@/assert/faq.png"
import tryNow from "@/assert/tryNow.png"
import allInOne from "@/assert/allInOne.png"
import platform from "@/assert/platform.png"
import smarter from "@/assert/smarter.png"
import virtualWork from "@/assert/virtualWork.png"
import culture from "@/assert/culture.png"
import loveThem from "@/assert/loveThem.png"
import {getCurrentInstance, onMounted, ref, watch} from "vue";
import {ECommon_Application_Mode} from "../../../../../common/types";
import {apiUser} from "@/business/common/request/request";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const router=useRouter()
const app=getCurrentInstance().appContext
const onLogin=async () =>{
	await router.push("login")
}

const onRegister=async()=>{
	await router.push("register")
}

const onDocker=()=>{
	window.open('https://hub.docker.com/r/teamlinkeroffical/teamlinker','_blank')
}

const getLang=()=>{
  let lang=localStorage.getItem("lang")
  if(lang) {
    if(lang==="zh") {
      return "zh"
    } else {
      return "en"
    }
  } else {
    let lang=(navigator.language || "en").toLowerCase().split("-")[0]
    if(lang==="zh") {
      return "zh"
    } else {
      return "en"
    }
  }
}
const language=ref(getLang())
watch(language,async ()=>{
  localStorage.setItem("lang",language.value)
  await apiUser.changeLang({
    lang:language.value
  })
  location.reload()
})

// 图片数组
const images = [
  ai1,
  ai2,
  ai3,
  ai4,
  ai5,
  ai6
];

//ai列表
const aiList = ref([
  {title: t("controller.index.home.aiList.5"), img: ''},
  {title: t("controller.index.home.aiList.6"), img: ''},
  {title: t("controller.index.home.aiList.7"), img: ''},
  {title: t("controller.index.home.aiList.8"), img: ''},
  {title: t("controller.index.home.aiList.9"), img: ''},
  {title: t("controller.index.home.aiList.10") ,img: ''},
]);
const aiIndex=ref(0)
const currentImg = ref(ai1);
const changeImage = (index) => {
  currentImg.value = images[index]
  aiIndex.value = index
};

// faq列表
const faqIndex = ref(0);
const faqList = ref([
  {title: t("controller.index.home.faq.2"), content: t("controller.index.home.faq.3")},
  {title: t("controller.index.home.faq.4"), content: t("controller.index.home.faq.5")},
  {title: t("controller.index.home.faq.6"), content: t("controller.index.home.faq.7")}
]);
const faqToggle = (index)=>{
  faqIndex.value=index;
};

// 切换
const voiceItems = ref([
  { id: 1, content: t("controller.index.home.voice.voice1.1"), author: t("controller.index.home.voice.voice1.2"), img: voiceAvatar },
  { id: 2, content: t("controller.index.home.voice.voice2.1"), author: t("controller.index.home.voice.voice2.2"), img: voiceAvatar },
  { id: 3, content: t("controller.index.home.voice.voice3.1"), author: t("controller.index.home.voice.voice3.2"), img: voiceAvatar },
]);

const  voiceIndex = ref(0)

const  voiceNext=()=>{
  voiceIndex.value++
  if (voiceIndex.value>voiceItems.value.length){
    voiceIndex.value=0
  }
}

const voiceLast=()=>{
  voiceIndex.value--
  if (voiceIndex.value<0){
    voiceIndex.value=voiceItems.value.length
  }
}

onMounted(()=>{
  if(app.config.globalProperties.$deployMode.value===ECommon_Application_Mode.ONLINE) {
    var _hmt = _hmt || [];
    (function() {
      let hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?92bf6c648bf055f2cc5be97167fb7ef6";
      let s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();
  }
})

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
li{
  list-style: none;
}
.indexFirstBox{
  margin: 0px 190px;
}
.projectBox{
  /*margin: 0px 380px;*/
  padding-top: 100px;
  background: #F2F6FA;
  padding-bottom: 60px;
}
.projectT1{
  font-size: 3.75rem;font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;font-weight: bold;color: #000000;line-height: 82px;
}
.projectT12{
  font-size: 3.125rem;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: bold;
  color: #000000;
  line-height: 4.31rem;
}
.projectT2{
  font-size: 1.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #565656;
  line-height: 33px;
  padding-top: 1.56rem;
}
.projectLine{
  width: 18.18rem;
  height: 1rem;
  background: #54DDFF;
  position: absolute;
  z-index: 1;
  left: 55%;
  transform: translateX(-50%);
  top: 40%;
}
.systemBox{
  margin-top: 57px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.systemBox:after {
  content: "";
  width: calc(25% - 10px);
}
.systemList{
  width: 100%;
  list-style: none;
  text-align: center;
  margin:0px 10%;
}
.systemList li{
  width: calc(25% - 10px);
  text-align: center;
  float: left;
}
.systemList li div{
  font-size: 2rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 45px;
}
.systemList li div img{
  margin: 30px 0px;
}
.systemList li.systemT1{
  font-size: 2rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 45px;
}
.systemList li*{
  text-decoration: none;
}
.aiL{
  float: left;
  position: relative;
  width: 80%;
  height: 38.375rem;
}
.aiTitle span{
  font-size: 3.125rem;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: bold;
  color: #000000;
  line-height: 4.31rem;
}
.aiSubTitle{
  font-size: 1.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #565656;
  line-height: 2.06rem;
}
.aiList{
  width: 100%;
  margin-top: 3.875rem;
}
.aiList ul{
  margin: 0px;
  padding: 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
.aiList li{
  float: left;
  margin-bottom: 3.75rem;
  width: 48%;
}
.aiList .btn{
  width: 100%;
  height: 3.75rem;
  background: #FFFFFF;
  border-radius: 30px;
  border: 1px solid #2864FF;
}
.aiList .btnActive{
  width: 100%;
  height: 3.75rem;
  border-radius: 30px;
  background: #2864FF;
  color: #FFFFFF;
}
.aiLine{
  background-color: #54DDFF;
  width: 6rem;
  height: 1rem;
  position: absolute;
  top: 70%;
  left: 44.5%;
  z-index: -99;
}
.officeBox{
  box-sizing: border-box;
}
.officeSlogan{
  width: 100%;
  text-align: center;
}
.officeDecoration{
  width: 12.68rem;
  height: 1rem;
  background: #54DDFF;
  position: absolute;
  left: 47.5%;
  top: 68%;
  z-index: -99;
}
.officeLine{
  width: 10rem;
  height: 2px;
  background: #999999;
  margin: 5.5625rem 0 0 1.25rem;
}
.officeTitle{
  font-size: 3.125rem;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: bold;
  color: #000000;
  line-height: 4.31rem;
}
.officeSubTitle{
  font-size: 1.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #565656;
  line-height: 33px;
}
.officeIntro{
  width: 100%;
  display: flex;
  text-align: center;
  justify-content: center;
}
.officeIcon div{
  font-size: 2.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 56px;
}
.officeIcon span{
  color: #565656;
  font-size: 1.75rem;
  font-family: PingFangSC-Regular;
  font-weight: normal;
  text-align: left;
  line-height: 56px;
}
.statisticsBox{
  margin: 0px 8%;
  display: flex;
  text-align: center;
  padding-top: 112px;
}
.statisticsIntr{
  font-size: 2rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 45px;
}
.ideaBox{
  margin: 0px 12%;
  text-align: center;
  padding-top: 3.75rem;
}
.ideaTitle{
  font-size: 3.75rem;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: bold;
  color: #000000;
  line-height: 5.125rem;
}
.ideaLine{
  width: 18.5rem;
  height: 1rem;
  overflow: hidden;
  background: #54DDFF;
  position: absolute;
  left: 40.5%;
  top: 77%;
  z-index: -99;
}
.ideaList{
  width: auto;
  margin-top: 4.31rem;
  display: flex;
  justify-content: space-between;
}
.ideaList div{
  font-size: 1.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #000000;
  line-height: 2.5rem;
}
.voiceBox{
  margin: 0px 18%;
}
.voiceTitle{
  text-align: center;
  font-size: 3.125rem;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: bold;
  color: #000000;
  line-height: 4.31rem;
  margin-top: 2.5rem;
}
.voiceLine{
  width: 12.38rem;
  height: 1rem;
  background: #54DDFF;
  position: absolute;
  z-index: -99;
  left: 42.3%;
  top: 75%;
}
.voiceContent{
  font-size: 2.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #565656;
  line-height: 5rem;
  margin-top: 5.06rem;
}
.voiceAuthor{
  width: 35rem;
  height: 5rem;
  margin: 0px;
  padding: 0px;
  display: flex;
  justify-content: center;
  flex-direction: row;
  margin: 0px auto;
}
.voiceName{
  font-size: 2.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  color: #000000;
  line-height: 5.25rem;
	margin-left: 20px;
}
.voiceDot{
  width: 15rem;
  height: 5rem;
  margin: 0px auto;
  margin-top: 3.75rem;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}
.voiceDotLeft{
  width: 4rem;
  height: 4rem;
}
.voiceDotRight{
  width: 4rem;
  height: 4rem;
}
.newsBox{
  margin: 0px 5%;
  padding-top: 6.25rem;
  padding-bottom: 5.5rem;
}
.newsTitle{
  font-size: 3.125rem;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: bold;
  color: #000000;
  line-height: 4.31rem;
  text-align: center;
  margin-bottom: 3.75rem;
}
.newsBox ul{
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}
.newsBox ul li{
  width: 30%;
}
.newsT1{
  font-size: 2.25rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 600;
  color: #000000;
  line-height: 3.125rem;
  overflow-wrap: break-word;
}
.newsT2{
  font-size: 24px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #565656;
  line-height: 33px;
  overflow-wrap: break-word;
}
.newsT3{
  font-size: 24px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 33px;
  text-align: left;
  white-space: nowrap;
}
.faqBox{
  margin: 0px 160px;
}
.faqL{
  float: left;
}
.faqLTitle{
  height: 4.31rem;
  font-size: 3.125rem;
  font-family: AlibabaPuHuiTi;
  font-weight: bold;
  line-height: 4.31rem;
}
.deploymentBox{
  margin: 0px 20%;
  padding-top: 100px;
  padding-bottom: 136px;
}
.deploymentT1{
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 3.75rem;
  font-family: AlibabaPuHuiTi-Bold;
  font-weight: 700;
  text-align: left;
  line-height: 82px;
}
.deploymentT12{
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 1);
  font-size: 3.75rem;
  font-family: AlibabaPuHuiTi-Bold;
  font-weight: 700;
  text-align: left;
  line-height: 82px;
}
.faqR{
  float: left;
  width: 100%;
}
.faqRTitle{
  font-size: 2.5rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 56px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #000;
}
.faqRTitle span{
  float: right;
}
.faqRContent{
  font-size: 24px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #565656;
  line-height: 33px;
  margin-top: 1.2rem;
  margin-bottom: 1.2rem;
}
.aiIntro{
  font-size: 1.5rem;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  color: #565656;
  line-height: 33px;
  letter-spacing: 2px;
  padding-top: 26px
}
.aiIntro2{
  font-size: 1.625rem;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #565656;
  line-height: 37px;
}
</style>