<template>
  <div id="teamOS" :style="{backgroundImage:'url('+backImag+')'}">
    <DesktopBar style="height: 40px;background: rgba(255,255,255,0.3);">
      <template v-for="(_, slot) of $slots" v-slot:[slot]="scope"><slot :name="slot" v-bind="scope"/></template>
    </DesktopBar>
    <IconContainer style="height: calc(100% - 40px)">
      <WindowContainer></WindowContainer>
    </IconContainer>
  </div>
</template>

<script setup lang="ts">

import DesktopBar from "./desktopBar.vue";
import IconContainer from "../icon/iconContainer.vue";
import {desktop} from "./desktop";
import WindowContainer from "../window/windowContainer.vue";

let backImag=desktop.getBackgroundImage()
</script>

<style scoped>
#teamOS {
  width: 100%;
  height: 100%;
  position: relative;
  background-size: 100% 100%;
}
</style>