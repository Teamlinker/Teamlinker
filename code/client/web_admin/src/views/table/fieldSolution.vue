<template>
  <div class="app-container">
    <el-row style="padding-bottom: 10px">
      <el-button type="primary" size="small" @click="handleCreate"
        >新增字段方案</el-button
      >
    </el-row>
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
        width="320"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="text" size="mini" @click="handleWorkflow(row)">
            配置工作流方案
          </el-button>
          <el-button type="text" size="mini" @click="handleRemove(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        :rules="rules"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="方案名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" :rows="2" v-model="temp.description" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import "@/styles/common.scss";
import {
  getFieldSolutionList,
  createFieldSolution,
  deleteFieldSolution,
  editFieldSolution,
} from "@/api/fieldSolution";
export default {
  data() {
    return {
      listLoading: false,
      textMap: {
        update: "编辑",
        create: "创建",
      },
      list: [],
      dialogStatus: "",
      dialogFormVisible: false,
      temp: {
        name: "",
        description: "",
      },
      rules: {
        name: [{ required: true, message: "名称必填", trigger: "blur" }],
      },
    };
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      getFieldSolutionList({}).then((res) => {
        var data = res.data;
        data.forEach((item) => {
          item.created_time = this.moment(item.created_time).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          item.modify_time = this.moment(item.modify_time).format(
            "YYYY-MM-DD HH:mm:ss"
          );
        });
        this.list = data;
        this.listLoading = false;
      });
    },
    resetTemp() {
      this.temp = {
        fieldSolutionId: undefined,
        name: "",
        description: "",
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const params = this.temp;
          createFieldSolution(params).then(() => {
            this.doSuccess();
          });
        }
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const params = {
            fieldSolutionId: this.temp.id,
            name: this.temp.name,
            description: this.temp.description,
          };
          editFieldSolution(params).then(() => {
            this.doSuccess();
          });
        }
      });
    },
    handleUpdate(row) {
      this.dialogStatus = "update";
      this.temp = Object.assign({}, row);
      this.dialogFormVisible = true;
    },
    doSuccess() {
      this.fetchData();
      this.dialogFormVisible = false;
      this.$notify({
        title: "Success",
        message: "操作成功",
        type: "success",
        duration: 2000,
      });
    },
    handleRemove(row) {
      this.temp.fieldSolutionId = row.id;
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
      deleteFieldSolution({
        fieldSolutionId: this.temp.fieldSolutionId,
      }).then(() => {
        this.doSuccess();
      });
    },
    //配置工作流
    handleWorkflow(row) {
      this.$router.push({ path: "/fieldSolution/configWorkflowSolution", query: {fieldSolutionId:row.id} });
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

