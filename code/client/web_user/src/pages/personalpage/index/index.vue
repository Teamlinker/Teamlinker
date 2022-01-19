<template>
  <div class="page">
    <div class="left">
      <div class="area1">
        <div>Personal settings</div>
        <div>
          <a-avatar :size="64">
            <template #icon><UserOutlined /></template>
          </a-avatar>
        </div>
        <div>name</div>
      </div>

      <div class="area1">
        <div>About</div>
        <div>Your Location</div>
        <div>Your Email</div>
        <div>Your Number</div>
        <div>Your Department</div>
      </div>

      <div class="area3">
        <div>TEAM</div>
      </div>

      <div class="area4">
        <div>TEAM</div>
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
import axios from "@/plugins/axios";
import pj from '../project/index.vue'
export default defineComponent({
  name: "personal page",
  components: {
    UserOutlined,
    pj
  },
  setup() {
    const router = useRouter();
    const state = reactive({
      currentView:pj
    });
    return {
      ...toRefs(state),
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
