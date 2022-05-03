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
          <div>
            <img :src="domain + scope.row.icon" height="60" v-if="scope.row.icon" />
          </div>
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
        <template slot-scope="{ row }" v-if="row.reserved !== 1">
          <el-button type="text" size="mini" @click="handleUpdate(row)"> 编辑 </el-button>
          <el-button type="text" size="mini" @click="handleRemove(row)"> 删除 </el-button>
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
        <el-form-item label="图标" prop="icon">
          <el-upload
            class="avatar-uploader"
            action="/api/file/upload"
            accept="image/jpeg,image/jpg,image/png"
            ref="my-upload"
            :on-change="onchange"
            :http-request="submitUpload"
            :show-file-list="false"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <i v-if="!imageUrl" class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
          <div style="margin-left: 80px" v-if="imageUrl">
            <i class="el-icon-delete" @click="deleteImg()"></i>
          </div>
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
import { getList, createTemp, editTemp, viewTemp, removeTemp } from "@/api/issueType";
import { uploadFile, downFile } from "@/api/file";
export default {
  data() {
    return {
      listQuery: { keyword: "" },
      list: null,
      domain: "",
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
      temp: { name: "", description: "" },
      issueRules: {
        name: [{ required: true, message: "名称必填", trigger: "blur" }],
      },
      imageUrl: "",
    };
  },
  created() {
    this.fetchData();
    this.domain = process.env.VUE_APP_BASE_DOMAIN;
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
          item.modify_time = this.moment(item.modify_time).format("YYYY-MM-DD HH:mm:ss");
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
        icon: null,
        description: "",
      };
      this.imageUrl = "";
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
      this.temp = Object.assign({}, row);
      this.imageUrl = row.icon ? this.domain + row.icon : "";
      this.dialogFormVisible = true;
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          createTemp({
            name: this.temp.name,
            description: this.temp.description,
            icon: this.temp.icon,
          }).then(() => {
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
          tempData.issueTypeId = this.temp.id;
          if (tempData.icon && tempData.icon.indexOf("file") > 0) {
            delete tempData.icon;
          }
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
    //当上传图片后，调用onchange方法，获取图片本地路径
    onchange(file, fileList) {
      var _this = this;
      var event = event || window.event;
      var file = event.target.files[0];
      var reader = new FileReader();
      //转base64
      reader.onload = function (e) {
        _this.localImgUrl = e.target.result; //将图片路径赋值给src
      };
      reader.readAsDataURL(file);
    },
    submitUpload(params) {
      const fileObj = params.file;
      // FormData 对象
      const form = new FormData();
      // 文件对象
      form.append("file", fileObj);
      // 调用保存接口 将form的值全都传过去
      uploadFile(form).then((res) => {
        console.log(res, "resss");
        this.temp.icon = res.data;
        this.imageUrl = this.localImgUrl;
      });
    },
    deleteImg() {
      this.imageUrl = "";
      this.temp.icon = null;
    },
    downFile() {
      downFile({ fileId: "11" }).then((res) => {
        debugger;
      });
    },
  },
};
</script>
<style scoped lang="scss">
img-div {
  width: 180px;
  height: 180px;
  margin-right: 15px;
  position: relative;
  .delete-img {
    display: none;
  }
  &:hover {
    .delete-img {
      display: block;
      position: absolute;
      width: 180px;
      height: 40px;
      line-height: 40px;
      left: 0px;
      top: 140px;
      background: rgba(59, 60, 61, 0.5);
      // box-sizing: content-box;
      z-index: 999;
      cursor: pointer;
      text-align: right;
      i {
        margin: 8px 10px 0 0;
        display: block;
        font-size: 24px;
        color: white;
      }
    }
  }
  img {
    border: 1px dashed #d9d9d9;
    border-radius: 5px;
    box-sizing: border-box;
    width: 180px;
    height: 180px;
    margin-top: 0px;
    &:hover {
      border: 1px dashed #409eff;
    }
  }
}
</style>
