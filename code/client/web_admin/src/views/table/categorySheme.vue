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
        >新增事务类型方案</el-button
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
      <el-table-column label="事务类型">
        <template slot-scope="scope">
          {{ scope.row.issueTypeList.map((item) => item.name).join() }}
        </template>
      </el-table-column>
      <el-table-column label="项目">
        <template slot-scope="scope">
          {{ scope.row.projectList.map((item) => item.name).join() }}
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
        width="420"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleUpdate(row)"> 编辑 </el-button>
          <el-button type="text" size="mini" @click="bindProject(row)">
            绑定项目
          </el-button>
          <el-button type="text" size="mini" @click="bindProject(row, 'unBind')">
            解绑项目
          </el-button>
          <el-button type="text" size="mini" @click="bindIssueType(row)">
            绑定事务类型
          </el-button>
          <el-button type="text" size="mini" @click="bindIssueType(row, 'unbind')">
            解绑事务类型
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
    <el-dialog title="项目绑定" :visible.sync="proVisible">
      <el-form
        ref="projectForm"
        :model="projectForm"
        :rules="projectRules"
        label-position="left"
        label-width="80px"
      >
        <el-form-item label="项目名称" prop="project">
          <el-select v-model="projectForm.project" placeholder="请选择">
            <el-option
              v-for="item in projectList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="proVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitProject">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="事务类型绑定" :visible.sync="issueTypeVisible">
      <el-form
        ref="issueTypeForm"
        :model="issueTypeForm"
        :rules="issueRules"
        label-position="left"
        label-width="80px"
      >
        <el-form-item label="事务类型" prop="type">
          <el-select v-model="issueTypeForm.type" placeholder="请选择">
            <el-option
              v-for="item in issueList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="issueTypeVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitIssue">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import "@/styles/common.scss";
import "@/styles/upload.scss";
import {
  getIssueSolutionList,
  solutionCreate,
  solutionEdit,
  solutionDelete,
  solutionBindProject,
  solutionUnBindProject,
  getList,
  solutionAddIssueType,
  solutionRemoveIssueType,
  solutionProjectList,
  solutionCopy,
} from "@/api/issueType";
import { getList as getAllProject } from "@/api/project";
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
      getIssueSolutionList({}).then((res) => {
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
            issueTypeSolutionId: this.temp.id,
            name: this.temp.name,
            description: this.temp.description,
          };
          solutionEdit(params).then(() => {
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
        issueTypeSolutionId: this.temp.issueTypeSolutionId,
      }).then(() => {
        this.doSuccess();
      });
    },
    handleCopy(row) {
      solutionCopy({
        issueTypeSolutionId: row.id,
      }).then(() => {
        this.doSuccess();
      });
    },
    getProjectList(queryString, cb) {
      if (this.unBind) {
        solutionProjectList({
          issueTypeSolutionId: this.temp.id,
        }).then((res) => {
          this.projectList = res.data;
        });
      } else {
        getAllProject({
          keyword: queryString,
          page: 0,
          size: 10,
        }).then((res) => {
          this.projectList = res.data.data;
        });
      }
    },
    bindProject(row, unBind) {
      this.projectForm.project = "";
      this.temp = row;
      this.proVisible = true;
      if (unBind) {
        this.unBind = true;
      } else {
        this.unBind = false;
      }
      this.getProjectList();
    },
    submitProject() {
      this.$refs["projectForm"].validate((valid) => {
        if (valid) {
          const params = {
            issueTypeSolutionId: this.temp.id,
            projectId: this.projectForm.project,
          };
          if (this.unBind) {
            solutionUnBindProject(params).then(() => {
              this.proVisible = false;
              this.doSuccess();
            });
          } else {
            solutionBindProject(params).then(() => {
              this.proVisible = false;
              this.doSuccess();
            });
          }
        }
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
    bindIssueType(row, unBind) {
      this.issueTypeForm.type = "";
      if (unBind) {
        this.unBind = true;
        this.issueList = row.issueTypeList;
      } else {
        this.unBind = false;
        this.getIssueList();
      }
      this.temp = row;
      this.issueTypeVisible = true;
    },
    getIssueList() {
      getList({}).then((res) => {
        this.issueList = res.data;
      });
    },
    submitIssue() {
      this.$refs["issueTypeForm"].validate((valid) => {
        if (valid) {
          const params = {
            issueTypeSolutionId: this.temp.id,
            issueTypeId: this.issueTypeForm.type,
          };
          if (this.unBind) {
            solutionRemoveIssueType(params).then(() => {
              this.issueTypeVisible = false;
              this.doSuccess();
            });
          } else {
            solutionAddIssueType(params).then(() => {
              this.issueTypeVisible = false;
              this.doSuccess();
            });
          }
        }
      });
    },
  },
};
</script>
