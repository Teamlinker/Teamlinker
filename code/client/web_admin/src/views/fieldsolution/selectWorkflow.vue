<template>
  <div class="app-container">
         <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="index" width="95">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="Workflow">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="Description">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column
        label="operation"
        align="center"
        width="320"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleConfig(row)">
            config
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import "@/styles/common.scss";
import {solutionListWorkflow} from '@/api/workflow'

export default {
  data() {
    return {
     listLoading: false,
      list: [],
    };
  },
  methods: {
    fetchData() {
      this.listLoading = true
      solutionListWorkflow({workflowSolutionId:this.$route.query.workflowSolutionId}).then((res) => {
        var data = res.data
        this.list = data
        this.listLoading = false
      })
    },
    handleConfig(row) {
       this.$router.push({ path: "/fieldSolution/fs-workflow", query: {fieldSolutionId:this.$route.query.fieldSolutionId,workflowSolutionId:this.$route.query.workflowSolutionId,workflowId:row.id} });
    },
  },
  created() {
    this.fetchData();
  },
};
</script>
<style lang="scss" scoped>

</style>

