<template>
  <div>
    <div class="name">Your Projects</div>
    <a-list item-layout="horizontal" :data-source="data">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta
            description="Ant Design, a design language for background applications, is refined by Ant UED Team"
          >
            <template #title>
              <a href="https://www.antdv.com/">{{ item.title }}</a>
            </template>
            <template #avatar>
              <a-avatar
                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
              />
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
<style scoped>
.name{
    font-weight: 500;
}
</style>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, Ref } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
export default defineComponent({
  name: "Your Projects",
  components: {
    UserOutlined,
  },
  setup() {
    const router = useRouter();
    const state = reactive({
      data: [
        {
          title: "Ant Design Title 1",
        },
        {
          title: "Ant Design Title 2",
        },
        {
          title: "Ant Design Title 3",
        },
        {
          title: "Ant Design Title 4",
        },
      ],
    });
    return {
      ...toRefs(state),
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: 'Your Projects'
    layout: auth
</route>
