<!--
 * @Descripttion:
 * @version:
 * @Author: gqwu
 * @Date: 2021-10-09 12:19:05
 * @LastEditors: gqwu
 * @LastEditTime: 2021-12-01 19:47:42
-->
<template>
  <div class="app-container">
    <el-row style="padding-bottom: 10px">
      <el-button type="primary" size="small" @click="handleCreate"
        >新增团队</el-button
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
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="text" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="text" size="mini" @click="handleRemove(row)">
            删除
          </el-button>
          <el-button type="text" size="mini" @click="handleTeamInfo(row)">
            团队成员
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
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
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

    <el-dialog background title="团队成员" :visible.sync="dialogMemberVisible">
      <el-row style="padding-bottom: 10px">
        <el-button type="primary" size="small" @click="handleMemberCreate"
          >新增成员</el-button
        >
      </el-row>

      <el-table
        :data="memberList"
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
        <el-table-column label="姓名">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="photo">
          <template slot-scope="scope">
            {{ scope.row.photo }}
          </template>
        </el-table-column>
        <el-table-column label="权限">
          <template slot-scope="scope">
            {{ scope.row.role.name }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="150"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row, $index }">
            <el-button type="text" size="mini" @click="handleMmberUpdate(row)">
              修改权限
            </el-button>
            <el-button type="text" size="mini" @click="handleMemberRemove(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog :title="memberTitle" :visible.sync="dialogMemberFormVisible">
      <el-form
        ref="dataMemberForm"
        :rules="memberrules"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="用户">
          <el-select
            v-model="tempMember.userId"
            placeholder="请选择"
            :disabled="userDisabled"
          >
            <el-option
              v-for="item in usersOptions"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="tempMember.roleId" placeholder="请选择">
            <el-option
              v-for="item in rolesOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogMemberFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="userDisabled ? updateMemberData() : createMemberData()"
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
  getList,
  createTemp,
  editTemp,
  removeTemp,
  teamMembers,
  teamRoles,
  removeMemberTemp,
  createMemberTemp,
  updateMemberTemp,
} from "@/api/team";
import { getList as getMemberList } from "@/api/user";
import { fromTime } from "@/utils/utils";
export default {
  data() {
    return {
      list: null,
      memberList: null,
      rolesOptions: null,
      usersOptions: null,
      listLoading: true,
      textMap: {
        update: "编辑",
        create: "创建",
      },
      dialogStatus: "",
      dialogFormVisible: false,
      rules: {
        name: [{ required: true, message: "名称必填", trigger: "blur" }],
      },
      memberrules: {},
      temp: {
        teamId: undefined,
        name: "",
      },
      dialogVisible: false,
      dialogMemberVisible: false,
      page: {
        pageIndex: 0,
        pageSize: 10,
        pageCount: 0,
      },
      dialogMemberFormVisible: false,
      tempMember: { userId: "", roleId: "" },
      memberTitle: "",
      userDisabled: true,
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      getList({
        keyword: "",
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
        });
        this.list = data;
        this.page.pageCount = parseInt(res.data.count);
        this.listLoading = false;
      });
    },
    resetTemp() {
      this.temp = {
        teamId: undefined,
        name: "",
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
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
      this.temp = row;
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
          editTemp({ teamId: this.temp.id, name: this.temp.name }).then(() => {
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
      this.temp.teamId = row.id;
    },
    removeData() {
      removeTemp({ teamId: this.temp.teamId }).then((res) => {
        this.fetchData();
        this.dialogVisible = false;
      });
    },
    fetchMemberData() {
      teamMembers({
        teamId: this.temp.teamId,
      }).then((res) => {
        this.memberList = res.data;
      });
    },
    handleTeamInfo(row) {
      this.dialogMemberVisible = true;
      this.temp.teamId = row.id;
      this.fetchMemberData();
    },
    pageCurChange(page) {
      this.page.pageIndex = page - 1;
      this.fetchData();
    },
    getRoles() {
      teamRoles({ teamId: this.temp.teamId }).then((res) => {
        this.rolesOptions = res.data;
      });
    },
    getUsers() {
      getMemberList({
        keyword: "",
        page: 0,
        size: 1000,
      }).then((res) => {
        this.usersOptions = res.data.data;
      });
    },
    handleMemberCreate() {
      this.tempMember.userId = "";
      this.tempMember.roleId = "";
      this.memberTitle = "新增成员";
      this.userDisabled = false;
      this.dialogMemberFormVisible = true;
      this.getRoles();
      this.getUsers();
    },
    createMemberData() {
      createMemberTemp({
        teamId: this.temp.teamId,
        userId: this.tempMember.userId,
        roleId: this.tempMember.roleId,
      }).then((res) => {
        this.$notify({
          title: "Success",
          message: "添加成功",
          type: "success",
          duration: 2000,
        });
        this.dialogMemberFormVisible = false;
        this.fetchMemberData();
      });
    },
    handleMemberRemove(row) {
      this.$confirm("确定, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.removeMemberData(row);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    removeMemberData(row) {
      removeMemberTemp({ teamId: this.temp.teamId, userId: row.id }).then(
        (res) => {
          this.fetchMemberData();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        }
      );
    },
    handleMmberUpdate(row) {
      this.memberTitle = "修改权限";
      this.userDisabled = true;
      this.dialogMemberFormVisible = true;
      this.getUsers();
      this.getRoles();
      this.tempMember.userId = row.id;
      this.tempMember.roleId = "";
    },
    updateMemberData() {
      updateMemberTemp({
        teamId: this.temp.teamId,
        userId: this.tempMember.userId,
        roleId: this.tempMember.roleId,
      }).then((res) => {
        this.$notify({
          title: "Success",
          message: "修改成功",
          type: "success",
          duration: 2000,
        });
        this.dialogMemberFormVisible = false;
        this.fetchMemberData();
      });
    },
  },
};
</script>
