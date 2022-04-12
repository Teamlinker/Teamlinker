<template>
  <div class="sider-container">
    <div class="side-box">
      <router-link :to="'/board?projectId='+id+'&projectName='+proName"
        ><div class="back">返回项目</div>
      </router-link>
      <div class="setting">项目设置</div>
      <div class="list">
        <router-link
          v-for="(item, index) in menuList"
          :key="index"
          :to="item.url + '?projectId=' + id+'&projectName='+proName"
        >
          <div :class="['item',path === item.url ? 'active' : '']">
            {{ item.name }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref,watch } from 'vue'
import { useRoute } from 'vue-router'
export default defineComponent({
  setup(props) {
    const menuList = ref()
    const route = useRoute()
    const id = ref()
    const path = ref()
    const proName = ref()
    id.value = route.query.projectId
    proName.value = route.query.projectName
    menuList.value = [
      { url: '/project/edit', name: '详情' },
      { url: '/project/module', name: '模块' },
      { url: '/project/tag', name: '标签' },
      { url: '/project/member', name: '成员' }
    ]
    path.value = route.path
    watch(
      () => route.path,
      (val) => {
        path.value = val
      }
    )
    return {
      menuList,
      id,
      path,
      proName
    }
  }
})
</script>
<style lang="scss" scoped>
.side-box {
  .back {
    padding-top: 30px;
    padding-left: 40px;
    padding-bottom: 20px;
  }
  .setting {
    padding-left: 40px;
    font-size: 16px;
    margin-bottom: 20px;
  }
  .list {
    width: 200px;
    .item {
      padding-left: 40px;
      margin-bottom: 15px;
      color: #333;
      &.active {
        color: #0052cc;
      }
    }
  }
}
</style>