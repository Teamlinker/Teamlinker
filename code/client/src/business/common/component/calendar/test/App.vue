<script setup lang="ts">

import {computed, ref} from "vue";
import moment from "moment";
import "moment-timezone"
import {TLCalendar} from "../npm";
import "../npm/style.css"
const startDay=ref(moment().startOf("weeks").format("YYYY-MM-DD"))
const endDay=ref(moment().endOf("weeks").format("YYYY-MM-DD"))
const month=ref(moment().format("YYYY-MM"))
const timezone=moment.tz.guess(true)
</script>

<template>
	<div style="width: 600px;height: 800px">
		<TLCalendar mode="day" :start-date="startDay" :end-date="endDay" :month="month" :event-list="[]" :utc-offset="8" :time-zone="timezone"></TLCalendar>
	</div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
