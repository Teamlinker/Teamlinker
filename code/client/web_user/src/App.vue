<template>
  <a-config-provider :locale="locale">
    <div class="teamlinker-app">
      <div class="main-layout">
        <router-view />
      </div>
    </div>
  </a-config-provider >
</template>

<script lang="ts">
import { defineComponent } from "vue";
import zhCN from 'ant-design-vue/es/locale/zh_CN'

export default defineComponent({
  name: "App",
  setup(){
    return {
      locale:zhCN
    }
  }
});
</script>