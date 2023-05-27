<template>
  <DesktopContainer>
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope"><slot :name="slot" v-bind="scope"/></template>
  </DesktopContainer>
</template>

<script setup lang="ts">
import DesktopContainer from "./desktop/desktopContainer.vue";
</script>

<style scoped>

</style>