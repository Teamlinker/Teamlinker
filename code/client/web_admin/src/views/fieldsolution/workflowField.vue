<template>
  <div class="app-container">
    <div>Workflow node fields</div>
    <div>{{ workflowDetail.name || "-" }}</div>
    <div>{{ workflowDetail.description || "-" }}</div>
    <div>
      <el-button type="primary" size="small" @click="handleAdd"
        >Add  Field type</el-button
      >
    </div>
    <div>
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="name">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          label="operation"
          align="center"
          width="320"
          class-name="small-padding fixed-width"
        >
          <template>
            <el-button type="text" size="mini"> delete </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import "@/styles/common.scss";
import { workflowNodeList } from "@/api/fieldSolution";
import { workflowDetail } from "@/api/workflow";

export default {
  data() {
    return {
      workflowDetail: null,
      listLoading: false,
      list: [],
    };
  },
  methods: {
    getWorkflowDetail() {
      workflowDetail({ workflowId: this.$route.query.workflowId }).then(
        (res) => {
          this.workflowDetail = res.data;
        }
      );
    },
    fetchData() {
      this.listLoading = true;
      let param = {
        fieldSolutionId: this.$route.query.fieldSolutionId,
        workflowNodeId: this.$route.query.workflowNodeId,
        workflowId: this.$route.query.workflowId,
        workflowSolutionId: this.$route.query.workflowSolutionId,
      };
      workflowNodeList(param).then((res) => {
        var data = res.data;
        this.list = data;
        this.listLoading = false;
      });
    },
    handleAdd(){
      this.$router.push({
        path: "/fieldSolution/addWorkflowField",
        query: { fieldSolutionId: this.$route.query.fieldSolutionId, workflowNodeId: this.$route.query.workflowNodeId, workflowId: this.$route.query.workflowId,  workflowSolutionId: this.$route.query.workflowSolutionId},
      });
    }
  },
  created() {
    this.getWorkflowDetail();
    this.fetchData();
  },
};
</script>
<style lang="scss" scoped>
</style>

