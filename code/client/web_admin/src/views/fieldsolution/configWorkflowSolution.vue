<template>
  <div class="app-container">
    <div style="margin: 10px 0; display: flex; justify-content: space-between">
      <span> Workflow solution</span>
      <el-button type="primary" size="small" @click="handleBind"
        >Bind workflow solution</el-button
      >
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="Index" width="95">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="Workflow Solution Name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column
        label="Operation"
        align="center"
        width="320"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleConfig(row)">
            config workflow node
          </el-button>
          <el-button type="text" size="mini" @click="handleUnbind(row)">
            unbind
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import "@/styles/common.scss";
import { getWorkflowList } from "@/api/workflow";
import { fieldSolutionDetail, unbindFieldSolution } from "@/api/fieldSolution";
export default {
  data() {
    return {
      listLoading: false,
      textMap: {
        update: "edit",
        create: "creat",
      },
      list: [],
    };
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      fieldSolutionDetail({
        fieldSolutionId: this.$route.query.fieldSolutionId,
      }).then((res) => {
        var data = res.data.workflowSolutionList;
        this.list = data;
        this.listLoading = false;
      });
    },
    handleBind() {
      this.$router.push({
        path: "/fieldSolution/bindWorkflowSolution",
        query: { fieldSolutionId: this.$route.query.fieldSolutionId },
      });
    },
    handleUnbind(row) {
      unbindFieldSolution({
        fieldSolutionId: this.$route.query.fieldSolutionId,
        workflowSolutionId: row.workflowSolution.id,
      }).then((res) => {
        this.$message({
          message: "unbind success",
          type: "success",
        });
        this.fetchData();
      });
    },
    handleConfig(row) {
      this.$router.push({
        path: "/fieldSolution/selectWorkflow",
        query: {
          fieldSolutionId: this.$route.query.fieldSolutionId,
          workflowSolutionId: row.id,
        },
      });
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

