<template>
  <div class="app-container">
    <span>Select a Field Type</span>
    <el-select v-model="value" filterable placeholder="请选择">
      <el-option
        v-for="item in options"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      >
      </el-option>
    </el-select>
    <!-- datepicker start -->
    <div>

    </div>
     <!-- datepicker endy -->
  </div>
</template>
<script>
import "@/styles/common.scss";
import { fieldTypeList } from "@/api/fieldSolution";
import { workflowDetail } from "@/api/workflow";

export default {
  data() {
    return {
      options: [],
      value: "",
    };
  },
  methods: {
    getFieldTypeList() {
      fieldTypeList({}).then((res) => {
        this.options = res.data;
      });
    },
  },
  created() {
    this.getFieldTypeList();
  },
};
</script>
<style lang="scss" scoped>
</style>

