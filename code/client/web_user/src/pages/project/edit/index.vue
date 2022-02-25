<template>
  <div>
   <create-pro></create-pro>
  </div>
</template>
<script lang="ts">
import CreatePro from '../create/form.vue'
import {
  defineComponent
} from "vue";
export default defineComponent({
  components: {
   CreatePro
  },
  setup() {
    
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '编辑项目'
    layout: auth
</route>
