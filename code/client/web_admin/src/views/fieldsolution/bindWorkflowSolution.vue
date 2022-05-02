<template>
  <div class="app-container">
    <div class="bind-area">
      <div class="title">Bind workflow solution</div>
      <el-select v-model="value" filterable placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
      <div class="btn-area">
        <el-button type="primary" size="small" @click="handleNext">next</el-button>
        <el-button type="info" size="small" @click="handleCancel">cancel</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import "@/styles/common.scss";
import { solutionList } from "@/api/workflow";
import { bindFieldSolution } from "@/api/fieldSolution";
export default {
  data() {
    return {
      options: [],
      value: "",
    };
  },
  methods: {
    fetchData() {
      solutionList({}).then((res) => {
        this.options = res.data;
      });
    },
    handleNext() {
      if (this.value == "") {
        this.$notify({
          title: "warning",
          message: "please select workflow solution",
          type: "warning",
        });
        return;
      }
      bindFieldSolution({
        fieldSolutionId: this.$route.query.fieldSolutionId,
        workflowSolutionId: this.value,
      })
        .then((res) => {
          this.$router.push({
            path: "/example/selectWorkflow",
            query: {
              fieldSolutionId: this.$route.query.fieldSolutionId,
              workflowSolutionId: this.value,
            },
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    handleCancel() {
      this.$router.push({
        path: "/example/fieldList",
        query: {},
      });
    },
  },
  created() {
    this.fetchData();
  },
};
</script>
<style lang="scss" scoped>
.app-container {
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
  .title {
    padding: 20px 0;
  }
  .btn-area {
    margin-top: 150px;
  }
}
</style>
