<template>
  <div>
    
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, inject } from "vue";
import axios from "@/plugins/axios";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { notification } from "ant-design-vue";
import formCreate from "@form-create/ant-design-vue";
export default defineComponent({
  components: {},
  setup() {
    

    return {
     
    };
  },
});
</script>

<route lang="yaml">
  meta:
    level: 1
    type: 'proside'
    name: '项目看板'
    layout: auth
</route>