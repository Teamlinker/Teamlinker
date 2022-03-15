<template>
  <div class="app-container">
    <div>Edit Field</div>
    <!-- 单选类型是5，多选类型是6 -->
    <div>Config Select Value</div>
    <div>
      <el-form ref="ruleForm" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="name" prop="name">
          <el-input v-model="form.name" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="value" prop="value">
          <el-input v-model="form.value" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave('ruleForm')"
            >save</el-button
          >
          <el-button>cancel</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import "@/styles/common.scss";
import { addFieldValue } from "@/api/fieldSolution";

export default {
  data() {
    return {
      form: {
        name: "",
        value: "",
        selected:0 
      },
      rules: {
        name: [
          { required: true, message: "please input name", trigger: "blur" },
        ],
        value: [
          { required: true, message: "please input value", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    handleSave(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let param = Object.assign(this.form, {
            fieldSolutionWorkflowNodeFieldTypeId: this.$route.query.fieldSolutionWorkflowNodeFieldTypeId,
          });
          addFieldValue(param).then((res) => {
            this.$router.push({
              path: "/fieldSolution/workflowField",
              query: {
                fieldSolutionId: this.$route.query.fieldSolutionId,
                workflowId: this.$route.query.workflowId,
                workflowNodeId: this.$route.query.workflowNodeId,
                workflowSolutionId: this.$route.query.workflowSolutionId,
              },
            });
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
  created() {},
};
</script>
<style lang="scss" scoped>
</style>

