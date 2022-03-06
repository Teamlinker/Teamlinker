<template>
  <div>
    <div class="name">Your Projects</div>
    <a-list item-layout="horizontal" :data-source="data">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta
           
          >
          
            <template #title>
              <a href="https://www.antdv.com/">{{ item.title }}</a>
            </template>
            <template #description>
              <a href="https://www.antdv.com/">{{ item.description }}</a>
            </template>
            <template #avatar>
              <a-avatar v-if="item.photo"
                :src="item.photo"
              />
              <a-avatar  v-else/>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
<style scoped>
.name {
  font-weight: 500;
}
</style>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, Ref } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import axios from "@/plugins/axios";
export default defineComponent({
  name: "Your Projects",
  components: {
    UserOutlined,
  },
  setup() {
    const router = useRouter();
    const state:any = reactive({
      data: [],
    });
    useStore()
      .dispatch("user/getProfile")
      .then((res: any) => {
        state.data = res.project;
        for(let i=0;i<state.data.length;i++){
          state.data[i].title =  state.data[i].name
        }
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
