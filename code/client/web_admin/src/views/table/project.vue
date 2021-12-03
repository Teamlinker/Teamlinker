<!--
 * @Descripttion:
 * @version:
 * @Author: gqwu
 * @Date: 2021-10-09 12:19:05
 * @LastEditors: gqwu
 * @LastEditTime: 2021-12-03 14:41:54
-->
<template>
  <div class="app-container">
    <el-row style="padding-bottom: 10px">
      <el-button type="primary" size="small" @click="handleCreate"
        >新增项目</el-button
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
      <el-table-column label="关键字">
        <template slot-scope="scope">
          {{ scope.row.keyword }}
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="text" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="text" size="mini" @click="handleRemove(row)">
            删除
          </el-button>
          <el-button type="text" size="mini" @click="handleTag(row)">
            标签管理
          </el-button>
          <el-button type="text" size="mini" @click="handleModule(row)">
            模块管理
          </el-button>
          <el-button type="text" size="mini" @click="handleMember(row)">
            成员管理
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="temp.keyword" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-upload
            class="avatar-uploader"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
          >
            <img v-if="temp.image" :src="temp.image" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="请输入描述"
          />
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

    <el-dialog title="标签管理" :visible.sync="dialogTagVisible">
      <el-row style="padding-bottom: 10px">
        <el-button type="primary" size="small" @click="handleCreateTag"
          >新增标签</el-button
        >
      </el-row>
      <el-table :data="taglist" border fit highlight-current-row>
        <el-table-column align="center" label="序号" width="95">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="名称">
          <template slot-scope="scope">
            <template v-if="scope.row.edit">
              <el-input
                v-model="scope.row.name"
                class="edit-input"
                size="small"
              />
              <el-button
                class="cancel-btn"
                size="small"
                icon="el-icon-refresh"
                type="warning"
                @click="cancelEdit(scope.row)"
              >
                取消
              </el-button>
            </template>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="230"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button
              v-if="row.edit"
              type="success"
              size="small"
              icon="el-icon-circle-check-outline"
              @click="handleUpdateTag(row)"
            >
              更新
            </el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="row.edit = !row.edit"
            >
              编辑
            </el-button>
            <el-button type="primary" size="mini" @click="handleTagRemove(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination_box">
        <el-pagination
          layout="prev, pager, next"
          background
          :total="tagpage.pageCount"
          @current-change="tagPageCurChange"
        >
        </el-pagination>
      </div>
    </el-dialog>

    <el-dialog title="新增" :visible.sync="dialogTagFormVisible">
      <el-form
        ref="dataTagForm"
        :rules="tagrules"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="tag名称" prop="tempTag.name">
          <el-input v-model="tempTag.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTagFormVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="createTagData()"> 确定 </el-button>
      </div>
    </el-dialog>

    <el-dialog title="模块管理" :visible.sync="dialogModuleVisible">
      <!-- <el-row style="padding-bottom: 10px">
        <el-button type="primary" size="small" @click="createModuleData"
          >新增模块</el-button
        >
      </el-row> -->
      <el-tree
        :data="data"
        :props="{
          label: 'name',
          children: 'data',
        }"
        show-checkbox
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <el-button type="text" size="mini" @click="() => append(data)">
              添加
            </el-button>
            <el-button
              type="text"
              size="mini"
              v-if="data.id != null"
              @click="() => update(node, data)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="mini"
              v-if="data.id != null"
              @click="() => remove(node, data)"
            >
              删除
            </el-button>
          </span>
        </span>
      </el-tree>
    </el-dialog>

    <el-dialog
      :title="textModuleMap[dialogModlueStatus]"
      :visible.sync="dialogModuleFormVisible"
    >
      <el-form
        ref="dataModuleForm"
        :rules="tagrules"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="模块名称" prop="tempModule.name">
          <el-input v-model="tempModule.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogModuleFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="
            dialogModlueStatus === 'create'
              ? createModuleData()
              : updateModuleData()
          "
        >
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="成员管理" :visible.sync="dialogMemberVisible">
      <el-row style="padding-bottom: 10px">
        <el-button type="primary" size="small" @click="handleCreateMember"
          >新增成员</el-button
        >
      </el-row>
      <el-table :data="memberlist" border fit highlight-current-row>
        <el-table-column align="center" label="序号" width="95">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="姓名">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="角色">
          <template slot-scope="scope">
            {{ scope.row.role.name }}
          </template>
        </el-table-column>

        <el-table-column align="center" label="类型">
          <template slot-scope="scope">
            <span v-if="scope.row.type == '0'">用户</span>
            <span v-else-if="scope.row.type == '1'">团队</span>
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          align="center"
          width="100"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleMemberRemove(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination_box">
        <el-pagination
          layout="prev, pager, next"
          background
          :total="memberPage.pageCount"
          @current-change="memberPageCurChange"
        >
        </el-pagination>
      </div>
    </el-dialog>

    <el-dialog title="新增" :visible.sync="dialogMemberFormVisible">
      <el-form
        ref="dataMemberForm"
        :rules="memberrules"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="用户">
          <el-select v-model="tempMember.memberId" placeholder="请选择">
            <el-option
              v-for="item in membersOptions"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="类型">
          <el-select v-model="tempMember.type" placeholder="请选择">
            <el-option
              v-for="item in typeOptions"
              :key="item.id"
              :label="item.label"
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
        <el-button type="primary" @click="createMemberData()"> 确定 </el-button>
      </div>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
      <span>确认删除吗</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="removeData">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="dialogTagTipVisible" width="30%">
      <span>确认删除吗</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogTagTipVisible = false">取 消</el-button>
        <el-button type="primary" @click="removeTagData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<script>
import "@/styles/common.scss";
import {
  getList,
  createTemp,
  editTemp,
  viewTemp,
  removeTemp,
  getTagList,
  createTagTemp,
  editTagTemp,
  removeTagTemp,
  getModuleList,
  createModuleTemp,
  editModuleTemp,
  removeModuleTemp,
  getMemberList,
  createMemberTemp,
  editMemberTemp,
  removeMemberTemp,
  projectRoles,
} from "@/api/project";
import { getList as getAllMemberList } from "@/api/user";
let id = 1000;
export default {
  data() {
    return {
      list: null,
      listLoading: true,
      textMap: {
        update: "编辑",
        create: "创建",
      },
      textModuleMap: {
        update: "编辑",
        create: "创建",
      },
      dialogStatus: "",
      dialogModlueStatus: "",
      dialogFormVisible: false,
      dialogTagFormVisible: false,
      rules: {
        keyword: [{ required: true, message: "关键字必填", trigger: "blur" }],
        name: [{ required: true, message: "名称必填", trigger: "blur" }],
      },
      tagrules: {
        name: [{ required: true, message: "名称必填", trigger: "blur" }],
      },
      memberrules: {},
      temp: {
        projectId: undefined,
        keyword: "",
        name: "",
        image: "",
        description: "",
      },
      tempTag: {
        tagId: undefined,
        name: "",
      },
      dialogVisible: false,
      dialogTagVisible: false,
      taglist: null,
      dialogTagTipVisible: false,
      page: {
        pageIndex: 0,
        pageSize: 10,
        pageCount: 0,
      },
      tagpage: {
        pageIndex: 0,
        pageSize: 10,
        pageCount: 0,
      },
      memberPage: {
        pageIndex: 0,
        pageSize: 10,
        pageCount: 0,
      },
      dialogModuleVisible: false,
      data: [
        {
          id: null,
          name: "",
          disabled: true,
          data: [],
        },
      ],
      dialogMemberVisible: false,
      memberlist: null,
      dialogMemberFormVisible: false,
      membersOptions: null,
      rolesOptions: null,
      typeOptions: [
        {
          id: "0",
          label: "用户",
        },
        {
          id: "1",
          label: "团队",
        },
      ],
      tempMember: {
        projectId: "",
        memberId: "",
        roleId: "",
        type: "0",
      },
      dialogModuleFormVisible: false,
      tempModule: {
        name: "",
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
        keyword: "",
        page: this.page.pageIndex,
        size: this.page.pageSize,
      }).then((res) => {
        this.list = res.data.data;
        this.page.pageCount = parseInt(res.data.count);
        this.listLoading = false;
      });
    },
    resetTemp() {
      this.temp = {
        projectId: undefined,
        keyword: "",
        name: "",
        image: "",
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
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
      viewTemp({ projectId: row.projectId }).then((res) => {
        this.temp = res.data;
        this.dialogFormVisible = true;
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.temp.image = "000";
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
      this.dialogVisible = true;
      this.temp.projectId = row.id;
    },
    removeData() {
      removeTemp({ projectId: this.temp.projectId }).then((res) => {
        if (res.code == "0") {
          this.$notify({
            title: "Success",
            message: "删除成功",
            type: "success",
            duration: 2000,
          });
          this.dialogVisible = false;
          this.fetchData();
        }
      });
    },
    handleTag(row) {
      this.temp.projectId = row.id;
      this.dialogTagVisible = true;
      this.fetchTagList();
    },
    fetchTagList() {
      getTagList({
        projectId: this.temp.projectId,
        keyword: "",
        page: this.tagpage.pageIndex,
        size: this.tagpage.pageSize,
      }).then((res) => {
        if (res.code == "0") {
          let data = res.data.data;
          data.forEach((item) => {
            item.edit = false;
            item.originalName = item.name;
          });
          this.taglist = data;
          this.tagpage.pageCount = res.count;
        }
      });
    },
    handleCreateTag(row) {
      this.tempTag = {
        tagId: undefined,
        name: "",
      };
      this.dialogTagFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataTagForm"].clearValidate();
      });
    },
    createTagData() {
      createTagTemp({
        projectId: this.temp.projectId,
        name: this.tempTag.name,
      }).then((res) => {
        if (res.code == "0") {
          this.dialogTagFormVisible = false;
          this.$notify({
            title: "Success",
            message: "创建成功",
            type: "success",
            duration: 2000,
          });
          this.fetchTagList();
        }
      });
    },
    handleUpdateTag(row) {
      row.edit = !row.edit;
      editTagTemp({ tagId: row.id, name: row.name }).then((res) => {
        if (res.code == "0") {
        }
      });
    },
    cancelEdit(row) {
      row.name = row.originalName;
      row.edit = false;
    },
    handleTagRemove(row) {
      this.dialogTagTipVisible = true;
      this.temp.tagId = row.id;
    },
    removeTagData() {
      removeTagTemp({ tagId: this.temp.tagId }).then((res) => {
        if (res.code == "0") {
          this.$notify({
            title: "Success",
            message: "删除成功",
            type: "success",
            duration: 2000,
          });
          this.dialogTagTipVisible = false;
          this.fetchTagList();
        }
      });
    },
    pageCurChange(page) {
      this.page.pageIndex = page - 1;
      this.fetchData();
    },
    tagPageCurChange(page) {
      this.tagpage.pageIndex = page - 1;
      this.fetchTagList();
    },
    handleModule(row) {
      this.dialogModuleVisible = true;
      this.temp.projectId = row.id;
      this.data[0].name = row.name;
      this.fetchModuleData();
    },
    fetchModuleData() {
      getModuleList({ projectId: this.temp.projectId }).then((res) => {
        if (res.code == "0") {
          if (res.data.length > 0) {
            this.data[0].data = res.data;
            console.log(this.data);
          }
        }
      });
    },
    createModuleData() {
      createModuleTemp({
        projectId: this.temp.projectId,
        parentModuleId: this.temp.parentModuleId,
        name: this.tempModule.name,
      }).then((res) => {
        if (res.code == "0") {
          this.dialogModuleFormVisible = false;
          this.fetchModuleData();
        }
      });
    },
    updateModuleData() {
      editModuleTemp({
        parentModuleId: this.temp.parentModuleId,
        name: this.tempModule.name,
        moduleId: this.temp.moduleId,
      }).then((res) => {
        if (res.code == "0") {
          this.dialogModuleFormVisible = false;
          this.fetchModuleData();
        }
      });
    },
    append(data) {
      this.tempModule.name = "";
      this.temp.parentModuleId = data.id;
      this.dialogModuleFormVisible = true;
      this.dialogModlueStatus = "create";
    },
    remove(node, data) {
      let moduleId = data.id;
      this.$confirm("确定, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          removeModuleTemp({ moduleId: moduleId }).then((res) => {
            this.fetchModuleData();
            this.$notify({
              title: "Success",
              message: "删除成功",
              type: "success",
              duration: 2000,
            });
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    update(node, data) {
      this.tempModule.name = data.name;
      this.temp.parentModuleId = node.parent.data.id;
      this.temp.moduleId = data.id;
      this.dialogModuleFormVisible = true;
      this.dialogModlueStatus = "update";
    },
    fetchMemberData() {
      getMemberList({
        projectId: this.temp.projectId,
        page: this.memberPage.pageIndex,
        size: this.memberPage.pageSize,
      }).then((res) => {
        this.memberlist = res.data.data;
        this.memberPage.pageCount = parseInt(res.count);
      });
    },
    handleMember(row) {
      this.temp.projectId = row.id;
      this.dialogMemberVisible = true;
      this.fetchMemberData();
    },
    handleCreateMember(row) {
      this.dialogMemberFormVisible = true;
      this.temp.memberId = row.id;
      this.getMembers();
      this.getRoles();
      this.tempMember.memberId = "";
      this.tempMember.roleId = "";
      this.tempMember.type = "0";
    },
    createMemberData() {
      createMemberTemp({
        projectId: this.temp.projectId,
        memberId: this.tempMember.memberId,
        type: this.tempMember.type,
        roleId: this.tempMember.roleId,
      }).then((res) => {
        this.fetchMemberData();
        this.dialogMemberFormVisible = false;
      });
    },
    updateMemberData() {
      editMemberTemp({}).then((res) => {});
    },
    handleMemberRemove(row) {
      this.$confirm("确定, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          removeMemberTemp({
            projectId: this.temp.projectId,
            memberId: row.id,
          }).then((res) => {
            this.fetchMemberData();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    memberPageCurChange(page) {
      this.memberPage.pageIndex = page - 1;
      this.fetchMemberData();
    },
    getRoles() {
      projectRoles({ projectId: this.temp.projectId }).then((res) => {
        this.rolesOptions = res.data;
      });
    },
    getMembers() {
      getAllMemberList({
        keyword: "",
        page: 0,
        size: 1000,
      }).then((res) => {
        this.membersOptions = res.data.data;
      });
    },
  },
};
</script>
