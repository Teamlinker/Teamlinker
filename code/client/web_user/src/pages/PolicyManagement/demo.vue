<template>
  <div style="-webkit-font-smoothing: antialiased;text-transform: capitalize;overflow-x: hidden;">
    <div class="tabsOrBreadcrumb">
      <Breadcrumb>
        <a-tabs v-model:activeKey="activeKey" >
          <a-tab-pane key="1" tab="Tab 1"></a-tab-pane>
          <a-tab-pane key="2" tab="Tab 2"></a-tab-pane>
          <a-tab-pane key="3" tab="Tab 3"></a-tab-pane>
        </a-tabs>
      </Breadcrumb>
    </div>
    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '1'">
        <div class="container_box">
          管理111
          <a-input />
        </div>
      </div>
    </transition>
    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '2'">
        <div class="container_box">
          管理222
          <a-input />
        </div>
      </div>
    </transition>


    <transition name="slide-fade"  mode="out-in">
      <div class="container_main" v-show="activeKey == '3'">
        <div class="container_box">
          管理333
          <a-input />
        </div>
      </div>
    </transition>

  </div>
</template>
<script>
import { defineComponent,reactive,toRefs } from 'vue'

export default defineComponent({
  name:'管理111',
  setup() {
    const state = reactive({
      activeKey:"1"
    })
    const changeKey = (key) => {
      console.log(key)
      state.activeKey = key
    }
    return {
      ...toRefs(state),
      changeKey
    }
  }
})


</script>
<route lang="yaml">
  
  meta:
    level: 2
    name: '管理111'
    parent: '管理/管理/管理/管理'
    icon: 'icon-yonghuhuaxiang'
    layout: auth
</route>