<template>
  <div>
    <div class="name">
      {{ this.workflowSolutionName }}
    </div>
    <div class="operate">
      <el-button type="primary" size="mini" @click="handleAdd()">
        Add Existing Workflow
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_time }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间">
        <template slot-scope="scope">
          {{ scope.row.modify_time }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleRemove(row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加已有工作流" :visible.sync="visible">
      <el-form
        ref="dataForm"
        :model="dataForm"
        :rules="rules"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="工作流名称" prop="workflowId">
          <el-select v-model="dataForm.workflowId" placeholder="请选择">
            <el-option
              v-for="item in workflowList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  solutionListWorkflow,
  solutionAddWorkflow,
  solutionRemoveWorkflow,
  getWorkflowList,
} from "@/api/workflow";
export default {
  data() {
    return {
      list: [],
      listLoading: false,
      visible: false,
      dataForm: {},
      visible: false,
      workflowList: [],
      rules: {
        workflowId: [{ required: true, message: "工作流必选", trigger: "change" }],
      },
      temp: {},
    };
  },
  methods: {
    getList() {
      this.listLoading = true;
      solutionListWorkflow({
        workflowSolutionId: this.workflowSolutionId,
      }).then((res) => {
        var data = res.data;
        data.forEach((item) => {
          item.created_time = this.moment(item.created_time).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          item.modify_time = this.moment(item.modify_time).format("YYYY-MM-DD HH:mm:ss");
        });
        this.list = data;
        this.listLoading = false;
      });
    },
    handleAdd() {
      this.visible = true;
    },
    handleRemove(row) {
      this.temp.workflowId = row.id;
      this.$confirm("确定删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.removeData();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    removeData() {
      solutionRemoveWorkflow({
        workflowSolutionId: this.workflowSolutionId,
        workflowId: this.temp.workflowId,
      }).then(() => {
        this.doSuccess();
      });
    },
    doSuccess() {
      this.getList();
      this.$notify({
        title: "Success",
        message: "操作成功",
        type: "success",
        duration: 2000,
      });
    },
    getWorkflowList() {
      getWorkflowList({}).then((res) => {
        this.workflowList = res.data;
      });
    },
    submit() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const params = {
            workflowSolutionId: this.workflowSolutionId,
            workflowId: this.dataForm.workflowId,
          };
          solutionAddWorkflow(params).then(() => {
            this.visible = false;
            this.dataForm.workflowId = undefined;
            this.doSuccess();
          });
        }
      });
    },
  },
  created() {
    this.workflowSolutionId = this.$route.query.workflowSolutionId;
    this.workflowSolutionName = this.$route.query.name;
    this.getList();
    this.getWorkflowList();
  },
};
</script>
<style scoped>
.operate {
  margin-bottom: 20px;
  margin-right: 20px;
  float: right;
}
.name {
  margin: 20px;
}
</style>
