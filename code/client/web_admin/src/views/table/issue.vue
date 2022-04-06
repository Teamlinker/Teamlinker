<template>
  <div class="app-container">
    <el-row style="padding-bottom: 10px">
      <el-button type="primary" size="small" @click="handleCreate"
        >新增事务类型</el-button
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
      <el-table-column label="图标">
        <template slot-scope="scope">
          {{ scope.row.icon }}
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
          <el-button type="text" size="mini" @click="handleUpdate(row)">
            编辑
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
        :rules="issueRules"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" :rows="2" v-model="temp.description" />
        </el-form-item>
        <!-- <el-form-item label="图标" prop="icon">
          <el-upload
            class="avatar-uploader"
            action="/api/file/upload"
            accept="image/jpeg,image/jpg,image/png"
            ref="my-upload"
            :http-request="submitUpload"
          >
            <img v-if="temp.icon" :src="temp.icon" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item> -->
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
  getList,
  createTemp,
  editTemp,
  viewTemp,
  removeTemp,
} from "@/api/issueType";
import { uploadFile, downFile } from "@/api/file";
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
      temp: {name:'',description:''},
      issueRules: {
        name: [{ required: true, message: "名称必填", trigger: "blur" }],
      },
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      getList({
        // keyword: this.listQuery.keyword,
        // page: this.page.pageIndex,
        // size: this.page.pageSize,
      }).then((res) => {
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
        icon: "",
        description: "",
      };
      // this.$refs["my-upload"].clearFiles();
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
      this.temp = row;
      this.dialogFormVisible = true;
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          createTemp({ name: this.temp.name,description:this.temp.description }).then(() => {
            this.fetchData();
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "创建成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          editTemp(tempData).then(() => {
            this.fetchData();
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "更新成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleRemove(row) {
      this.temp.issueTypeId = row.id;
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
      removeTemp({ issueTypeId: this.temp.issueTypeId }).then((res) => {
        if (res.code == "0") {
          this.$notify({
            title: "Success",
            message: "删除成功",
            type: "success",
            duration: 2000,
          });
          this.fetchData();
        }
      });
    },

    submitUpload(params) {
      const fileObj = params.file;
      // FormData 对象
      const form = new FormData();
      // 文件对象
      form.append("file", fileObj);
      // 调用保存接口 将form的值全都传过去
      uploadFile(form).then((res) => {
        this.temp.icon = res.data;
      });
    },
    downFile() {
      downFile({ fileId: "11" }).then((res) => {
        debugger;
      });
    },
  },
};
</script>
