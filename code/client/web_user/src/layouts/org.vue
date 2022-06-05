<template>
  <div style="-webkit-font-smoothing: antialiased; text-transform: capitalize">
    <a-layout class="h-screen">
      <a-layout-header>
        <div class="header">
      <div class="left">
       <div class="logo"><img src="~@/assets/img/logo.png" alt="" /></div>
      </div>
      <div class="right">
         <a-dropdown>
          <div @click.prevent class="ant-dropdown-trigger">
            <a-avatar
              size="small"
              alt="avatar"
              class="avatar"
              src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"
            />
            <span class="anticon" style="margin-left:8px;">xxx</span>
          </div>
          <template #overlay>
            <a-menu class="menu">
              <a-menu-item key="logout" @click="onMenu">
                        退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
      </a-layout-header>
      <a-layout>
        <a-layout-content>
          <router-view v-slot="{ Component }">
            <transition name="slide-fade" mode="out-in">
                <component :is="Component" />
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
import { useRouter } from "vue-router";
import { message } from "ant-design-vue"
export default defineComponent({
  name: "有鉴权布局",
  components: {
    Header
  },
  setup() {
    const userInfo = sessionStorage.getItem("userInfo");
    let store = useStore();
    const token = getAuth("TOKEN");
    const onMenu = async () => {
      message.destroy();
      const { code, message: msg } = await store.dispatch("user/logout");

      if (code == 0) {
        console.log("登出成功");
      } else {
        message.info(msg || "登出失败");
      }
    };


    return {
      token,
      userInfo,
      onMenu
    };
  },
});
</script>

<style lang="scss" scoped>
  .header {
    display: flex;
    padding:0 20px;
    .left {
      flex: 1;
      display: flex;
      align-items: center;
      .logo{
        margin-right:60px;
      }
      .menu{
        margin-right:60px;
      }
    }
    .right{
      align-items:center;
      .ant-dropdown-trigger{
        cursor:pointer;
      }
    }
  }
</style>
