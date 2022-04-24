<template>
  <div class="side-box">
    <div class="name">{{ proName }}</div>
    <div class="list">
      <router-link
        v-for="(item, index) in menuList"
        :key="index"
        :to="item.url + '?projectId=' + id + '&projectName=' + proName"
      >
        <div
          :class="['item', path == item.url || path == item.activeUrl ? 'active' : '']"
        >
          {{ item.name }}
        </div>
      </router-link>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
export default defineComponent({
  setup(props) {
    const menuList = ref();
    const route = useRoute();
    const id = ref();
    const path = ref();
    const proName = ref();
    id.value = route.query.projectId;
    menuList.value = [
      { url: "/board", name: "Board" },
      { url: "/issue/list", name: "issue", activeUrl: "/issue/detail" },
      { url: "/project/edit", name: "Settings" },
    ];
    path.value = route.path;
    proName.value = route.query.projectName;
    watch(
      () => route.path,
      (val) => {
        path.value = val;
      }
    );
    return {
      menuList,
      id,
      path,
      proName,
    };
  },
});
</script>
<style lang="scss" scoped>
.side-box {
  padding-top: 40px;
  .name {
    padding-left: 20px;
    font-size: 18px;
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
