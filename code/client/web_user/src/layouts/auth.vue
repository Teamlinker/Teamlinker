<template>
  <div style="-webkit-font-smoothing: antialiased; text-transform: capitalize">
    <a-layout class="h-screen">
      <a-layout-header>
        <Header
          :collapsed="showCompletely"
          @change-completely="changeCompletely"
        />
      </a-layout-header>
      <!-- <a-layout> -->
      <a-layout>
        <a-layout-sider v-if="isProSide">
          <pro-side v-if="isProSide"></pro-side>
        </a-layout-sider>
        <a-layout-content>
          <router-view v-slot="{ Component }">
            <transition name="slide-fade" mode="out-in">
              <keep-alive exclude="About">
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </a-layout-content>
      </a-layout>
      <a-layout-footer>
        <div class="flex_L">
          <div class="footerLogo"></div>
          <div class="footerItem"></div>
        </div>
      </a-layout-footer>
    </a-layout>
    <!-- </a-layout> -->
  </div>
</template>
<script>
import { defineComponent, reactive, toRefs,watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import Sider from "./components/_sider.vue";
import Header from "./components/_header.vue";
import { getAuth } from "@/utils/auth";

export default defineComponent({
  name: "有鉴权布局",
  components: {
    Sider,
    Header,
  },
  setup() {
    const userInfo = sessionStorage.getItem("userInfo");
    let store = useStore();
    const token = getAuth("TOKEN");
    const state = reactive({
      isProSide:false,
      showCompletely: true,
      year: new Date().getFullYear(),
    });
    const changeCompletely = () => {
      state.showCompletely = !state.showCompletely;
    };
    const router = useRouter();
    const doPathSide=(route)=>{
      let path = route || router.currentRoute.value.path;
      state.isProSide = [
      "/project/module",
      "/project/tag",
      "/project/member",
      ].includes(path);
    }
    doPathSide()
    watch(
      () => router.currentRoute.value.path,
      (val) => {
        doPathSide(val)
      }
    )
 
    return {
      ...toRefs(state),
      token,
      userInfo,
      changeCompletely
    };
  },
});
</script>

<style lang="scss" scoped>
</style>