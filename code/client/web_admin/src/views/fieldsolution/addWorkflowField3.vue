<template>
  <div class="app-container">
    <!-- 单选类型是5，多选类型是6 -->
    <div>Config Select Value</div>
    <div>
      <!-- <el-form ref="ruleForm" :model="form" :rules="rules" label-width="150px">
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
      </el-form> -->

      <div class="form-area" v-for="(item, index) in option" :key="index">
        <div class="item">
          <span>name{{ index + 1 }}</span
          ><el-input v-model="item.name" style="width: 200px"></el-input>
        </div>
        <div class="item">
          <span>value{{ index + 1 }}</span
          ><el-input v-model="item.value" style="width: 200px"></el-input>
        </div>
        <div class="item">
          <span>selected</span>
          <el-switch
            v-model="item.selected"
            :active-value="1"
            :inactive-value="0"
            @change="changeItem(item, index)"
          >
          </el-switch>
        </div>
        <div>
          <i
            class="el-icon-circle-plus-outline"
            style="margin: 0 10px"
            @click="addItem(item, index)"
          ></i>
          <!-- <i class="el-icon-edit" style="margin:0 10px;"></i> -->
          <i
            class="el-icon-delete"
            style="margin: 0 10px"
            @click="deleteItem(item, index)"
          ></i>
        </div>
      </div>
      <div>
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
      option: [{ name: "", value: "", selected: 0 }],
      form: {
        name: "",
        value: "",
        selected: 0,
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
    getFieldDetails() {
      fieldDetails({
        fieldSolutionWorkflowNodeFieldTypeId:
          this.$route.query.fieldSolutionWorkflowNodeFieldTypeId,
      }).then((res) => {
        this.option = res.data.values;
        if (this.option.length == 0) {
          this.option = [{ name: "", value: "", selected: 0 }];
        }
      });
    },
    handleSave(formName) {
      if (this.$route.query.opeType == "edit") {
        this.handleUpdate();
        return;
      }
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
    addItem(item, index) {
      this.option.splice(index + 1, 0, { name: "", value: "", selected: 0 });
    },
    deleteItem(item, index) {
      this.option.splice(index, 1);
    },
    changeItem(item, index) {
      if (this.$route.query.fieldType == 6) return;
      //如果当前是默认则取消其他默认  只针对单选
      if (item.selected == 1) {
        for (let i = 0; i < this.option.length; i++) {
          if (i != index) {
            this.option[i].selected = 0;
          }
        }
      }
    },
  },
  created() {
    if (this.$route.query.opeType == "edit") {
      this.getFieldDetails();
    }
  },
};
</script>
<style lang="scss" scoped>
.form-area {
  display: flex;
  align-items: center;
  .item {
    padding: 20px;
    > span {
      padding-right: 10px;
    }
  }
}
</style>

