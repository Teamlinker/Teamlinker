<template>
  <div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
    <div class="tabsOrBreadcrumb">
      <Breadcrumb></Breadcrumb>
    </div>
    <div
      
      class="container_main"
    >
      <div class="container_box">
        训练中心
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
// import { Icon } from '@/layouts/components/ICON.ts'
import Breadcrumb from '@/components/Breadcrumb/index'

export default defineComponent({
  name:'训练中心',
  components:{
    // Icon,
    Breadcrumb
  },
  setup() {
    
    return {}
  }
})


</script>
<route lang="yaml">
  meta:
    level: 1
    name: '训练中心'
    icon: 'DashboardOutlined'
    layout: auth
</route>