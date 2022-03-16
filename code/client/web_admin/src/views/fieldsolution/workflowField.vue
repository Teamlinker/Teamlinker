<template>
  <div class="app-container">
    <div>Workflow node fields</div>
    <div>{{ workflowDetail.name || "-" }}</div>
    <div>{{ workflowDetail.description || "-" }}</div>
    <div>
      <el-button type="primary" size="small" @click="handleAdd"
        >Add Field type</el-button
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
        <el-table-column label="Type">
          <template slot-scope="scope">
            {{ scope.row.fieldType.name }}
          </template>
        </el-table-column>
        <el-table-column label="Name">
          <template slot-scope="scope">
            {{ scope.row.field.name }}
          </template>
        </el-table-column>
        <el-table-column label="Description">
          <template slot-scope="scope">
            {{ scope.row.field.description }}
          </template>
        </el-table-column>
        <el-table-column label="Default value">
          <template slot-scope="scope">
            {{ scope.row.field.default_value }}
          </template>
        </el-table-column>
        <el-table-column label="Optional">
          <template slot-scope="scope">
            {{ scope.row.field.optional }}
          </template>
        </el-table-column>
        <el-table-column label="Weight">
          <template slot-scope="scope">
            {{ scope.row.field.weight }}
          </template>
        </el-table-column>
        <el-table-column
          label="operation"
          align="center"
          width="320"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)">
              edit
            </el-button>
             <el-button type="text" size="mini" @click="handleCopy(row)">
              copy
            </el-button>
            <el-button type="text" size="mini" @click="handleDelete(row)">
              delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import "@/styles/common.scss";
import { workflowNodeList, deleteField,copyField } from "@/api/fieldSolution";
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
    handleAdd() {
      this.$router.push({
        path: "/fieldSolution/addWorkflowField",
        query: {
          fieldSolutionId: this.$route.query.fieldSolutionId,
          workflowNodeId: this.$route.query.workflowNodeId,
          workflowId: this.$route.query.workflowId,
          workflowSolutionId: this.$route.query.workflowSolutionId,
        },
      });
    },
    handleDelete(row) {
      deleteField({ fieldSolutionWorkflowNodeFieldTypeId: row.field.id }).then(
        (res) => {
          this.$message({
            message: "delete success",
            type: "success",
          });
          this.fetchData();
        }
      );
    },
    handleEdit(row) {  
      this.$router.push({
        path: "/fieldSolution/addWorkflowField2",
        query: {
          fieldSolutionId: this.$route.query.fieldSolutionId,
          workflowNodeId: this.$route.query.workflowNodeId,
          workflowId: this.$route.query.workflowId,
          workflowSolutionId: this.$route.query.workflowSolutionId,
          fieldSolutionWorkflowNodeFieldTypeId:row.field.id,
          fieldTypeId: row.fieldType.id,
          fieldType: row.fieldType.type,
          opeType:'edit'
        },
      });
    },
    handleCopy(row){
      copyField({}).then(res=>{
        
      })
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

