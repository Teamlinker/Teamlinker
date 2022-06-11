<template>
  <div class="app-container">
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="temp"
      label-position="left"
      label-width="90px"
      style="width: 500px; margin-left: 50px"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="temp.name" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="temp.description" />
      </el-form-item>

      <el-form-item label="photo" prop="photo">
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

    <div slot="footer" class="dialog-footer" style="margin-left: 150px">
      <el-button type="warning" @click="handleRemove()"> 删除 </el-button>
      <el-button type="primary" @click="updateData()"> 确定 </el-button>
    </div>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
      <span>确认删除吗</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="removeData">确 定</el-button>
      </span>
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
  removeTemp,
  getDetail,
} from "@/api/organization";
import { fromTime } from "@/utils/utils";
import { uploadFile } from "@/api/file";
export default {
  data() {
    return {
      listQuery: { keyword: "" },
      list: null,
      listLoading: true,
      textMap: {
        update: "编辑",
        create: "创建",
      },
      adminOpt: [
        { label: "是", value: 1 },
        { label: "否", value: 0 },
      ],
      dialogStatus: "",
      dialogFormVisible: false,
      rules: {
        name: [{ required: true, message: "名称必填", trigger: "blur" }],
      },
      temp: {
        organizationId: undefined,
      },
      dialogVisible: false,
      page: {
        pageIndex: 0,
        pageSize: 10,
        pageCount: 0,
      },
      imageUrl: "",
      domain: "",
    };
  },
  created() {
    this.domain = process.env.VUE_APP_BASE_DOMAIN;
    this.getDetail();
  },
  methods: {
    getDetail() {
      getDetail({
        organizationId: localStorage.getItem("organizationid"),
      }).then((res) => {
        if (res.code == 0) {
          this.temp = res.data;
          if (res.data.photo) {
            this.imageUrl = this.domain + res.data.photo;
          }
        }
      });
    },
    fetchData() {
      this.listLoading = true;
      getList({
        keyword: this.listQuery.keyword,
        page: this.page.pageIndex,
        size: this.page.pageSize,
      }).then((res) => {
        var data = res.data.create;
        data.forEach((item) => {
          item.created_time = this.moment(item.created_time).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          item.modified_time = this.moment(item.modified_time).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          item.originActive = item.active;
        });
        this.list = data;
        this.page.pageCount = parseInt(res.data.count);
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
        organizationId: "",
        name: "",
        description: "",
        photo: "",
        active: "",
      };
      this.imageUrl = "";
      this.localImgUrl = "";
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    handleEdit(row) {
      this.dialogStatus = "update";
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
      this.temp = Object.assign({}, row);
      this.imageUrl = row.photo ? this.domain + row.photo : "";
      this.dialogFormVisible = true;
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          createTemp(this.temp).then(() => {
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
          tempData.organizationId = localStorage.getItem("organizationid");
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
    handleRemove() {
      this.dialogVisible = true;
    },
    removeData() {
      removeTemp({ organizationId: this.temp.organizationId }).then((res) => {
        this.$message({
          message: "删除成功",
          type: "success",
        });
        this.$router.push({
          path: "/dashboard",
        });
        this.dialogVisible = false;
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
        this.imageUrl = this.localImgUrl;
        this.temp.photo = res.data;
      });
    },
    deleteImg() {
      this.imageUrl = "";
      this.localImgUrl = "";
      this.temp.photo = null;
    },
    activeChange(row) {
      activeTemp({ active: row.active, userId: row.id }).then((res) => {
        if (res.code == "0") {
          this.$notify({
            title: "Success",
            message: "操作成功",
            type: "success",
            duration: 2000,
          });
          row.originActive = row.active;
        } else {
          row.active = row.originActive;
        }
      });
    },
    handleResetPwd(row) {
      resetPwd({ userId: row.id, password: "000000" }).then((res) => {
        if (res.code == "0") {
          this.$notify({
            title: "Success",
            message: "操作成功",
            type: "success",
            duration: 2000,
          });
        }
      });
    },
    pageCurChange(page) {
      this.page.pageIndex = page - 1;
      this.fetchData();
    },
  },
};
</script>
