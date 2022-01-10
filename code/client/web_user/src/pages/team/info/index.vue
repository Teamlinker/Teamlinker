<template>
  <div>
    <div class="team-area">
      <div class="row1">
        <span class="phto">
          <a-avatar shape="square" size="large">
            <template #icon><UserOutlined /></template>
          </a-avatar>
        </span>
        <span class="name">{{ teamInfo.name }}</span>
      </div>
      <div class="row2">
        The team was founded in {{ teamInfo.modified_time }}
      </div>
      <div class="row3">
        <a-row>
          <a-col :span="8" v-for="(item) in teamMembers" :key="item.id">
            <div class="user-item">
              <a-avatar size="large">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="username">{{item.name}}</span>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, Ref } from "vue";
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
export default defineComponent({
  name: "team info",
  components: {
    UserOutlined,
  },
  setup() {
    const router = useRouter();
    const state = reactive({
      teamInfo: "",
      teamMembers: "",
    });
    let teamId: Ref = ref("");
    const initData = () => {
      const id = router.currentRoute.value.query.teamId;
      if (id) {
        teamId.value = id;
        const params = {
          teamId: id,
        };
        axios.get("/team/item", { params: params }).then((res: any) => {
          state.teamInfo = res.data;
        });
        axios.get("/team/members", { params: params }).then((res: any) => {
          state.teamMembers = res.data;
        });
      }
    };
    initData();
    return {
      ...toRefs(state),
      teamId,
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '团队信息'
    layout: auth
</route>
<style lang="scss" scoped>
.team-area {
  margin: 0 30px;
}
.row1 {
  margin: 30px 0;
  .name {
    display: inline-block;
    margin-left: 10px;
    font-weight: 600;
    font-size: 16px;
  }
}
.row2 {
  width: 100%;
  height: 54px;
  line-height: 54px;
  background: rgb(242, 246, 252);
  padding: 0 30px;
  box-sizing: border-box;
  font-weight: 500;
}
.user-item {
  display: flex;
  align-items: center;
  margin-top: 30px;
  .username {
    display: inline-block;
    margin-left: 10px;
    font-weight: 600;
  }
}
</style>