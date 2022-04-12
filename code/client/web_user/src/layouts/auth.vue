<template>
  <div style="-webkit-font-smoothing: antialiased; text-transform: capitalize">
    <a-layout class="h-screen">
      <a-layout-header>
        <Header :collapsed="showCompletely" @change-completely="changeCompletely" />
      </a-layout-header>
      <a-layout>
        <a-layout-sider v-if="metaType === 'proset'">
          <pro-sider></pro-sider>
        </a-layout-sider>
        <a-layout-sider v-if="metaType === 'proside'">
          <proindex-sider></proindex-sider>
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
import { defineComponent, reactive, toRefs, watch } from "vue";
import { useStore } from "@/store";
import Header from "./components/_header.vue";
import { getAuth } from "@/utils/auth";
import ProSider from "./components/pro-side.vue";
import ProindexSider from "./components/proindex-side.vue";
import { useRouter } from "vue-router";
export default defineComponent({
  name: "有鉴权布局",
  components: {
    Header,
    ProSider,
    ProindexSider,
  },
  setup() {
    const userInfo = sessionStorage.getItem("userInfo");
    let store = useStore();
    const token = getAuth("TOKEN");
    const state = reactive({
      showCompletely: true,
      year: new Date().getFullYear(),
      metaType: "",
    });

    const changeCompletely = () => {
      state.showCompletely = !state.showCompletely;
    };
    const router = useRouter();
    state.metaType = router.currentRoute.value.meta.type;
    watch(
      () => router.currentRoute.value.meta.type,
      (val) => {
        state.metaType = val;
      }
    );
    return {
      ...toRefs(state),
      token,
      userInfo,
      changeCompletely,
      router,
    };
  },
});
</script>

<style lang="scss" scoped></style>
