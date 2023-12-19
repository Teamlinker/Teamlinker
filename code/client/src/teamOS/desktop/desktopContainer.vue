<template>
  <div id="teamOS" :style="{...(backImage?{
		backgroundImage:'url(\''+backImage+'\')',
    backgroundSize:'cover',
    backgroundPosition:'center',
    backgroundRepeat: 'no-repeat'
  }:{
		background:'linear-gradient(rgb(48,26,78),rgb(10,16,154))'
  })}">
    <IconContainer style="height: calc(100% - 40px);" v-drop.file.folder.shortcut.disk="desktop.onDropFunc" v-menu.self="desktop.contextMenu" v-select>
	    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope"><slot :name="slot" v-bind="scope"/></template>
      <WindowContainer></WindowContainer>
    </IconContainer>
	  <DesktopBar style="height: 40px;background-color: rgb(93,92,140,0.8);">
		  <template v-for="(_, slot) of $slots" v-slot:[slot]="scope"><slot :name="slot" v-bind="scope"/></template>
	  </DesktopBar>
  </div>
</template>

<script setup lang="ts">

import DesktopBar from "./desktopBar.vue";
import IconContainer from "../icon/iconContainer.vue";
import {desktop} from "./desktop";
import WindowContainer from "../window/windowContainer.vue";
import {vDrop} from "../common/directive/drop";
import {vMenu} from "../common/directive/menu";
import {vSelect} from "../common/directive/select";

let backImage=desktop.getBackgroundImage()
</script>

<style scoped>
#teamOS {
  width: 100%;
  height: 100%;
  position: relative;
  background-size: 100% 100%;
}
</style>