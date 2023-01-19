<template>

</template>

<script setup lang="ts">
import {onBeforeMount} from "vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";

onBeforeMount(()=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,"7013352022736896002");
})

</script>

<style scoped>

</style>