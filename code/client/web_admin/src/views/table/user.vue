<!--
 * @Descripttion:
 * @version:
 * @Author: gqwu
 * @Date: 2021-10-09 12:19:05
 * @LastEditors: gqwu
 * @LastEditTime: 2021-12-07 17:07:15
-->
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
      <el-button type="primary" size="small" @click="handleCreate">新增用户</el-button>
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
      <el-table-column label="用户名">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="标题">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="签名">
        <template slot-scope="scope">
          {{ scope.row.sign }}
        </template>
      </el-table-column>
      <el-table-column label="头像">
        <template slot-scope="scope">
          <div>
            <img :src="domain + scope.row.photo" height="60" v-if="scope.row.photo" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="邮箱">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column label="手机号">
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column label="地址">
        <template slot-scope="scope">
          {{ scope.row.location }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_time }}
        </template>
      </el-table-column>
      <el-table-column label="最后修改时间">
        <template slot-scope="scope">
          {{ scope.row.modified_time }}
        </template>
      </el-table-column>
      <!-- <el-table-column label="状态">
        <template slot-scope="scope">
          <span v-if="scope.row.originActive == '1'">启用</span>
          <span v-else-if="scope.row.originActive == '0'">禁用</span>
        </template>
      </el-table-column> -->

      <el-table-column
        label="启用/禁用"
        align="center"
        width="150"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.active"
            active-text="启用"
            inactive-text="禁用"
            :active-value="1"
            :inactive-value="0"
            @change="activeChange(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="120"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <!-- <el-button type="text" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button> -->
          <el-button type="text" size="mini" @click="handleEdit(row)"> 编辑 </el-button>
          <el-button type="text" size="mini" @click="handleRemove(row)"> 删除 </el-button>
          <el-button type="text" size="mini" @click="handleResetPwd(row)">
            重置密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination_box">
      <el-pagination
        layout="prev, pager, next"
        background
        :total="page.pageCount"
        @current-change="pageCurChange"
      >
      </el-pagination>
    </div>

    <el-dialog
      background
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="90px"
        style="width: 500px; margin-left: 50px"
      >
        <el-form-item label="名称" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogStatus === 'create'">
          <el-input v-model="temp.password" show-password />
        </el-form-item>
        <el-form-item label="是否管理员" prop="is_admin">
          <el-select v-model="temp.is_admin" placeholder="请选择">
            <el-option
              v-for="item in adminOpt"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="photo">
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
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item label="签名" prop="sign">
          <el-input v-model="temp.sign" />
        </el-form-item>
        <el-form-item label="地址" prop="location">
          <el-input v-model="temp.location" />
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
  activeTemp,
  resetPwd,
} from "@/api/user";
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
        username: [{ required: true, message: "用户名必填", trigger: "blur" }],
        password: [{ required: true, message: "密码必填", trigger: "blur" }],
      },
      temp: {
        userId: undefined,
        username: "",
        password: "",
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
    this.fetchData();
    this.domain = process.env.VUE_APP_BASE_DOMAIN;
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      getList({
        keyword: this.listQuery.keyword,
        page: this.page.pageIndex,
        size: this.page.pageSize,
      }).then((res) => {
        var data = res.data.data;
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
        userId: undefined,
        username: "",
        password: "",
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
          const {
            photo,
            sign,
            title,
            username,
            phone,
            is_admin,
            email,
            location,
          } = tempData;
          const params = {
            userId: tempData.id,
            phone: phone,
            photo: photo,
            sign: sign,
            title: title,
            username: username,
            is_admin: is_admin,
            email: email,
            location: location,
          };
          if (params.photo.indexOf("file") > 0) {
            delete params.photo;
          }
          editTemp(params).then(() => {
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
      this.dialogVisible = true;
      this.temp.userId = row.id;
    },
    removeData() {
      removeTemp({ userId: this.temp.userId }).then((res) => {
        this.fetchData();
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
        _this.imageUrl = e.target.result; //将图片路径赋值给src
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
        this.temp.photo = res.data;
      });
    },
    deleteImg() {
      this.imageUrl = "";
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
