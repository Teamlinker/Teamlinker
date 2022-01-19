<template>
  <div class="table-list">
    <div class="search">
    <a-row>
        <a-col :span="6"><a-input v-model:value="searchText" placeholder="search" /></a-col>
    </a-row>
      <div class="btn-area">
         <a-button  type="primary" @click="searchQuery">搜索</a-button>
      </div>
    
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :rowKey="(record) => record.id"
      :pagination="pagination"
      bordered
    >
     <template #action="{ record }">
         <a @click="onDetail(record.id)">view</a>
     </template>
    </a-table>
  </div>
</template>
<style scoped>
 .table-list{
   padding: 0 30px;
 }
 .search{
     padding: 30px 0;
 }
 .btn-area{
     margin: 10px 0;
 }
</style>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import { columns } from "./columns";
import { message } from "ant-design-vue";
export default defineComponent({
  name: "team list",
  setup() {
    const router = useRouter();
    const state = reactive({
      tableData: [],
    });
    const getTeamList = () => {
      const params = {
        page: 0,
        size: 10,
        keyword: "",
      };
      axios.get("/team/list", { params: params }).then((res: any) => {
        state.tableData = res.data.data;
      });
    };
    getTeamList()
    const onDetail = (id:string) =>{
      // router.push({ name: 'team-info' , params: { teamId: id }})
      router.push('/team/info?teamId='+id)
    }
    return {
      columns,
      ...toRefs(state),
      onDetail
    };
  },
});
</script>
<style lang="scss">
</style>
<route lang="yaml">
  meta:
    level: 1
    name: '团队列表'
    layout: auth
</route>