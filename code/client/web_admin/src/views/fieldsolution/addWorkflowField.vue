<template>
  <div class="app-container">
    <div class="add-area">
      <div class="top">
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
      </div>
      <el-collapse accordion>
        <el-collapse-item>
          <template slot="title">
            Field List<i class="header-icon el-icon-info"></i>
          </template>
          <div>
            <el-row>
              <el-col :span="6"><div class="left">text</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-input placeholder="" :disabled="true"> </el-input></div
              ></el-col>
            </el-row>

            <el-row>
              <el-col :span="6"><div class="left">textarea</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-input placeholder="" type="textarea" :rows="2" :disabled="true">
                  </el-input></div
              ></el-col>
            </el-row>
            <el-row>
              <el-col :span="6"><div class="left">select list（single）</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-select disabled placeholder="请选择">
                    <el-option> </el-option>
                  </el-select></div
              ></el-col>
            </el-row>
            <el-row>
              <el-col :span="6"><div class="left">select list（multiple）</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-select v-model="value1" disabled multiple placeholder="请选择">
                    <el-option> </el-option>
                  </el-select></div
              ></el-col>
            </el-row>
            <el-row>
              <el-col :span="6"><div class="left">switch</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-switch disabled> </el-switch></div
              ></el-col>
            </el-row>
            <el-row>
              <el-col :span="6"><div class="left">timepicker</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-time-select v-model="value2" disabled placeholder="选择时间">
                  </el-time-select></div
              ></el-col>
            </el-row>
            <el-row>
              <el-col :span="6"><div class="left">datepicker</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-date-picker
                    v-model="value3"
                    type="date"
                    disabled
                    placeholder="选择日期"
                  >
                  </el-date-picker></div
              ></el-col>
            </el-row>
            <el-row>
              <el-col :span="6"><div class="left">datetimepicker</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-date-picker
                    v-model="value4"
                    disabled
                    type="datetime"
                    placeholder="选择日期时间"
                  >
                  </el-date-picker></div
              ></el-col>
            </el-row>
            <el-row>
              <el-col :span="6"><div class="left">lable</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-tag>lable1</el-tag>
                </div></el-col
              >
            </el-row>
            <el-row>
              <el-col :span="6"><div class="left">multiple lable</div></el-col>
              <el-col :span="18">
                <div class="right">
                  <el-tag>lable1</el-tag>
                  <el-tag type="success">lable2</el-tag>
                </div></el-col
              >
            </el-row>
          </div>
        </el-collapse-item>
      </el-collapse>

      <div style="margin-top: 20px">
        <el-button type="primary" size="small" @click="handleNext">next</el-button>
        <el-button type="info" size="small" @click="handleCancel">cancel</el-button>
      </div>
    </div>
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
      selectedType: null, //选择的field type
      value1: ["green", "red"],
      value2: "08:30",
      value3: "2022-03-30",
      value4: "2022-03-30 08:30",
    };
  },
  methods: {
    getFieldTypeList() {
      fieldTypeList({}).then((res) => {
        this.options = res.data;
      });
    },
    handleNext() {
      if (this.value == "") {
        this.$notify({
          title: "warning",
          message: "please select a field type",
          type: "warning",
        });
        return;
      }
      let obj = this.options.find((item) => item.id == this.value);
      let fieldType = obj.type;
      this.$router.push({
        path: "/example/addWorkflowField2",
        query: {
          fieldSolutionId: this.$route.query.fieldSolutionId,
          workflowNodeId: this.$route.query.workflowNodeId,
          workflowId: this.$route.query.workflowId,
          workflowSolutionId: this.$route.query.workflowSolutionId,
          fieldTypeId: this.value,
          fieldType: fieldType,
        },
      });
    },
    handleCancel() {
      this.$router.go(-1);
    },
  },
  created() {
    this.getFieldTypeList();
  },
};
</script>
<style lang="scss" scoped>
.add-area {
  width: 500px;
  .top {
    margin-bottom: 20px;
  }
  .display-area {
    height: 50%;
  }
  .el-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .left {
      text-align: right;
      padding-right: 10px;
    }
  }
}
</style>
