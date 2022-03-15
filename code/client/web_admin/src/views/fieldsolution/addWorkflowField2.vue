<template>
  <div class="app-container">
    <div>Edit Field</div>
    <div>
      <el-form ref="ruleForm" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="name" prop="name">
          <el-input v-model="form.name" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            type="textarea"
            v-model="form.description"
            style="width: 400px"
          ></el-input>
        </el-form-item>
        <el-form-item label="Default value">
          <el-input v-model="form.defaultValue" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="Optional">
          <el-switch
            :active-value="1"
            :inactive-value="0"
            v-model="form.optional"
          ></el-switch>
        </el-form-item>
        <el-form-item label="weight">
          <el-input v-model="form.weight" style="width: 200px"></el-input>
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
import { addField } from "@/api/fieldSolution";
import { workflowDetail } from "@/api/workflow";

export default {
  data() {
    return {
      form: {
        name: "",
        description: "",
        defaultValue: "",
        optional: 1,
        weight: 50,
      },
      rules: {
        name: [
          { required: true, message: "please input name", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    getWorkflowDetail() {
      workflowDetail({ workflowId: this.$route.query.workflowId }).then(
        (res) => {
          
        }
      );
    },
    handleSave(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let param = Object.assign(this.form, {
            fieldSolutionId: this.$route.query.fieldSolutionId,
            workflowNodeId: this.$route.query.workflowNodeId,
            fieldTypeId: this.$route.query.fieldTypeId,
            workflowId: this.$route.query.workflowId,
            workflowSolutionId: this.$route.query.workflowSolutionId,
          });
          addField(param).then((res) => {
            //单选-5和多选-6 单标签-2和多标签-1需要编辑值 其他的不需要跳到下一步编辑
            let fieldType = this.$route.query.fieldType;
            if (
              fieldType == 5 ||
              fieldType == 6 ||
              fieldType == 2 ||
              fieldType == 1
            ) {
              this.$router.push({
                path: "/fieldSolution/addWorkflowField3",
                query: {
                  fieldSolutionId: this.$route.query.fieldSolutionId,
                  workflowId: this.$route.query.workflowId,
                  workflowNodeId: this.$route.query.workflowNodeId,
                  workflowSolutionId: this.$route.query.workflowSolutionId,
                  fieldSolutionWorkflowNodeFieldTypeId: res.data.id,
                  fieldType: this.$route.query.fieldType,
                },
              });
            } else {
              this.$router.push({
                path: "/fieldSolution/workflowField",
                query: {
                  fieldSolutionId: this.$route.query.fieldSolutionId,
                  workflowId: this.$route.query.workflowId,
                  workflowNodeId: this.$route.query.workflowNodeId,
                  workflowSolutionId: this.$route.query.workflowSolutionId,
                },
              });
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
  created() {
    if (this.$route.query.opeType == "edit") {
      this.getWorkflowDetail();
    }
  },
};
</script>
<style lang="scss" scoped>
</style>

