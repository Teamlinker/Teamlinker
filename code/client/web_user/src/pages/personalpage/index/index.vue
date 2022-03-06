<template>
  <div class="page">
    <div class="left">
      <div class="area1">
        <div class="title">Personal settings</div>
        <div class="photo">
          <a-avatar :size="64">
            <template #icon><UserOutlined /></template>
          </a-avatar>
        </div>
        <div class="name">{{info.username}}</div>
        <div class="sign">{{info.sign}}</div>
      </div>

      <div class="area2">
        <div class="title">About</div>
        <div class="info_area">
          <div class="location"><span class="icon"></span><span>{{info.location}}</span></div>
          <div class="email"><span class="icon"></span><span>{{info.email}}</span></div>
          <div class="number"><span class="icon"></span><span>{{info.phone}}</span></div>
          <!-- <div class="department"><span class="icon"></span><span>{{info.department}}</span></div> -->
        </div>
      </div>

      <div class="area3">
        <div @click="goToTeam">
          <span>TEAM</span>
          <span class="arrow"></span>
          </div>
      </div>

      <div class="area4">
        <div @click="goToProject">
          <span>PROJECT</span>
          <span class="arrow"></span>
        </div>
      </div>
    </div>
    <div class="right">
      <component :is="currentView"></component>
    </div>
  </div>
</template>
<script lang="ts">
import "./index.scss";
import { defineComponent, reactive, toRefs, ref, Ref } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useStore } from '@/store'
import axios from "@/plugins/axios";
import pj from "../project/index.vue";
import team from "../team/index.vue";
export default defineComponent({
  name: "personal page",
  components: {
    UserOutlined,
    pj,
    team
  },
  setup() {
    const router = useRouter();
    const state:any = reactive({
      currentView: team,
      info:{}
    });
    useStore().dispatch('user/getProfile').then((res:any)=>{
      state.info = res.info
      state.info.sign = state.info.sign || 'Your signature'
      state.info.location = state.info.location || 'Your location'
      state.info.phone = state.info.phone || 'Your number'
      state.info.email = state.info.location || 'Your email'
    })
    
     const goToTeam = ()=>{
      debugger
      state.currentView = team
    }
    const goToProject = ()=>{
      debugger
      state.currentView = pj
    }
    return {
      ...toRefs(state),
      goToTeam,
      goToProject

    };

  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '个人主页'
    layout: auth
</route>
