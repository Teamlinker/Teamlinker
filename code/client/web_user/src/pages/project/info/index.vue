<template>
  <div>
    <router-link :to="'/project/module?projectId='+projectId">
        <a-button>项目设置</a-button>
      </router-link>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, Ref } from "vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
export default defineComponent({
  name: "项目信息",
  setup() {
    const router = useRouter();
    const state = reactive({});
    let projectId: Ref = ref('')
    const initData = () => {
      const id = router.currentRoute.value.query.projectId;
      console.log(id, "projectId");
      // 395922736190524416

      if (id) {
         projectId.value = id;
        const params = {
          projectId: id,
        };
        axios.get("/project/basic", { params: params }).then((res:any) => {
          console.log(res, "resss");
        });
      }
    };
    initData();
    return {
      ...toRefs(state),
      projectId
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '项目信息'
    layout: auth
</route>
<style scoped>
.add-member {
  margin-top: 50px;
  margin-left: 50px;
}
</style>