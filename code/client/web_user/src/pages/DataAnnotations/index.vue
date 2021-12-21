<template>
  <div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
    <div class="tabsOrBreadcrumb">
      <Breadcrumb></Breadcrumb>
    </div>
    <div class="container_main">
      <div class="container_box">
        数据标注
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent,reactive, toRefs } from 'vue'

export default defineComponent({
  name:'数据标注',
  setup() {
    const state = reactive({})
    
    return {
      ...toRefs(state)
    }
  }
})


</script>
<route lang="yaml">
  meta:
    level: 1
    name: '数据标注'
    icon: 'icon-weibiaoji'
    layout: auth
</route>