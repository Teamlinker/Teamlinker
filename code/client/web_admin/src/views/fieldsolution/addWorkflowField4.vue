<template>
  <div class="app-container">
    <!-- 单标签-2和多标签-1 -->
    <div>Config Lable type</div>
    <div>
      <div style="margin-top: 20px">
        <el-select
          v-model="value1"
          :multiple="multiple"
          placeholder="please select"
        >
          <el-option
            v-for="item in option"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div style="margin-top: 20px">
        <el-button type="primary" @click="handleSave('ruleForm')"
          >save</el-button
        >
        <el-button>cancel</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import "@/styles/common.scss";
import {
  addFieldValue,
  fieldDetails,
  addFieldLabelValue,
} from "@/api/fieldSolution";

export default {
  data() {
    return {
      value1: [],
      multiple: false,
      option: [
        { value: "USER", label: "USER" },
        { value: "RELEASE", label: "RELEASE" },
        { value: "ISSUE", label: "ISSUE" },
        { value: "MODULE", label: "MODULE" },
        { value: "TAG", label: "TAG" },
      ],
    };
  },
  methods: {
    getFieldDetails() {
      fieldDetails({
        fieldSolutionWorkflowNodeFieldTypeId:
          this.$route.query.fieldSolutionWorkflowNodeFieldTypeId,
      }).then((res) => {
        this.option = res.data.values;
      });
    },
    handleSave(formName) {
      // if (this.$route.query.opeType == "edit") {
      //   this.handleUpdate();
      //   return;
      // }
      let param = {
        fieldSolutionWorkflowNodeFieldTypeId:
          this.$route.query.fieldSolutionWorkflowNodeFieldTypeId,
          labelType:this.value1
      };
      addFieldLabelValue(param).then((res) => {
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
    },
    handleUpdate() {
      this.$notify.info({
        title: "消息",
        message: "gengxinjiekou",
      });
    },
  },
  created() {
    if (this.$route.query.fieldType == 2) {
      this.multiple = false;
    } else {
      this.multiple = true;
    }
    if (this.$route.query.opeType == "edit") {
      // this.getFieldDetails();
    }
  },
};
</script>
<style lang="scss" scoped>
</style>

