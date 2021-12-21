<template>
  <div>
    dashboard
  </div>
</template>
<script>
import { defineComponent,ref } from 'vue'
import { Icon } from '@/layouts/components/ICON.ts'
import { useStore } from '@/store'
import BrowserType from '@/utils/browser-type'
import { useOnline } from '@/hooks/useOnline'

export default defineComponent({
  components:{
    Icon
  },
  setup() {
    let userInfo = useStore().getters['user/userInfo']
    if(!userInfo){
      userInfo = sessionStorage.getItem('userInfo')
      typeof userInfo == 'string' && (userInfo = JSON.parse(userInfo))
    }
    // 获取浏览器信息
    const browserInfo = ref(BrowserType('zh-cn'))
    // 是否联网
    const { online } = useOnline()
    return {
      browserInfo,
      online,
      userInfo
    }
  }
})
</script>
<style lang="scss" scoped>
.container_box {
  img.analysis {
      min-height: 0;
      flex: 1;
      height: 472px;
      margin: 0 auto;
  }
  .ant-form {
    flex: 2
  }
}
</style>
<route lang="yaml">
  meta:
    level: 1
    name: '首页'
    icon: 'DashboardOutlined'
    layout: auth
</route>