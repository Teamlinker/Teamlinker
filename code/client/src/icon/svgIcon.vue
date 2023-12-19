<template>
	<svg :class="svgClass" aria-hidden="true">
		<use class="svg-use" :href="symbolId" />
	</svg>
</template>

<script setup lang="ts">
import {computed} from "vue";

const props=defineProps<{
	prefix?:string,
	name:string,
	className?:string
}>()
const symbolId = computed(() => `#${props.name}`)
const svgClass = computed(() => {
	if (props.className) {
		return `svg-icon ${props.className}`
	}
	return 'svg-icon'
})
</script>

<style scoped>
.svg-icon {
	overflow: hidden;
}
</style>