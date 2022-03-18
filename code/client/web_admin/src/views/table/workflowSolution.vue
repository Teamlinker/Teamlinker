<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="关键字"
        style="width: 200px"
        size="small"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        type="primary"
        size="small"
        @click="handleFilter"
        style="margin-left: 10px"
      >
        搜索
      </el-button>
      <el-button
        type="primary"
        size="small"
        @click="handleReset"
        style="margin-left: 10px"
      >
        重置
      </el-button>
    </div>

    <el-row style="padding-bottom: 10px">
      <el-button type="primary" size="small" @click="handleCreate"
        >新增工作流方案</el-button
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
          {{ page.pageIndex * page.pageSize + scope.$index + 1 }}
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
      <!-- <el-table-column label="事务类型">
        <template slot-scope="scope">
          {{ scope.row.issueTypeList.map((item) => item.name).join() }}
        </template>
      </el-table-column>
      <el-table-column label="项目">
        <template slot-scope="scope">
          {{ scope.row.projectList.map((item) => item.name).join() }}
        </template>
      </el-table-column> -->
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
        width="400"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleUpdate(row)"> 编辑 </el-button>
          <el-button type="text" size="mini" @click="bindWorkflow(row)">
            配置工作流
          </el-button>
          <el-button type="text" size="mini" @click="bindIssueType(row)">
            配置事务类型方案
          </el-button>
          <el-button type="text" size="mini" @click="handleCopy(row)"> 复制 </el-button>
          <el-button type="text" size="mini" @click="handleRemove(row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <div class="pagination_box">
      <el-pagination
        layout="prev, pager, next"
        background
        :total="page.pageCount"
        @current-change="pageCurChange"
      >
      </el-pagination>
    </div> -->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        :rules="issueTypeRules"
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
import "@/styles/upload.scss";
import {
  solutionList,
  solutionCreate,
  solutionUpdate,
  solutionDelete,
  solutionCopy,
} from "@/api/workflow";
import { getIssueSolutionList } from "@/api/issueType";
export default {
  data() {
    return {
      listQuery: { keyword: "" },
      list: null,
      listLoading: true,
      page: {
        pageIndex: 0,
        pageSize: 10,
        pageCount: 0,
      },
      textMap: {
        update: "编辑",
        create: "创建",
      },
      dialogStatus: "",
      dialogFormVisible: false,
      temp: {},
      issueTypeRules: {
        name: [{ required: true, message: "名称必填", trigger: "blur" }],
      },
      projectRules: {
        project: [{ required: true, message: "名称必填", trigger: "change" }],
      },
      issueRules: {
        type: [{ required: true, message: "名称必填", trigger: "change" }],
      },
      project: "",
      projectList: [],
      proVisible: false,
      projectForm: { project: undefined },
      issueTypeVisible: false,
      issueTypeForm: { type: undefined },
      issueList: [],
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      solutionList({}).then((res) => {
        console.log(res, "ressss");
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
    pageCurChange(page) {
      this.page.pageIndex = page - 1;
      this.fetchData();
    },
    handleFilter() {
      this.page.pageIndex = 0;
      this.fetchData();
    },
    handleReset() {
      this.listQuery.keyword = "";
    },
    resetTemp() {
      this.temp = {
        issueTypeId: undefined,
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
    handleUpdate(row) {
      this.dialogStatus = "update";
      this.temp = Object.assign({}, row);
      this.dialogFormVisible = true;
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const params = this.temp;
          solutionCreate(params).then(() => {
            this.doSuccess();
          });
        }
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const params = {
            workflowSolutionId: this.temp.id,
            name: this.temp.name,
            description: this.temp.description,
          };
          solutionUpdate(params).then(() => {
            this.doSuccess();
          });
        }
      });
    },
    handleRemove(row) {
      this.temp.issueTypeSolutionId = row.id;
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
      solutionDelete({
        workflowSolutionId: this.temp.issueTypeSolutionId,
      }).then(() => {
        this.doSuccess();
      });
    },
    handleCopy(row) {
      solutionCopy({
        workflowSolutionId: row.id,
      }).then(() => {
        this.doSuccess();
      });
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
    getIssueSolutionList() {
      getIssueSolutionList({}).then((res) => {
        this.issueList = res.data;
      });
    },
    bindWorkflow(row) {
      this.$router.push({
        path: "/example/configWorkflow",
        query: {
          workflowSolutionId: row.id,
          name: row.name,
        },
      });
    },
    bindIssueType(row){
       this.$router.push({
        path: "/example/configIssueType",
        query: {
          workflowSolutionId: row.id,
          name: row.name,
        },
      });
    }
  },
};
</script>
