<template>
  <div class="list">
    <div class="search">
      <a-space>
        <a-input allowClear v-model:value="name" placeholder="name" />
        <a-select
          placeholder="select priority"
          v-model:value="priority"
          :options="priorityOptions"
        ></a-select>
        <a-select
          v-model:value="assigner"
          show-search
          placeholder="please select assigner"
          allowClear
        >
          <a-select-option
            :value="item.id"
            v-for="item in assignerOptions"
            :key="item.id"
            >{{ item.username }}</a-select-option
          >
        </a-select>
        <a-select
          v-model:value="reporter"
          show-search
          placeholder="please select reporter"
          allowClear
        >
          <a-select-option
            :value="item.id"
            v-for="item in reporterOptions"
            :key="item.id"
            >{{ item.username }}</a-select-option
          >
        </a-select>
        <a-button @click="searchQuery" type="primary">搜索</a-button>
      </a-space>
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
    >
    </a-table>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  UnwrapRef,
  toRaw,
  onActivated,
} from "vue";
import type { SelectProps } from "ant-design-vue";
import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import { message } from "ant-design-vue";
export default defineComponent({
  name: "事务列表",
  setup() {
    let priorityOptions = ref<SelectProps["options"]>([
      {
        value: "0",
        label: "高",
      },
      {
        value: "1",
        label: "中",
      },
      {
        value: "2",
        label: "低",
      },
    ]);

    let assignerOptions = ref([]);
    let reporterOptions = ref([]);
    let name = ref<string>();
    let priority = ref<string>();
    let assigner = ref<string>();
    let reporter = ref<string>();
    const columns = [
      {
        title: "name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "status",
        dataIndex: "status",
        key: "status",
      },
      {
        title: "issueType",
        dataIndex: "issueType.name",
        key: "issueType.name",
      },
      {
        title: "creater",
        dataIndex: "created_by.username",
        key: "created_by.username",
      },
      {
        title: "assigner",
        dataIndex: "assigner_id",
        key: "assigner_id",
      },
      {
        title: "reporter",
        dataIndex: "reporter_id",
        key: "reporter_id",
      },
    ];
    let tableData = ref([]);
    let queryParams = {
      projectId: "435445521716893696",
      name: name.value,
      priority: priority.value,
      assigner: assigner.value,
      reporter: reporter.value,
      page: 0,
      size: 10,
    };
    const getUser = () => {
      const params = {
        projectId: "435445521716893696",
      };
      axios.get("/project/user/list", { params: params }).then((res: any) => {
        assignerOptions.value = res.data;
        reporterOptions.value = res.data;
      });
    };
    getUser();
    let searchQuery = () => {
      queryParams = {
        projectId: "435445521716893696",
        name: name.value,
        priority: priority.value,
        assigner: assigner.value,
        reporter: reporter.value,
        page: 0,
        size: 10,
      };
      getList();
    };
    const getList = () => {
      axios.get("/issue/filter", { params: queryParams }).then((res: any) => {
        tableData.value = res.data;
      });
    };
    getList();
    return {
      priorityOptions,
      assignerOptions,
      reporterOptions,
      name,
      priority,
      assigner,
      reporter,
      columns,
      tableData,
      searchQuery,
    };
  },
});
</script>
<style lang="scss" scoped>
.list {
  margin: 0 20px;
}
.search {
  margin: 20px 0;
  display: flex;
  .ant-space {
    ::v-deep() {
      flex: 1;
    }
  }
}
</style>
<route lang="yaml">
  meta:
    level: 1
    name: '事务列表'
    layout: auth
</route>