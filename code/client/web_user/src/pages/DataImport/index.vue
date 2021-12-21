<template>
  <div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
    <div class="tabsOrBreadcrumb">
      <Breadcrumb></Breadcrumb>
    </div>
    <div
      
      class="container_main"
    >
      <div class="container_box">
        数据导入
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name:'数据导入',
  setup() {
    
    return {
      
    }
  }
})


</script>
<route lang="yaml">
  meta:
    level: 1
    name: '数据导入'
    icon: 'DashboardOutlined'
    layout: auth
</route>