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
import { addFieldValue, fieldDetails } from "@/api/fieldSolution";

export default {
  data() {
    return {
      value1: [],
      multiple: false,
      option: [
        { value: "user", label: "user" },
        { value: "release", label: "release" },
        { value: "issue", label: "issue" },
        { value: "module", label: "module" },
        { value: "tag", label: "tag" },
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
      if (this.$route.query.opeType == "edit") {
        this.handleUpdate();
        return;
      }
      return;
      let param = Object.assign(
        { data: this.option },
        {
          fieldSolutionWorkflowNodeFieldTypeId:
            this.$route.query.fieldSolutionWorkflowNodeFieldTypeId,
        }
      );
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
      this.getFieldDetails();
    }
  },
};
</script>
<style lang="scss" scoped>
</style>

