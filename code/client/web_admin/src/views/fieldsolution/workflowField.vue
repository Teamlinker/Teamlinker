<template>
  <div class="app-container">
    <div>Workflow node fields</div>
    <div>{{ workflowDetail.name || "-" }}</div>
    <div>{{ workflowDetail.description || "-" }}</div>
    <div>
      <el-button type="primary" size="small" @click="handleAdd">Add Field type</el-button>
    </div>
    <div>
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="Type">
          <template slot-scope="scope">
            {{ scope.row.fieldType.name }}
          </template>
        </el-table-column>
        <el-table-column label="Name">
          <template slot-scope="scope">
            {{ scope.row.field.name }}
          </template>
        </el-table-column>
        <el-table-column label="Description">
          <template slot-scope="scope">
            {{ scope.row.field.description }}
          </template>
        </el-table-column>
        <el-table-column label="Default value">
          <template slot-scope="scope">
            {{ scope.row.field.default_value }}
          </template>
        </el-table-column>
        <el-table-column label="Optional">
          <template slot-scope="scope">
            {{ scope.row.field.optional }}
          </template>
        </el-table-column>
        <el-table-column label="Weight">
          <template slot-scope="scope">
            {{ scope.row.field.weight }}
          </template>
        </el-table-column>
        <el-table-column
          label="operation"
          align="center"
          width="320"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleEdit(row)"> edit </el-button>
            <el-button type="text" size="mini" @click="handleCopy(row)"> copy </el-button>
            <el-button type="text" size="mini" @click="handleDelete(row)">
              delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="copy" :visible.sync="dialogFormVisible">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="150px"
        class="demo-ruleForm"
      >
        <el-form-item label="fieldSolution" prop="fieldSolution">
          <el-select
            v-model="ruleForm.fieldSolution"
            placeholder="please select fieldSolution"
            @change="fieldSolutionChange"
          >
            <el-option
              v-for="item in fieldSolutionListOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="workflowSolution" prop="workflowSolution">
          <el-select
            v-model="ruleForm.workflowSolution"
            placeholder="please select workflowSolution"
          >
            <el-option
              v-for="item in workflowSolutionListOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="workflow" prop="workflow">
          <el-select v-model="ruleForm.workflow" placeholder="please select workflow">
            <el-option
              v-for="item in workflowListOption"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="copy('ruleForm')"> 确定 </el-button>
          <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import "@/styles/common.scss";
import {
  workflowNodeList,
  deleteField,
  copyField,
  getFieldSolutionList,
  fieldSolutionDetail,
} from "@/api/fieldSolution";
import { workflowDetail, solutionList } from "@/api/workflow";

export default {
  data() {
    return {
      dialogFormVisible: false,
      workflowDetail: {
        name: "",
        description: "",
      },
      listLoading: false,
      list: [],
      ruleForm: {
        fieldSolution: "",
        workflowSolution: "",
        workflow: "",
      },
      rules: {
        fieldSolution: [
          {
            required: true,
            message: "please select fieldSolution",
            trigger: "change",
          },
        ],
        workflowSolution: [
          {
            required: true,
            message: "please select workflowSolution",
            trigger: "change",
          },
        ],
        workflow: [
          {
            required: true,
            message: "please select workflow",
            trigger: "change",
          },
        ],
      },
      fieldSolutionListOption: [],
      workflowSolutionListOption: [],
      workflowListOption: [],
    };
  },
  methods: {
    getWorkflowDetail() {
      workflowDetail({ workflowId: this.$route.query.workflowId }).then((res) => {
        this.workflowDetail = res.data;
      });
    },
    fetchData() {
      this.listLoading = true;
      let param = {
        fieldSolutionId: this.$route.query.fieldSolutionId,
        workflowNodeId: this.$route.query.workflowNodeId,
        workflowId: this.$route.query.workflowId,
        workflowSolutionId: this.$route.query.workflowSolutionId,
      };
      workflowNodeList(param).then((res) => {
        var data = res.data;
        this.list = data;
        this.listLoading = false;
      });
    },
    handleAdd() {
      this.$router.push({
        path: "/example/addWorkflowField",
        query: {
          fieldSolutionId: this.$route.query.fieldSolutionId,
          workflowNodeId: this.$route.query.workflowNodeId,
          workflowId: this.$route.query.workflowId,
          workflowSolutionId: this.$route.query.workflowSolutionId,
        },
      });
    },
    handleDelete(row) {
      deleteField({ fieldSolutionWorkflowNodeFieldTypeId: row.field.id }).then((res) => {
        this.$message({
          message: "delete success",
          type: "success",
        });
        this.fetchData();
      });
    },
    handleEdit(row) {
      this.$router.push({
        path: "/example/addWorkflowField2",
        query: {
          fieldSolutionId: this.$route.query.fieldSolutionId,
          workflowNodeId: this.$route.query.workflowNodeId,
          workflowId: this.$route.query.workflowId,
          workflowSolutionId: this.$route.query.workflowSolutionId,
          fieldSolutionWorkflowNodeFieldTypeId: row.field.id,
          fieldTypeId: row.fieldType.id,
          fieldType: row.fieldType.type,
          opeType: "edit",
        },
      });
    },
    getFieldSolutionListOption() {
      getFieldSolutionList().then((res) => {
        this.fieldSolutionListOption = res.data;
      });
    },
    getWorkflowSolutionList(param) {
      fieldSolutionDetail(param).then((res) => {
        debugger;
        this.workflowSolutionListOption = res.data;
      });
    },
    fieldSolutionChange(id) {
      debugger;
      this.getWorkflowSolutionList({ fieldTypeId: id });
    },
    handleCopy(row) {
      copyField({}).then((res) => {});
    },
    copy() {},
  },
  created() {
    this.getWorkflowDetail();
    this.fetchData();
    this.getFieldSolutionListOption();
  },
};
</script>
<style lang="scss" scoped></style>
